import { Suspense } from "react";

import { CourseCard } from "@/components/shared/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveFilters } from "@/features/courses/components/active-filters";
import { CoursesFilters } from "@/features/courses/components/courses-filters";
import { CoursesPagination } from "@/features/courses/components/courses-pagination";
import { CoursesSearch } from "@/features/courses/components/courses-search";
import { CoursesSort } from "@/features/courses/components/courses-sort";
import { MobileFiltersToggle } from "@/features/courses/components/mobile-filters-toggle";
import { getCourseFilterMeta, getCourses } from "@/features/courses/queries";
import type { SortOption } from "@/features/courses/queries";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    level?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q = params.q ?? "";
  const category = params.category ?? "";
  const level = params.level ?? "";
  const sort = (params.sort as SortOption) || "popular";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const [{ courses, total, pages }, meta] = await Promise.all([
    getCourses({ q, category, level, sort, page }),
    getCourseFilterMeta(),
  ]);

  const activeCategoryName = meta.categories.find((c) => c.slug === category)?.name;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All courses</h1>
        <p className="mt-1 text-muted-foreground">
          {total.toLocaleString()} course{total !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Suspense>
          <CoursesSearch />
        </Suspense>
        <Suspense>
          <CoursesSort current={sort} />
        </Suspense>
      </div>

      {/* Active filters */}
      <div className="mb-6">
        <Suspense>
          <ActiveFilters
            q={q}
            category={category}
            level={level}
            categoryName={activeCategoryName}
          />
        </Suspense>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <div className="hidden w-52 shrink-0 lg:block">
          <Suspense>
            <CoursesFilters meta={meta} activeCategory={category} activeLevel={level} />
          </Suspense>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Mobile filters toggle */}
          <div className="mb-6">
            <Suspense>
              <MobileFiltersToggle>
                <CoursesFilters meta={meta} activeCategory={category} activeLevel={level} />
              </MobileFiltersToggle>
            </Suspense>
          </div>

          {courses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
              <p className="text-lg font-semibold">No courses found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search term.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              <Suspense>
                <CoursesPagination page={page} pages={pages} total={total} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return { title: "Courses — EduFlow" };
}
