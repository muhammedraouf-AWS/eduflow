import "server-only";

import { db } from "@/lib/db";

export async function getAdminCourses(search?: string, status?: string) {
  const validStatuses = ["PUBLISHED", "DRAFT", "ARCHIVED"];
  const statusFilter = validStatuses.includes(status ?? "") ? status : undefined;

  const courses = await db.course.findMany({
    where: {
      ...(search && { title: { contains: search, mode: "insensitive" } }),
      ...(statusFilter && { status: statusFilter as "PUBLISHED" | "DRAFT" | "ARCHIVED" }),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      thumbnailUrl: true,
      price: true,
      avgRating: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      instructor: {
        select: { user: { select: { name: true, email: true } } },
      },
      _count: { select: { enrollments: true, chapters: true } },
    },
  });

  return courses.map((c) => ({
    ...c,
    price: c.price !== null ? Number(c.price) : null,
  }));
}

export type AdminCourse = Awaited<ReturnType<typeof getAdminCourses>>[number];
