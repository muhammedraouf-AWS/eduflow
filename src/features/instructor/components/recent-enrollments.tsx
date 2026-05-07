import Image from "next/image";
import Link from "next/link";

import type { InstructorOverview } from "@/features/instructor/queries";

type Enrollment = InstructorOverview["recentEnrollments"][number];

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function EnrollmentRow({ enrollment }: { enrollment: Enrollment }) {
  const name = enrollment.user.name ?? enrollment.user.email ?? "Student";
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
        {enrollment.user.image ? (
          <Image src={enrollment.user.image} alt={name} fill sizes="32px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-xs font-bold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          enrolled in{" "}
          <Link
            href={`/courses/${enrollment.course.slug}`}
            className="hover:text-foreground hover:underline"
          >
            {enrollment.course.title}
          </Link>
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {timeAgo(enrollment.createdAt)}
      </span>
    </li>
  );
}

export function RecentEnrollments({
  enrollments,
}: {
  enrollments: InstructorOverview["recentEnrollments"];
}) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Recent enrollments</h2>
      </div>
      {enrollments.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No enrollments yet — publish a course to get started.
        </p>
      ) : (
        <ul className="divide-y px-5">
          {enrollments.map((e, i) => (
            <EnrollmentRow key={i} enrollment={e} />
          ))}
        </ul>
      )}
    </section>
  );
}
