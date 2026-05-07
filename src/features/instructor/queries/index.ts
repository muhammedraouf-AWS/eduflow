import { db } from "@/lib/db";

export async function getInstructorProfile(userId: string) {
  return db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true, headline: true, totalStudents: true },
  });
}

export async function getInstructorOverview(userId: string) {
  const profile = await db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true, totalStudents: true },
  });

  if (!profile) return null;

  const [courseStats, publishedCount, draftCount, recentEnrollments, topCourses] =
    await Promise.all([
      db.course.aggregate({
        where: { instructorId: profile.id },
        _count: { id: true },
        _avg: { avgRating: true },
      }),
      db.course.count({ where: { instructorId: profile.id, status: "PUBLISHED" } }),
      db.course.count({ where: { instructorId: profile.id, status: "DRAFT" } }),
      db.enrollment.findMany({
        where: { course: { instructorId: profile.id } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          createdAt: true,
          user: { select: { name: true, image: true, email: true } },
          course: { select: { title: true, slug: true } },
        },
      }),
      db.course.findMany({
        where: { instructorId: profile.id },
        orderBy: { totalStudents: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          status: true,
          totalStudents: true,
          avgRating: true,
          price: true,
        },
      }),
    ]);

  return {
    stats: {
      totalStudents: profile.totalStudents,
      totalCourses: courseStats._count.id,
      publishedCourses: publishedCount,
      draftCourses: draftCount,
      avgRating: courseStats._avg.avgRating,
    },
    recentEnrollments,
    topCourses,
  };
}

export type InstructorOverview = NonNullable<Awaited<ReturnType<typeof getInstructorOverview>>>;
