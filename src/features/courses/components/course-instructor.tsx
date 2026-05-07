import Image from "next/image";
import { Users, BookOpen } from "lucide-react";

import type { CourseDetail } from "@/features/courses/queries/course-detail";

function formatStudents(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function CourseInstructor({ instructor }: { instructor: CourseDetail["instructor"] }) {
  const name = instructor.user.name ?? "Instructor";
  const avatarSrc = instructor.avatarUrl ?? instructor.user.image;

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Your instructor</h2>

      <div className="flex items-start gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-border">
          {avatarSrc ? (
            <Image src={avatarSrc} alt={name} fill sizes="64px" className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-xl font-bold text-muted-foreground">
              {name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-semibold">{name}</p>
          {instructor.headline && (
            <p className="text-sm text-muted-foreground">{instructor.headline}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {formatStudents(instructor.totalStudents)} students
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {instructor._count.courses} course{instructor._count.courses !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {instructor.bio && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{instructor.bio}</p>
      )}
    </section>
  );
}
