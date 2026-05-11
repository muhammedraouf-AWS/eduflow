"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { toast } from "sonner";

import { ChapterRow } from "./chapter-row";
import { reorderChaptersAction } from "@/features/instructor/actions/chapter";
import type { ChapterForList } from "@/features/instructor/queries/chapters";

interface ChaptersListProps {
  chapters: ChapterForList[];
  courseId: string;
}

export function ChaptersList({ chapters: initialChapters, courseId }: ChaptersListProps) {
  const [chapters, setChapters] = useState(initialChapters);

  useEffect(() => {
    setChapters(initialChapters);
  }, [initialChapters]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(chapters, oldIndex, newIndex);

    setChapters(reordered);

    const result = await reorderChaptersAction(courseId, {
      chapters: reordered.map((c, i) => ({ id: c.id, position: i + 1 })),
    });

    if ("error" in result) {
      toast.error(result.error);
      setChapters(chapters);
    }
  }

  if (chapters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No chapters yet. Add your first chapter below.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={chapters.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              id={chapter.id}
              title={chapter.title}
              position={chapter.position}
              isPublished={chapter.isPublished}
              isFree={chapter.isFree}
              videoDuration={chapter.videoDuration}
              courseId={courseId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
