"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function enrollAction(courseId: string, courseSlug: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/courses/${courseSlug}`);

  const course = await db.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { price: true },
  });

  if (!course) throw new Error("Course not found");

  if (course.price !== null) {
    // Paid course — Stripe not wired yet
    throw new Error("Payment not yet available. Please check back soon.");
  }

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId },
    update: {},
  });

  redirect(`/dashboard`);
}
