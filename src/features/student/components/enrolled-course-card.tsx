import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, CheckCircle2 } from "lucide-react";

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
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {/* Thumbnail — links to player */}
      <Link href={href} className="relative block aspect-video w-full bg-muted">
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
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={href}>
          <h3 className="line-clamp-2 font-semibold leading-snug hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
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

        {/* Certificate button (only when complete + cert exists) */}
        {isComplete && course.certificateCode && (
          <Link
            href={`/certificates/${course.certificateCode}`}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
          >
            <Award className="size-3.5" />
            View Certificate
          </Link>
        )}
      </div>
    </div>
  );
}
