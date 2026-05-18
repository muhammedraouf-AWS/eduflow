import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Star } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CheckoutForm } from "@/features/courses/components/checkout-form";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { title: true },
  });
  if (!course) return { title: "Checkout — EduFlow" };
  return { title: `Buy ${course.title} — EduFlow` };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { courseId } = await params;

  const [course, user] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnailUrl: true,
        price: true,
        avgRating: true,
        _count: { select: { enrollments: true } },
        instructor: {
          select: {
            user: { select: { name: true } },
            headline: true,
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!course || course.price === null) notFound();
  if (!user) redirect(`/login?callbackUrl=/checkout/${courseId}`);

  // Already enrolled — send them straight to the course
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });
  if (existing) redirect(`/courses/${course.slug}`);

  const price = Number(course.price);
  const rating = course.avgRating ? course.avgRating.toFixed(1) : null;

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto w-full max-w-4xl px-4">
        {/* Back link */}
        <Link
          href={`/courses/${course.slug}`}
          className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to course
        </Link>

        <h1 className="mb-8 text-2xl font-bold tracking-tight">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Payment panel */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold">Payment details</h2>
            <CheckoutForm courseId={course.id} price={price} />
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Order summary</h2>

              <div className="flex gap-3">
                {course.thumbnailUrl ? (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-20 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{course.title}</p>
                  {course.instructor.user.name && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      By {course.instructor.user.name}
                    </p>
                  )}
                  {rating && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-500">
                      <Star className="size-3 fill-amber-500" />
                      <span className="font-medium">{rating}</span>
                      <span className="text-muted-foreground">
                        ({course._count.enrollments.toLocaleString()} students)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Original price</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>${price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">30-Day Money-Back Guarantee</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Not satisfied? Get a full refund within 30 days, no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
