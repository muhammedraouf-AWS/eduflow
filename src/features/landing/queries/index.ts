import { db } from "@/lib/db";

export async function getFeaturedCourses() {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ enrollments: { _count: "desc" } }, { avgRating: "desc" }],
    take: 8,
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      thumbnailUrl: true,
      price: true,
      avgRating: true,
      level: true,
      _count: { select: { enrollments: true } },
      category: { select: { name: true, color: true, slug: true } },
      instructor: {
        select: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  });
  return courses.map((c) => ({ ...c, totalStudents: c._count.enrollments }));
}

export async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
    },
  });
}

export async function getLandingStats() {
  const [courses, instructors, students] = await Promise.all([
    db.course.count({ where: { status: "PUBLISHED" } }),
    db.instructorProfile.count(),
    db.enrollment.count(),
  ]);
  return { courses, instructors, students };
}

export async function getTopInstructors() {
  return db.instructorProfile.findMany({
    orderBy: { totalStudents: "desc" },
    take: 4,
    select: {
      id: true,
      headline: true,
      totalStudents: true,
      avatarUrl: true,
      user: { select: { name: true, image: true } },
      _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
    },
  });
}

export type FeaturedCourse = Awaited<ReturnType<typeof getFeaturedCourses>>[number];
export type LandingCategory = Awaited<ReturnType<typeof getCategories>>[number];
export type TopInstructor = Awaited<ReturnType<typeof getTopInstructors>>[number];
