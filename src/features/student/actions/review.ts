"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

async function recalcAvgRating(courseId: string) {
  const agg = await db.review.aggregate({
    where: { courseId },
    _avg: { rating: true },
  });
  await db.course.update({
    where: { id: courseId },
    data: { avgRating: agg._avg.rating },
  });
}

export async function submitReviewAction(
  courseId: string,
  rating: number,
  body?: string,
): Promise<{ success: true } | { error: string }> {
  const user = await requireAuth();

  if (rating < 1 || rating > 5) return { error: "Rating must be between 1 and 5." };

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });
  if (!enrollment) return { error: "You must be enrolled to review this course." };

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  if (!course) return { error: "Course not found." };

  await db.review.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId, rating, body: body?.trim() || null },
    update: { rating, body: body?.trim() || null },
  });

  await recalcAvgRating(courseId);
  revalidatePath(`/courses/${course.slug}`);
  return { success: true };
}

export async function deleteReviewAction(
  courseId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await requireAuth();

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  if (!course) return { error: "Course not found." };

  await db.review.deleteMany({
    where: { userId: user.id, courseId },
  });

  await recalcAvgRating(courseId);
  revalidatePath(`/courses/${course.slug}`);
  return { success: true };
}
