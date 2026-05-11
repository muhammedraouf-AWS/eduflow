"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

export async function toggleProgressAction(
  chapterId: string,
  courseSlug: string,
): Promise<{ isCompleted: boolean } | { error: string }> {
  const user = await requireAuth();

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, isPublished: true },
    select: { id: true, course: { select: { id: true, slug: true } } },
  });

  if (!chapter) return { error: "Chapter not found" };

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: user.id, courseId: chapter.course.id },
    },
    select: { id: true },
  });

  if (!enrollment) return { error: "Not enrolled in this course" };

  const existing = await db.progress.findUnique({
    where: { userId_chapterId: { userId: user.id, chapterId } },
    select: { isCompleted: true },
  });

  const newValue = !(existing?.isCompleted ?? false);

  await db.progress.upsert({
    where: { userId_chapterId: { userId: user.id, chapterId } },
    create: { userId: user.id, chapterId, isCompleted: newValue },
    update: { isCompleted: newValue },
  });

  revalidatePath(`/learn/${courseSlug}/${chapterId}`);
  revalidatePath("/dashboard");
  return { isCompleted: newValue };
}
