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

export type PlayerAttachment = {
  id: string;
  name: string;
  url: string;
  fileSize: number | null;
  mimeType: string | null;
};

export type PlayerQuiz = {
  id: string;
  passMark: number;
  questions: {
    id: string;
    body: string;
    position: number;
    options: { id: string; body: string; position: number }[];
  }[];
};

export type PlayerLatestAttempt = {
  score: number;
  passed: boolean;
  answers: unknown;
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
  attachments: PlayerAttachment[];
  note: string | null;
  isEnrolled: boolean;
  canWatch: boolean;
  quiz: PlayerQuiz | null;
  latestAttempt: PlayerLatestAttempt | null;
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
      attachments: {
        select: { id: true, name: true, url: true, fileSize: true, mimeType: true },
        orderBy: { createdAt: "asc" },
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
      // Quiz without isCorrect — never expose correct answers to the client
      quiz: {
        select: {
          id: true,
          passMark: true,
          questions: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              body: true,
              position: true,
              options: {
                orderBy: { position: "asc" },
                select: { id: true, body: true, position: true },
              },
            },
          },
        },
      },
    },
  });

  if (!chapter) return null;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    select: { id: true },
  });

  const isEnrolled = !!enrollment;
  const canWatch = isEnrolled || chapter.isFree;

  // Fetch note, progress, and latest quiz attempt in parallel
  const [noteRecord, progressRecords, latestAttempt] = await Promise.all([
    isEnrolled
      ? db.note.findUnique({
          where: { userId_chapterId: { userId, chapterId } },
          select: { body: true },
        })
      : Promise.resolve(null),
    db.progress.findMany({
      where: { userId, chapter: { courseId: course.id } },
      select: { chapterId: true, isCompleted: true },
    }),
    isEnrolled && chapter.quiz
      ? db.quizAttempt.findFirst({
          where: { quizId: chapter.quiz.id, userId },
          orderBy: { createdAt: "desc" },
          select: { score: true, passed: true, answers: true },
        })
      : Promise.resolve(null),
  ]);

  const progressMap = new Map(progressRecords.map((p) => [p.chapterId, p.isCompleted]));
  const chapterProgress = progressMap.get(chapterId) ?? false;
  const chapters: PlayerChapter[] = course.chapters.map((ch) => ({
    ...ch,
    isCompleted: progressMap.get(ch.id) ?? false,
  }));

  const { quiz: chapterQuiz, ...chapterFields } = chapter;

  return {
    course: { id: course.id, title: course.title, slug: course.slug },
    chapter: { ...chapterFields, isCompleted: chapterProgress },
    chapters,
    attachments: course.attachments,
    note: noteRecord?.body ?? null,
    isEnrolled,
    canWatch,
    quiz: chapterQuiz ?? null,
    latestAttempt: latestAttempt ?? null,
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
