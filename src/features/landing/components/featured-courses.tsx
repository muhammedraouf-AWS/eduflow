import Link from "next/link";

import { CourseCard } from "@/components/shared/course-card";
import type { FeaturedCourse } from "@/features/landing/queries";

export function FeaturedCourses({ courses }: { courses: FeaturedCourse[] }) {
  return (
    <section className="py-14">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Featured
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Most popular courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/courses"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all courses →
          </Link>
        </div>
      </div>
    </section>
  );
}
