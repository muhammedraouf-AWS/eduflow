"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";

function revalidate(courseId: string, chapterId: string) {
  revalidatePath(`/teach/courses/${courseId}/chapters/${chapterId}`);
}

export async function createQuizAction(
  chapterId: string,
  courseId: string,
): Promise<{ success: true } | { error: string }> {
  await requireRole("INSTRUCTOR");

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, courseId },
    select: { id: true },
  });
  if (!chapter) return { error: "Chapter not found." };

  await db.quiz.create({ data: { chapterId, passMark: 70 } });
  revalidate(courseId, chapterId);
  return { success: true };
}

export async function updatePassMarkAction(
  quizId: string,
  passMark: number,
  courseId: string,
  chapterId: string,
): Promise<{ success: true } | { error: string }> {
  await requireRole("INSTRUCTOR");

  if (passMark < 1 || passMark > 100) return { error: "Pass mark must be 1–100." };

  await db.quiz.update({ where: { id: quizId }, data: { passMark } });
  revalidate(courseId, chapterId);
  return { success: true };
}

export async function addQuestionAction(
  quizId: string,
  courseId: string,
  chapterId: string,
  body: string,
  options: { body: string; isCorrect: boolean; position: number }[],
): Promise<{ success: true } | { error: string }> {
  await requireRole("INSTRUCTOR");

  if (!body.trim()) return { error: "Question text is required." };
  if (options.length < 2) return { error: "At least 2 options required." };
  if (options.filter((o) => o.isCorrect).length !== 1)
    return { error: "Exactly one option must be correct." };

  const count = await db.question.count({ where: { quizId } });

  await db.question.create({
    data: {
      quizId,
      body: body.trim(),
      position: count + 1,
      options: {
        create: options.map((o) => ({
          body: o.body.trim(),
          isCorrect: o.isCorrect,
          position: o.position,
        })),
      },
    },
  });

  revalidate(courseId, chapterId);
  return { success: true };
}

export async function deleteQuestionAction(
  questionId: string,
  courseId: string,
  chapterId: string,
): Promise<{ success: true } | { error: string }> {
  await requireRole("INSTRUCTOR");

  await db.question.delete({ where: { id: questionId } });
  revalidate(courseId, chapterId);
  return { success: true };
}

export async function deleteQuizAction(
  quizId: string,
  courseId: string,
  chapterId: string,
): Promise<{ success: true } | { error: string }> {
  await requireRole("INSTRUCTOR");

  await db.quiz.delete({ where: { id: quizId } });
  revalidate(courseId, chapterId);
  return { success: true };
}
