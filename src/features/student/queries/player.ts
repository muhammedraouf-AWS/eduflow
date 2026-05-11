import "server-only";

import { db } from "@/lib/db";

export type PlayerChapter = {
  id: string;
  title: string;
  position: number;
  videoDuration: number | null;
  isFree: boolean;
  isCompleted: boolean;
};

export type PlayerCourse = {
  id: string;
  title: string;
  slug: string;
};

export type PlayerData = {
  course: PlayerCourse;
  chapter: {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    videoDuration: number | null;
    isFree: boolean;
    isCompleted: boolean;
  };
  chapters: PlayerChapter[];
  isEnrolled: boolean;
  canWatch: boolean;
};

export async function getCoursePlayer(
  slug: string,
  chapterId: string,
  userId: string,
): Promise<PlayerData | null> {
  const course = await db.course.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          position: true,
          videoDuration: true,
          isFree: true,
        },
      },
    },
  });

  if (!course) return null;

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId: course.id, isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      videoDuration: true,
      isFree: true,
    },
  });

  if (!chapter) return null;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    select: { id: true },
  });

  const isEnrolled = !!enrollment;
  const canWatch = isEnrolled || chapter.isFree;

  // Fetch completed chapter IDs for this student
  const progressRecords = await db.progress.findMany({
    where: { userId, chapter: { courseId: course.id } },
    select: { chapterId: true, isCompleted: true },
  });
  const progressMap = new Map(progressRecords.map((p) => [p.chapterId, p.isCompleted]));

  const chapterProgress = progressMap.get(chapterId) ?? false;

  const chapters: PlayerChapter[] = course.chapters.map((ch) => ({
    ...ch,
    isCompleted: progressMap.get(ch.id) ?? false,
  }));

  return {
    course: { id: course.id, title: course.title, slug: course.slug },
    chapter: { ...chapter, isCompleted: chapterProgress },
    chapters,
    isEnrolled,
    canWatch,
  };
}

export async function getFirstChapterId(
  slug: string,
  userId: string,
): Promise<{ chapterId: string; slug: string } | null> {
  const course = await db.course.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      slug: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: { id: true },
      },
      enrollments: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  if (!course) return null;

  const isEnrolled = course.enrollments.length > 0;
  if (!isEnrolled) return null;

  const firstChapter = course.chapters[0];
  if (!firstChapter) return null;

  return { chapterId: firstChapter.id, slug: course.slug };
}
