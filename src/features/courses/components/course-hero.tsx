import { Globe, LayoutList, Star, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { CourseDetail } from "@/features/courses/queries/course-detail";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
};

function formatStudents(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export function CourseHero({ course }: { course: CourseDetail }) {
  return (
    <div className="border-b bg-foreground text-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:pr-[22rem]">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs opacity-70">
          <Link href="/courses" className="hover:opacity-100">
            Courses
          </Link>
          {course.category && (
            <>
              <span>/</span>
              <Link
                href={`/courses?category=${course.category.slug}`}
                className="hover:opacity-100"
              >
                {course.category.name}
              </Link>
            </>
          )}
        </nav>

        <h1 className="max-w-2xl text-balance text-3xl font-bold leading-tight md:text-4xl">
          {course.title}
        </h1>

        {course.shortDescription && (
          <p className="mt-3 max-w-2xl text-base opacity-85">{course.shortDescription}</p>
        )}

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {course.avgRating && (
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="size-4 fill-amber-400" />
              {course.avgRating.toFixed(1)}
              <span className="font-normal opacity-70">
                ({course.reviews.length} reviews)
              </span>
            </span>
          )}
          <span className="flex items-center gap-1 opacity-80">
            <Users className="size-4" />
            {formatStudents(course.totalStudents)} students
          </span>
          <span className="flex items-center gap-1 opacity-80">
            <LayoutList className="size-4" />
            {LEVEL_LABEL[course.level] ?? course.level}
          </span>
          <span className="flex items-center gap-1 opacity-80">
            <Globe className="size-4" />
            {course.language}
          </span>
        </div>

        {/* Instructor */}
        <p className="mt-3 text-sm opacity-80">
          Created by{" "}
          <span className="font-medium opacity-100">{course.instructor.user.name}</span>
        </p>

        {/* Category badge */}
        {course.category && (
          <div className="mt-4">
            <Badge
              className="border-0 text-white"
              style={{ backgroundColor: course.category.color ?? "#64748b" }}
            >
              {course.category.name}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
