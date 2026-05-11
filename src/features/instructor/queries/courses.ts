import "server-only";

import { db } from "@/lib/db";

export async function getInstructorCourses(userId: string) {
  const profile = await db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  const courses = await db.course.findMany({
    where: { instructorId: profile.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      thumbnailUrl: true,
      price: true,
      totalStudents: true,
      updatedAt: true,
      category: { select: { name: true, color: true } },
    },
  });

  return courses.map((c) => ({
    ...c,
    price: c.price !== null ? Number(c.price) : null,
  }));
}

export async function getCourseForEdit(courseId: string, userId: string) {
  const profile = await db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      thumbnailUrl: true,
      price: true,
      status: true,
      level: true,
      language: true,
      requirements: true,
      objectives: true,
      categoryId: true,
      publishedAt: true,
      createdAt: true,
      category: { select: { id: true, name: true } },
    },
  });

  if (!course) return null;

  return {
    ...course,
    price: course.price !== null ? Number(course.price) : null,
  };
}

export async function getInstructorCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export type InstructorCourse = Awaited<ReturnType<typeof getInstructorCourses>>[number];
export type CourseForEdit = NonNullable<Awaited<ReturnType<typeof getCourseForEdit>>>;
