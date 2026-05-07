import Image from "next/image";
import Link from "next/link";
import { Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { InstructorOverview } from "@/features/instructor/queries";

type Course = InstructorOverview["topCourses"][number];

const STATUS_VARIANTS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  PUBLISHED: { label: "Published", variant: "default" },
  DRAFT: { label: "Draft", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline" },
};

function TopCourseRow({ course }: { course: Course }) {
  const status = STATUS_VARIANTS[course.status] ?? STATUS_VARIANTS["DRAFT"]!;

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-muted to-muted-foreground/10" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/teach/courses/${course.id}/edit`}
          className="block truncate text-sm font-medium hover:text-primary hover:underline"
        >
          {course.title}
        </Link>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {course.totalStudents.toLocaleString()}
          </span>
          {course.avgRating && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="size-3 fill-amber-400" />
              {course.avgRating.toFixed(1)}
            </span>
          )}
          {course.price && (
            <span>${Number(course.price).toFixed(2)}</span>
          )}
        </div>
      </div>

      <Badge variant={status.variant} className="shrink-0 text-[11px]">
        {status.label}
      </Badge>
    </li>
  );
}

export function TopCourses({ courses }: { courses: InstructorOverview["topCourses"] }) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold">Your courses</h2>
        <Link
          href="/teach/courses"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          View all →
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No courses yet.{" "}
          <Link href="/teach/courses/new" className="text-primary hover:underline">
            Create your first course →
          </Link>
        </p>
      ) : (
        <ul className="divide-y px-5">
          {courses.map((course) => (
            <TopCourseRow key={course.id} course={course} />
          ))}
        </ul>
      )}
    </section>
  );
}
