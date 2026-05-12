"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/session";
import { db } from "@/lib/db";

export async function saveAttachmentAction(
  courseId: string,
  name: string,
  url: string,
  fileSize: number | null,
  mimeType: string | null,
): Promise<{ success: true; attachmentId: string } | { error: string }> {
  const user = await requireRole("INSTRUCTOR");

  const profile = await db.instructorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Instructor profile not found" };

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: { id: true, slug: true },
  });
  if (!course) return { error: "Course not found" };

  const attachment = await db.attachment.create({
    data: { courseId, name, url, fileSize, mimeType },
    select: { id: true },
  });

  revalidatePath(`/teach/courses/${courseId}/edit`);
  return { success: true, attachmentId: attachment.id };
}

export async function deleteAttachmentAction(
  attachmentId: string,
  courseId: string,
): Promise<{ success: true } | { error: string }> {
  const user = await requireRole("INSTRUCTOR");

  const profile = await db.instructorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Instructor profile not found" };

  const attachment = await db.attachment.findFirst({
    where: { id: attachmentId, courseId, course: { instructorId: profile.id } },
    select: { id: true },
  });
  if (!attachment) return { error: "Attachment not found" };

  await db.attachment.delete({ where: { id: attachmentId } });

  revalidatePath(`/teach/courses/${courseId}/edit`);
  return { success: true };
}
