"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";

export async function upsertNoteAction(
  chapterId: string,
  courseSlug: string,
  body: string,
): Promise<{ success: true } | { error: string }> {
  const user = await requireAuth();

  // Verify the chapter exists inside an enrolled course
  const chapter = await db.chapter.findFirst({
    where: {
      id: chapterId,
      isPublished: true,
      course: {
        slug: courseSlug,
        status: "PUBLISHED",
        enrollments: { some: { userId: user.id } },
      },
    },
    select: { id: true },
  });

  if (!chapter) return { error: "Not enrolled or chapter not found" };

  if (!body.trim()) {
    await db.note.deleteMany({ where: { userId: user.id, chapterId } });
  } else {
    await db.note.upsert({
      where: { userId_chapterId: { userId: user.id, chapterId } },
      update: { body },
      create: { userId: user.id, chapterId, body },
    });
  }

  revalidatePath(`/learn/${courseSlug}`);
  return { success: true };
}
