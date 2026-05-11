import "server-only";

import { db } from "@/lib/db";

export type EnrolledCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  totalChapters: number;
  completedChapters: number;
  continueChapterId: string | null;
  instructorName: string | null;
};

export async function getEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        include: {
          instructor: { select: { user: { select: { name: true } } } },
          chapters: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: {
              id: true,
              progress: {
                where: { userId },
                select: { isCompleted: true },
              },
            },
          },
        },
      },
    },
  });

  return enrollments.map(({ course }) => {
    const published = course.chapters;
    const totalChapters = published.length;
    const completedChapters = published.filter(
      (ch) => ch.progress[0]?.isCompleted === true,
    ).length;

    const firstIncomplete = published.find(
      (ch) => !ch.progress[0]?.isCompleted,
    );
    const continueChapterId =
      firstIncomplete?.id ?? published[0]?.id ?? null;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnailUrl: course.thumbnailUrl,
      totalChapters,
      completedChapters,
      continueChapterId,
      instructorName: course.instructor.user.name,
    };
  });
}
