import "server-only";

import { db } from "@/lib/db";

export async function getChapterQuiz(chapterId: string) {
  return db.quiz.findUnique({
    where: { chapterId },
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
            select: { id: true, body: true, isCorrect: true, position: true },
          },
        },
      },
    },
  });
}

export type ChapterQuiz = NonNullable<Awaited<ReturnType<typeof getChapterQuiz>>>;
