"use server";

import crypto from "crypto";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

export async function toggleProgressAction(
  chapterId: string,
  courseSlug: string,
): Promise<{ isCompleted: boolean; certificateCode?: string } | { error: string }> {
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

  // Auto-award certificate when marking complete (not when un-marking)
  if (newValue) {
    const courseId = chapter.course.id;

    const publishedChapters = await db.chapter.findMany({
      where: { courseId, isPublished: true },
      select: { id: true },
    });

    const completedCount = await db.progress.count({
      where: {
        userId: user.id,
        chapterId: { in: publishedChapters.map((c) => c.id) },
        isCompleted: true,
      },
    });

    if (completedCount === publishedChapters.length && publishedChapters.length > 0) {
      // Idempotent — only create if one doesn't exist yet
      const existing = await db.certificate.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
        select: { code: true },
      });

      const code =
        existing?.code ??
        (
          await db.certificate.create({
            data: {
              code: crypto.randomBytes(16).toString("hex"),
              userId: user.id,
              courseId,
            },
          })
        ).code;

      revalidatePath(`/learn/${courseSlug}`);
      return { isCompleted: newValue, certificateCode: code };
    }
  }

  return { isCompleted: newValue };
}
