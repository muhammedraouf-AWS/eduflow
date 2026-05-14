"use server";

import crypto from "crypto";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * Awards a certificate when the student has completed all published chapters.
 * Idempotent — returns the existing code if one already exists.
 */
export async function awardCertificateAction(
  courseId: string,
  courseSlug: string,
): Promise<{ code: string } | { error: string }> {
  const user = await requireAuth();

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });
  if (!enrollment) return { error: "Not enrolled in this course" };

  // Check if all published chapters are complete
  const publishedChapters = await db.chapter.findMany({
    where: { courseId, isPublished: true },
    select: { id: true },
  });

  if (publishedChapters.length === 0) return { error: "No published chapters" };

  const completedCount = await db.progress.count({
    where: {
      userId: user.id,
      chapterId: { in: publishedChapters.map((c) => c.id) },
      isCompleted: true,
    },
  });

  if (completedCount < publishedChapters.length) {
    return { error: "Not all chapters completed yet" };
  }

  // Idempotent upsert — safe to call multiple times
  const existing = await db.certificate.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { code: true },
  });
  if (existing) return { code: existing.code };

  const code = crypto.randomBytes(16).toString("hex");
  const cert = await db.certificate.create({
    data: { code, userId: user.id, courseId },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/learn/${courseSlug}`);

  return { code: cert.code };
}
