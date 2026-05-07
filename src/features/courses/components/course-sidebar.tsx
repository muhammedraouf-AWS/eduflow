import Image from "next/image";
import { Clock, LayoutList, Globe } from "lucide-react";

import { EnrollButton } from "@/features/courses/components/enroll-button";
import type { CourseDetail } from "@/features/courses/queries/course-detail";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
};

function totalDuration(chapters: CourseDetail["chapters"]) {
  const secs = chapters.reduce((sum, ch) => sum + (ch.videoDuration ?? 0), 0);
  if (secs === 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface CourseSidebarProps {
  course: CourseDetail;
  isEnrolled: boolean;
  isLoggedIn: boolean;
}

export function CourseSidebar({ course, isEnrolled, isLoggedIn }: CourseSidebarProps) {
  const duration = totalDuration(course.chapters);
  const price = course.price ? Number(course.price) : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg">
      {/* Thumbnail */}
      {course.thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 1024px) 100vw, 380px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 p-5">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          {price ? (
            <span className="text-3xl font-bold">${price.toFixed(2)}</span>
          ) : (
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Free</span>
          )}
        </div>

        {/* CTA */}
        <EnrollButton
          courseId={course.id}
          courseSlug={course.slug}
          price={price}
          isEnrolled={isEnrolled}
          isLoggedIn={isLoggedIn}
        />

        {/* Course info */}
        <ul className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <LayoutList className="size-4 shrink-0" />
            {course.chapters.length} chapter{course.chapters.length !== 1 ? "s" : ""}
          </li>
          {duration && (
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              {duration} of content
            </li>
          )}
          <li className="flex items-center gap-2">
            <LayoutList className="size-4 shrink-0" />
            {LEVEL_LABEL[course.level] ?? course.level}
          </li>
          <li className="flex items-center gap-2">
            <Globe className="size-4 shrink-0" />
            {course.language}
          </li>
        </ul>
      </div>
    </div>
  );
}
