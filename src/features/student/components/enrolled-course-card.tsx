import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2 } from "lucide-react";

import type { EnrolledCourse } from "@/features/student/queries/dashboard";

interface EnrolledCourseCardProps {
  course: EnrolledCourse;
}

export function EnrolledCourseCard({ course }: EnrolledCourseCardProps) {
  const pct =
    course.totalChapters > 0
      ? Math.round((course.completedChapters / course.totalChapters) * 100)
      : 0;

  const isComplete = pct === 100;
  const href = course.continueChapterId
    ? `/learn/${course.slug}/${course.continueChapterId}`
    : `/courses/${course.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-10 text-muted-foreground/40" />
          </div>
        )}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <CheckCircle2 className="size-10 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug">{course.title}</h3>
        {course.instructorName && (
          <p className="text-xs text-muted-foreground">{course.instructorName}</p>
        )}

        {/* Progress bar */}
        <div className="mt-auto space-y-1 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {course.completedChapters} / {course.totalChapters} lessons
            </span>
            <span className={isComplete ? "font-medium text-emerald-600 dark:text-emerald-400" : ""}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
