"use client";

import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerChapter } from "@/features/student/queries/player";

interface PlayerSidebarProps {
  courseSlug: string;
  chapters: PlayerChapter[];
  currentChapterId: string;
  isEnrolled: boolean;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PlayerSidebar({
  courseSlug,
  chapters,
  currentChapterId,
  isEnrolled,
}: PlayerSidebarProps) {
  const completed = chapters.filter((c) => c.isCompleted).length;

  return (
    <aside className="flex h-full flex-col border-l bg-card">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Course content
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {completed} / {chapters.length} completed
        </p>
      </div>

      {/* Chapter list */}
      <nav className="flex-1 overflow-y-auto">
        {chapters.map((chapter, idx) => {
          const isCurrent = chapter.id === currentChapterId;
          const canAccess = isEnrolled || chapter.isFree;

          return (
            <div
              key={chapter.id}
              className={cn(
                "group relative",
                isCurrent && "bg-accent",
              )}
            >
              {canAccess ? (
                <Link
                  href={`/learn/${courseSlug}/${chapter.id}`}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent",
                    isCurrent && "font-medium",
                  )}
                >
                  <span className="mt-0.5 shrink-0 text-muted-foreground">
                    {chapter.isCompleted ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <PlayCircle className="size-4 text-primary" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                  </span>
                  <span className="flex-1 leading-snug">
                    <span className="block">{chapter.title}</span>
                    {chapter.videoDuration !== null && (
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(chapter.videoDuration)}
                      </span>
                    )}
                  </span>
                </Link>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3 text-sm text-muted-foreground/60">
                  <span className="mt-0.5 shrink-0">
                    <Circle className="size-4" />
                  </span>
                  <span className="flex-1 leading-snug">
                    <span className="block">{chapter.title}</span>
                    <span className="text-xs">Enroll to unlock</span>
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute left-0 top-0 h-full w-0.5 bg-primary" />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
