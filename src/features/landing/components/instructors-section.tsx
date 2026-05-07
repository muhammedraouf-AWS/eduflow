import Image from "next/image";
import Link from "next/link";

import type { TopInstructor } from "@/features/landing/queries";

function formatStudents(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function InstructorsSection({ instructors }: { instructors: TopInstructor[] }) {
  return (
    <section className="border-b bg-muted/20 py-14">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Instructors
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Learn from the best
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {instructors.map((instructor) => {
            const avatarSrc = instructor.avatarUrl ?? instructor.user.image;
            const name = instructor.user.name ?? "Instructor";

            return (
              <div
                key={instructor.id}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center"
              >
                <div className="relative size-16 overflow-hidden rounded-full bg-muted ring-2 ring-border">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xl font-bold text-muted-foreground">
                      {name.charAt(0)}
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-semibold">{name}</p>
                  {instructor.headline && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {instructor.headline}
                    </p>
                  )}
                </div>

                <div className="flex w-full justify-center gap-4 border-t pt-3 text-xs text-muted-foreground">
                  <span>
                    <strong className="font-semibold text-foreground">
                      {formatStudents(instructor.totalStudents)}
                    </strong>{" "}
                    students
                  </span>
                  <span>
                    <strong className="font-semibold text-foreground">
                      {instructor._count.courses}
                    </strong>{" "}
                    courses
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/teach"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Become an instructor →
          </Link>
        </div>
      </div>
    </section>
  );
}
