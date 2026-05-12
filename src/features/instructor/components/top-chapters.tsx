import { CheckCircle2 } from "lucide-react";

import type { InstructorAnalytics } from "@/features/instructor/queries/analytics";

export function TopChapters({
  chapters,
}: {
  chapters: InstructorAnalytics["topChapters"];
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4">
        <h2 className="font-semibold">Top chapters</h2>
        <p className="text-xs text-muted-foreground">By completion count</p>
      </div>

      {chapters.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No completion data yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {chapters.map((ch, i) => (
            <li key={ch.chapterId} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">{ch.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {ch.courseTitle}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                {ch.completions}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
