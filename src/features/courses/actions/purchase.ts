"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function fakePurchaseAction(courseId: string) {
  const user = await requireAuth();

  const course = await db.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { price: true, instructorId: true },
  });

  if (!course) throw new Error("Course not found");
  if (course.price === null) throw new Error("This course is free — use the enroll flow.");

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });

  if (!existing) {
    await db.$transaction([
      db.purchase.create({
        data: {
          userId: user.id,
          courseId,
          amount: course.price,
          currency: "usd",
          stripePaymentIntentId: `sim_${Date.now()}`,
        },
      }),
      db.enrollment.create({ data: { userId: user.id, courseId } }),
      db.course.update({
        where: { id: courseId },
        data: { totalStudents: { increment: 1 } },
      }),
      db.instructorProfile.update({
        where: { id: course.instructorId },
        data: { totalStudents: { increment: 1 } },
      }),
    ]);
  }

  const firstChapter = await db.chapter.findFirst({
    where: { courseId, isPublished: true },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  const courseSlug = await db.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });

  if (firstChapter && courseSlug) {
    redirect(`/learn/${courseSlug.slug}/${firstChapter.id}`);
  }

  redirect("/dashboard");
}
