import { db } from "@/lib/db";

export async function getCourseBySlug(slug: string) {
  return db.course.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shortDescription: true,
      thumbnailUrl: true,
      price: true,
      level: true,
      language: true,
      requirements: true,
      objectives: true,
      avgRating: true,
      totalStudents: true,
      publishedAt: true,
      category: { select: { name: true, color: true, slug: true } },
      instructor: {
        select: {
          id: true,
          bio: true,
          headline: true,
          avatarUrl: true,
          totalStudents: true,
          _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
          user: { select: { name: true, image: true } },
        },
      },
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          videoDuration: true,
          isFree: true,
          position: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          rating: true,
          body: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  });
}

export async function getEnrollmentStatus(userId: string, courseId: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  return !!enrollment;
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>;

export async function getUserReview(userId: string, courseId: string) {
  return db.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true, rating: true, body: true },
  });
}

export type UserReview = NonNullable<Awaited<ReturnType<typeof getUserReview>>>;
