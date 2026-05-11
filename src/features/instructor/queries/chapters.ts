import "server-only";

import { db } from "@/lib/db";

export type ChapterForList = {
  id: string;
  title: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  videoDuration: number | null;
};

export type ChapterForEdit = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  videoDuration: number | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
};

export async function getCourseChapters(
  courseId: string,
  instructorUserId: string,
): Promise<ChapterForList[] | null> {
  const profile = await db.instructorProfile.findUnique({
    where: { userId: instructorUserId },
    select: { id: true },
  });
  if (!profile) return null;

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: { id: true },
  });
  if (!course) return null;

  return db.chapter.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      position: true,
      isPublished: true,
      isFree: true,
      videoDuration: true,
    },
  });
}

export async function getChapterForEdit(
  chapterId: string,
  courseId: string,
  instructorUserId: string,
): Promise<ChapterForEdit | null> {
  const profile = await db.instructorProfile.findUnique({
    where: { userId: instructorUserId },
    select: { id: true },
  });
  if (!profile) return null;

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: { id: true },
  });
  if (!course) return null;

  return db.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      videoDuration: true,
      position: true,
      isPublished: true,
      isFree: true,
      courseId: true,
    },
  });
}
