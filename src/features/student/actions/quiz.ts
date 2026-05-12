"use server";

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

type Answer = { questionId: string; selectedOptionId: string };

export type QuizResult = {
  score: number;
  passed: boolean;
  results: { questionId: string; selectedOptionId: string; correctOptionId: string }[];
};

export async function submitQuizAttemptAction(
  quizId: string,
  answers: Answer[],
): Promise<QuizResult | { error: string }> {
  const user = await requireAuth();

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    select: {
      passMark: true,
      chapter: { select: { courseId: true } },
      questions: {
        select: {
          id: true,
          options: { select: { id: true, isCorrect: true } },
        },
      },
    },
  });

  if (!quiz) return { error: "Quiz not found." };

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: quiz.chapter.courseId } },
    select: { id: true },
  });
  if (!enrollment) return { error: "Not enrolled in this course." };

  // Grade server-side — isCorrect never leaves the server
  let correct = 0;
  const results = quiz.questions.map((q) => {
    const correctOption = q.options.find((o) => o.isCorrect);
    const selectedOptionId =
      answers.find((a) => a.questionId === q.id)?.selectedOptionId ?? "";
    if (selectedOptionId === correctOption?.id) correct++;
    return {
      questionId: q.id,
      selectedOptionId,
      correctOptionId: correctOption?.id ?? "",
    };
  });

  const score =
    quiz.questions.length > 0
      ? Math.round((correct / quiz.questions.length) * 100)
      : 0;
  const passed = score >= quiz.passMark;

  await db.quizAttempt.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { quizId, userId: user.id, score, passed, answers: answers as any },
  });

  return { score, passed, results };
}
