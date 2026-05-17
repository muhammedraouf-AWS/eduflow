"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import {
  createCourseSchema,
  updateCourseSchema,
} from "@/features/instructor/validations/course";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getProfile(userId: string) {
  return db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
}

export async function createCourseAction(
  input: unknown,
): Promise<{ error: string } | { courseId: string }> {
  const user = await requireAuth();
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  const parsed = createCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const profile = await getProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const { title, categoryId } = parsed.data;
  const base = slugify(title);
  const suffix = Math.random().toString(36).slice(2, 7);
  const slug = `${base}-${suffix}`;

  const course = await db.course.create({
    data: { title, slug, instructorId: profile.id, categoryId: categoryId ?? null },
    select: { id: true },
  });

  revalidatePath("/teach/courses");
  return { courseId: course.id };
}

export async function updateCourseAction(
  courseId: string,
  input: unknown,
): Promise<{ error: string } | { success: true }> {
  const user = await requireAuth();

  const parsed = updateCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const profile = await getProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const owned = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: { id: true },
  });
  if (!owned) return { error: "Course not found" };

  const { price, ...rest } = parsed.data;

  await db.course.update({
    where: { id: courseId },
    data: {
      ...rest,
      ...(price !== undefined ? { price } : {}),
    },
  });

  revalidatePath(`/teach/courses/${courseId}/edit`);
  revalidatePath("/teach/courses");
  revalidatePath("/courses");
  return { success: true };
}

export async function togglePublishAction(
  courseId: string,
): Promise<{ error: string } | { success: true }> {
  const user = await requireAuth();

  const profile = await getProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: { id: true, status: true },
  });
  if (!course) return { error: "Course not found" };

  const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await db.course.update({
    where: { id: courseId },
    data: {
      status: newStatus,
      publishedAt: newStatus === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath(`/teach/courses/${courseId}/edit`);
  revalidatePath("/teach/courses");
  revalidatePath("/courses");
  return { success: true };
}

export async function deleteCourseAction(
  courseId: string,
): Promise<{ error: string } | { success: true }> {
  const user = await requireAuth();

  const profile = await getProfile(user.id);
  if (!profile) return { error: "Instructor profile not found" };

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: { id: true, _count: { select: { enrollments: true } } },
  });
  if (!course) return { error: "Course not found" };

  if (course._count.enrollments > 0) {
    return {
      error: "Cannot delete a course with enrolled students.",
    };
  }

  await db.course.delete({ where: { id: courseId } });
  revalidatePath("/teach/courses");
  return { success: true };
}
