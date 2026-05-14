import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseRowActions } from "@/features/instructor/components/course-row-actions";
import type { InstructorCourse } from "@/features/instructor/queries/courses";

function formatPrice(price: number | null): string {
  if (price === null) return "Free";
  return `$${price.toFixed(2)}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(date),
  );
}

interface InstructorCoursesTableProps {
  courses: InstructorCourse[];
}

export function InstructorCoursesTable({ courses }: InstructorCoursesTableProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <BookOpen className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">No courses yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first course to start teaching.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/teach/courses/new" />}
        >
          Create your first course
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      {/* Header row — hidden on mobile */}
      <div className="hidden grid-cols-[2fr_1fr_80px_90px_100px_108px] items-center gap-4 border-b bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground lg:grid">
        <span>Course</span>
        <span>Category</span>
        <span>Status</span>
        <span>Students</span>
        <span>Updated</span>
        <span>Actions</span>
      </div>

      <div className="divide-y">
        {courses.map((course) => (
          <div
            key={course.id}
            className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30 lg:grid-cols-[2fr_1fr_80px_90px_100px_108px]"
          >
            {/* Thumbnail + title */}
            <div className="flex items-center gap-3 min-w-0">
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
                  <div className="size-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/teach/courses/${course.id}/edit`}
                  className="line-clamp-2 text-sm font-medium hover:text-primary"
                >
                  {course.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatPrice(course.price)}</p>
              </div>
            </div>

            {/* Category */}
            <span className="hidden text-sm text-muted-foreground lg:block">
              {course.category?.name ?? "—"}
            </span>

            {/* Status */}
            <div>
              <Badge
                variant={course.status === "PUBLISHED" ? "default" : "outline"}
                className="text-[11px]"
              >
                {course.status === "PUBLISHED" ? "Published" : "Draft"}
              </Badge>
            </div>

            {/* Students */}
            <span className="hidden text-sm text-muted-foreground lg:block">
              {course._count.enrollments.toLocaleString()}
            </span>

            {/* Updated */}
            <span className="hidden text-xs text-muted-foreground lg:block">
              {formatDate(course.updatedAt)}
            </span>

            {/* Actions */}
            <CourseRowActions courseId={course.id} status={course.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
