"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toggleProgressAction } from "@/features/student/actions/progress";

interface VideoPlayerProps {
  videoUrl: string | null;
  chapterId: string;
  courseSlug: string;
  isCompleted: boolean;
  isEnrolled: boolean;
}

export function VideoPlayer({
  videoUrl,
  chapterId,
  courseSlug,
  isCompleted: initialCompleted,
  isEnrolled,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (!isEnrolled) return;

    startTransition(async () => {
      const result = await toggleProgressAction(chapterId, courseSlug);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setIsCompleted(result.isCompleted);
        toast.success(result.isCompleted ? "Marked as complete" : "Marked as incomplete");
      }
    });
  }

  function handleVideoEnded() {
    if (!isEnrolled || isCompleted) return;
    startTransition(async () => {
      const result = await toggleProgressAction(chapterId, courseSlug);
      if ("isCompleted" in result && result.isCompleted) {
        setIsCompleted(true);
        toast.success("Chapter completed!");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Video */}
      <div className="overflow-hidden rounded-xl bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="aspect-video w-full"
            onEnded={handleVideoEnded}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-white/40">
            <p className="text-sm">No video uploaded yet</p>
          </div>
        )}
      </div>

      {/* Progress toggle */}
      {isEnrolled && (
        <Button
          type="button"
          variant={isCompleted ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={handleToggle}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <Circle className="size-4" />
          )}
          {isCompleted ? "Completed — mark incomplete" : "Mark as complete"}
        </Button>
      )}
    </div>
  );
}
