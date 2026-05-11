import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlayerChapter } from "@/features/student/queries/player";

interface ChapterNavigationProps {
  chapters: PlayerChapter[];
  currentChapterId: string;
  courseSlug: string;
  isEnrolled: boolean;
}

export function ChapterNavigation({
  chapters,
  currentChapterId,
  courseSlug,
  isEnrolled,
}: ChapterNavigationProps) {
  const currentIndex = chapters.findIndex((c) => c.id === currentChapterId);
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  if (!prev && !next) return null;

  const nextLocked = !!next && !isEnrolled && !next.isFree;

  return (
    <div className="flex items-center justify-between gap-4 border-t pt-4">
      {prev ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          nativeButton={false}
          render={<Link href={`/learn/${courseSlug}/${prev.id}`} />}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      ) : (
        <div />
      )}

      {next ? (
        nextLocked ? (
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            nativeButton={false}
            render={<Link href={`/learn/${courseSlug}/${next.id}`} />}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
          </Button>
        )
      ) : (
        <div />
      )}
    </div>
  );
}
