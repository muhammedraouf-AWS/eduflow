"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import {
  createChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
  type CreateChapterInput,
  type UpdateChapterInput,
  type ReorderChaptersInput,
} from "@/features/instructor/validations/chapter";

async function getInstructorProfile(userId: string) {
  return db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
}

async function verifyCourseOwnership(courseId: string, instructorId: string) {
  return db.course.findFirst({
    where: { id: courseId, instructorId },
    select: { id: true },
  });
}

async function verifyChapterOwnership(chapterId: string, courseId: string) {
  return db.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: { id: true },
  });
}

export async function createChapterAction(
  courseId: string,
  data: CreateChapterInput,
): Promise<{ chapterId: string } | { error: string }> {
  const user = await requireAuth();

  const parsed = createChapterSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error?.issues[0]?.message ?? "Invalid input" };

  const profile = await getInstructorProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await verifyCourseOwnership(courseId, profile.id);
  if (!course) return { error: "Course not found" };

  const last = await db.chapter.findFirst({
    where: { courseId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1;

  const chapter = await db.chapter.create({
    data: { title: parsed.data.title, courseId, position },
    select: { id: true },
  });

  revalidatePath(`/teach/courses/${courseId}/edit`);
  return { chapterId: chapter.id };
}

export async function updateChapterAction(
  chapterId: string,
  courseId: string,
  data: UpdateChapterInput,
): Promise<{ success: true } | { error: string }> {
  const user = await requireAuth();

  const parsed = updateChapterSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error?.issues[0]?.message ?? "Invalid input" };

  const profile = await getInstructorProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await verifyCourseOwnership(courseId, profile.id);
  if (!course) return { error: "Course not found" };

  const chapter = await verifyChapterOwnership(chapterId, courseId);
  if (!chapter) return { error: "Chapter not found" };

  await db.chapter.update({
    where: { id: chapterId },
    data: parsed.data,
  });

  revalidatePath(`/teach/courses/${courseId}/chapters/${chapterId}`);
  revalidatePath(`/teach/courses/${courseId}/edit`);
  return { success: true };
}

export async function reorderChaptersAction(
  courseId: string,
  data: ReorderChaptersInput,
): Promise<{ success: true } | { error: string }> {
  const user = await requireAuth();

  const parsed = reorderChaptersSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error?.issues[0]?.message ?? "Invalid input" };

  const profile = await getInstructorProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await verifyCourseOwnership(courseId, profile.id);
  if (!course) return { error: "Course not found" };

  await db.$transaction(
    parsed.data.chapters.map(({ id, position }) =>
      db.chapter.update({ where: { id, courseId }, data: { position } }),
    ),
  );

  revalidatePath(`/teach/courses/${courseId}/edit`);
  return { success: true };
}

export async function toggleChapterPublishAction(
  chapterId: string,
  courseId: string,
): Promise<{ isPublished: boolean } | { error: string }> {
  const user = await requireAuth();

  const profile = await getInstructorProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await verifyCourseOwnership(courseId, profile.id);
  if (!course) return { error: "Course not found" };

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: { isPublished: true },
  });
  if (!chapter) return { error: "Chapter not found" };

  const updated = await db.chapter.update({
    where: { id: chapterId },
    data: { isPublished: !chapter.isPublished },
    select: { isPublished: true },
  });

  revalidatePath(`/teach/courses/${courseId}/chapters/${chapterId}`);
  revalidatePath(`/teach/courses/${courseId}/edit`);
  return { isPublished: updated.isPublished };
}

export async function toggleChapterFreeAction(
  chapterId: string,
  courseId: string,
): Promise<{ isFree: boolean } | { error: string }> {
  const user = await requireAuth();

  const profile = await getInstructorProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await verifyCourseOwnership(courseId, profile.id);
  if (!course) return { error: "Course not found" };

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: { isFree: true },
  });
  if (!chapter) return { error: "Chapter not found" };

  const updated = await db.chapter.update({
    where: { id: chapterId },
    data: { isFree: !chapter.isFree },
    select: { isFree: true },
  });

  revalidatePath(`/teach/courses/${courseId}/chapters/${chapterId}`);
  return { isFree: updated.isFree };
}

export async function deleteChapterAction(
  chapterId: string,
  courseId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await requireAuth();

  const profile = await getInstructorProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await verifyCourseOwnership(courseId, profile.id);
  if (!course) return { error: "Course not found" };

  const chapter = await verifyChapterOwnership(chapterId, courseId);
  if (!chapter) return { error: "Chapter not found" };

  await db.chapter.delete({ where: { id: chapterId } });

  // Re-sequence remaining chapters so positions stay contiguous
  const remaining = await db.chapter.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  await db.$transaction(
    remaining.map((c, idx) =>
      db.chapter.update({ where: { id: c.id }, data: { position: idx + 1 } }),
    ),
  );

  revalidatePath(`/teach/courses/${courseId}/edit`);
  return { success: true };
}
