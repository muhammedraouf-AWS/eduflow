import { Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { FeaturedCourse } from "@/features/landing/queries";

function formatStudents(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

function formatPrice(price: FeaturedCourse["price"]): string {
  if (!price) return "Free";
  return `$${Number(price).toFixed(2)}`;
}

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
};

export function CourseCard({ course }: { course: FeaturedCourse }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-muted to-muted-foreground/10" />
        )}
        {course.category && (
          <span
            className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: course.category.color ?? "#64748b" }}
          >
            {course.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {course.title}
        </h3>

        {course.instructor.user.name && (
          <p className="text-xs text-muted-foreground">{course.instructor.user.name}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {course.avgRating && (
              <span className="flex items-center gap-1 font-medium text-amber-500">
                <Star className="size-3 fill-amber-500" />
                {course.avgRating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {formatStudents(course.totalStudents)}
            </span>
            <span>{levelLabel[course.level] ?? course.level}</span>
          </div>
          <span className="text-sm font-bold">{formatPrice(course.price)}</span>
        </div>
      </div>
    </Link>
  );
}
