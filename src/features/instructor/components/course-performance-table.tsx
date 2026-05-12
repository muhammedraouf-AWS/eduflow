import Link from "next/link";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { InstructorAnalytics } from "@/features/instructor/queries/analytics";

type Course = InstructorAnalytics["coursePerformance"][number];

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  PUBLISHED: { label: "Published", variant: "default" },
  DRAFT: { label: "Draft", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline" },
};

function CourseRow({ course }: { course: Course }) {
  const st = STATUS[course.status] ?? STATUS["DRAFT"]!;
  return (
    <tr className="border-t text-sm transition-colors hover:bg-muted/40">
      <td className="py-3 pl-5 pr-4">
        <Link
          href={`/teach/courses/${course.id}/edit`}
          className="font-medium hover:text-primary hover:underline"
        >
          {course.title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Badge variant={st.variant} className="text-[11px]">
          {st.label}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {course.totalStudents.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right">
        {course.avgRating ? (
          <span className="inline-flex items-center gap-1 text-amber-500">
            <Star className="size-3 fill-amber-400" />
            {course.avgRating.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
        {course.reviewCount}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
        {course.publishedChapters}
      </td>
      <td className="py-3 pl-4 pr-5 text-right tabular-nums">
        {course.revenue > 0 ? (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            ${course.revenue.toFixed(2)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

export function CoursePerformanceTable({
  courses,
}: {
  courses: InstructorAnalytics["coursePerformance"];
}) {
  if (courses.length === 0) {
    return (
      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold">Course performance</h2>
        <p className="py-8 text-center text-sm text-muted-foreground">
          No courses yet.{" "}
          <Link href="/teach/courses/new" className="text-primary hover:underline">
            Create one →
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Course performance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 pl-5 pr-4 pt-3 font-medium">Course</th>
              <th className="px-4 pb-2 pt-3 font-medium">Status</th>
              <th className="px-4 pb-2 pt-3 text-right font-medium">Students</th>
              <th className="px-4 pb-2 pt-3 text-right font-medium">Rating</th>
              <th className="px-4 pb-2 pt-3 text-right font-medium">Reviews</th>
              <th className="px-4 pb-2 pt-3 text-right font-medium">Chapters</th>
              <th className="pb-2 pl-4 pr-5 pt-3 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
