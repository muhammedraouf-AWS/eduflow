"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterRowProps {
  id: string;
  title: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  videoDuration: number | null;
  courseId: string;
}

export function ChapterRow({
  id,
  title,
  isPublished,
  isFree,
  videoDuration,
  courseId,
}: ChapterRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-sm",
        isDragging && "opacity-50 shadow-lg",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      <Video className="size-4 shrink-0 text-muted-foreground" />

      <span className="flex-1 truncate font-medium">{title}</span>

      <div className="flex shrink-0 items-center gap-2">
        {isFree && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Free
          </span>
        )}
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            isPublished
              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
        {videoDuration !== null && (
          <span className="text-xs text-muted-foreground">
            {Math.ceil(videoDuration / 60)} min
          </span>
        )}
        <Link
          href={`/teach/courses/${courseId}/chapters/${id}`}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Edit chapter"
        >
          <Pencil className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
