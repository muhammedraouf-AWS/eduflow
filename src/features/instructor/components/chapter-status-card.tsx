"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Gift, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  toggleChapterPublishAction,
  toggleChapterFreeAction,
  deleteChapterAction,
} from "@/features/instructor/actions/chapter";

interface ChapterStatusCardProps {
  chapterId: string;
  courseId: string;
  isPublished: boolean;
  isFree: boolean;
}

export function ChapterStatusCard({
  chapterId,
  courseId,
  isPublished: initialPublished,
  isFree: initialFree,
}: ChapterStatusCardProps) {
  const router = useRouter();
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [isFree, setIsFree] = useState(initialFree);
  const [publishing, setPublishing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleTogglePublish() {
    setPublishing(true);
    const result = await toggleChapterPublishAction(chapterId, courseId);
    setPublishing(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      setIsPublished(result.isPublished);
      toast.success(result.isPublished ? "Chapter published" : "Chapter unpublished");
    }
  }

  async function handleToggleFree() {
    setToggling(true);
    const result = await toggleChapterFreeAction(chapterId, courseId);
    setToggling(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      setIsFree(result.isFree);
      toast.success(result.isFree ? "Marked as free preview" : "Free preview removed");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this chapter? This cannot be undone.")) return;
    setDeleting(true);
    const result = await deleteChapterAction(chapterId, courseId);
    setDeleting(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Chapter deleted");
      router.push(`/teach/courses/${courseId}/edit`);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-5">
      <h3 className="font-semibold">Chapter status</h3>

      <div className="space-y-2">
        <Button
          type="button"
          variant={isPublished ? "default" : "outline"}
          className="w-full gap-2"
          onClick={handleTogglePublish}
          disabled={publishing}
        >
          {isPublished ? (
            <>
              <Eye className="size-4" />
              {publishing ? "Updating…" : "Published"}
            </>
          ) : (
            <>
              <EyeOff className="size-4" />
              {publishing ? "Updating…" : "Draft — click to publish"}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant={isFree ? "secondary" : "outline"}
          className="w-full gap-2"
          onClick={handleToggleFree}
          disabled={toggling}
        >
          {isFree ? (
            <>
              <Gift className="size-4" />
              {toggling ? "Updating…" : "Free preview"}
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {toggling ? "Updating…" : "Paid only — click to make free"}
            </>
          )}
        </Button>
      </div>

      <div className="border-t pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="size-4" />
          {deleting ? "Deleting…" : "Delete chapter"}
        </Button>
      </div>
    </div>
  );
}
