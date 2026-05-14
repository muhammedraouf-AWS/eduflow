"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function adminSetCourseStatusAction(
  courseId: string,
  status: "PUBLISHED" | "ARCHIVED" | "DRAFT",
): Promise<{ success: true } | { error: string }> {
  await requireRole("ADMIN");

  const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return { error: "Course not found." };

  await db.course.update({
    where: { id: courseId },
    data: {
      status,
      ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
    },
  });

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function adminDeleteCourseAction(
  courseId: string,
): Promise<{ success: true } | { error: string }> {
  await requireRole("ADMIN");

  const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return { error: "Course not found." };

  await db.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/courses");
  return { success: true };
}
