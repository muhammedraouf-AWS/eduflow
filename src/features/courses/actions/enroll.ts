"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function enrollAction(courseId: string, courseSlug: string) {
  const user = await requireAuth();

  const course = await db.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: { price: true, instructorId: true },
  });

  if (!course) throw new Error("Course not found");

  if (course.price !== null) {
    // Paid course — Stripe not wired yet
    throw new Error("Payment not yet available. Please check back soon.");
  }

  // Only create + update counts if not already enrolled (upsert gives no signal)
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });

  if (!existing) {
    await db.$transaction([
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

  // Redirect to first published chapter if one exists
  const firstChapter = await db.chapter.findFirst({
    where: { courseId, isPublished: true },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  if (firstChapter) {
    redirect(`/learn/${courseSlug}/${firstChapter.id}`);
  }

  redirect(`/dashboard`);
}
