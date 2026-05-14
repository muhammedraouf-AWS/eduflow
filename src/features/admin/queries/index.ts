import "server-only";

import { db } from "@/lib/db";

export async function getAdminStats() {
  const [totalUsers, totalCourses, totalEnrollments, totalRevenue, recentUsers, recentEnrollments] =
    await Promise.all([
      db.user.count(),
      db.course.count(),
      db.enrollment.count(),
      db.purchase.aggregate({ _sum: { amount: true } }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
        },
      }),
      db.enrollment.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          createdAt: true,
          user: { select: { name: true, email: true, image: true } },
          course: { select: { title: true, slug: true } },
        },
      }),
    ]);

  const [studentCount, instructorCount, publishedCount, draftCount, archivedCount] =
    await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "INSTRUCTOR" } }),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.course.count({ where: { status: "DRAFT" } }),
      db.course.count({ where: { status: "ARCHIVED" } }),
    ]);

  return {
    stats: {
      totalUsers,
      studentCount,
      instructorCount,
      totalCourses,
      publishedCount,
      draftCount,
      archivedCount,
      totalEnrollments,
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    },
    recentUsers,
    recentEnrollments,
  };
}

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;
