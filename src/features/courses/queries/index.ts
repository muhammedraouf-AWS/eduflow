import { unstable_cache } from "next/cache";

import type { CourseLevel } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export const PAGE_SIZE = 12;

export type SortOption = "popular" | "rating" | "newest" | "price-low" | "price-high";

export interface CoursesFilter {
  q?: string;
  category?: string;
  level?: string;
  sort?: SortOption;
  page?: number;
}

const VALID_LEVELS: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"];

function buildOrderBy(sort: SortOption) {
  switch (sort) {
    case "rating":
      return { avgRating: "desc" as const };
    case "newest":
      return { publishedAt: "desc" as const };
    case "price-low":
      return { price: "asc" as const };
    case "price-high":
      return { price: "desc" as const };
    default:
      return { enrollments: { _count: "desc" as const } };
  }
}

export async function getCourses(filters: CoursesFilter = {}) {
  const { q, category, level, sort = "popular", page = 1 } = filters;

  const validLevel = VALID_LEVELS.includes(level as CourseLevel)
    ? (level as CourseLevel)
    : undefined;

  const where = {
    status: "PUBLISHED" as const,
    ...(q && { title: { contains: q, mode: "insensitive" as const } }),
    ...(category && { category: { slug: category } }),
    ...(validLevel && { level: validLevel }),
  };

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
          select: { user: { select: { name: true, image: true } } },
        },
      },
    }),
    db.course.count({ where }),
  ]);

  return {
    courses: courses.map((c) => ({ ...c, totalStudents: c._count.enrollments })),
    total,
    pages: Math.ceil(total / PAGE_SIZE),
  };
}

export const getCourseFilterMeta = unstable_cache(
  async () => {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        color: true,
        _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
      },
    });
    return { categories };
  },
  ["course-filter-meta"],
  { revalidate: 3600, tags: ["categories"] },
);

export type CourseRow = Awaited<ReturnType<typeof getCourses>>["courses"][number];
