"use client";

import { ChevronDown, Clock, Lock, PlayCircle } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { CourseDetail } from "@/features/courses/queries/course-detail";

function formatDuration(secs: number | null): string {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CourseCurriculum({ chapters }: { chapters: CourseDetail["chapters"] }) {
  const [expanded, setExpanded] = useState(true);

  if (chapters.length === 0) return null;

  const totalSecs = chapters.reduce((sum, ch) => sum + (ch.videoDuration ?? 0), 0);
  const totalMins = Math.floor(totalSecs / 60);

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Course curriculum</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        {chapters.length} lecture{chapters.length !== 1 ? "s" : ""}
        {totalMins > 0 && ` · ${totalMins} min total`}
      </p>

      <div className="overflow-hidden rounded-xl border">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-muted/50"
        >
          <span>All lectures</span>
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
          />
        </button>

        {expanded && (
          <ul className="divide-y">
            {chapters.map((ch) => (
              <li
                key={ch.id}
                className="flex items-center gap-3 px-5 py-3 text-sm"
              >
                {ch.isFree ? (
                  <PlayCircle className="size-4 shrink-0 text-primary" />
                ) : (
                  <Lock className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1">{ch.title}</span>
                {ch.isFree && (
                  <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium text-primary">
                    Preview
                  </span>
                )}
                {ch.videoDuration && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatDuration(ch.videoDuration)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
