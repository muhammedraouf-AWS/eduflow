"use client";

import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  submitReviewAction,
  deleteReviewAction,
} from "@/features/student/actions/review";
import type { UserReview } from "@/features/courses/queries/course-detail";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        />
      ))}
    </span>
  );
}

interface ReviewFormProps {
  courseId: string;
  existingReview: UserReview | null;
}

export function ReviewForm({ courseId, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [isPending, startTransition] = useTransition();

  if (existingReview && !isEditing) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1.5 text-sm font-semibold">Your review</p>
            <StarDisplay rating={existingReview.rating} />
            {existingReview.body && (
              <p className="mt-2 text-sm text-muted-foreground">{existingReview.body}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteReviewAction(courseId);
                  if ("error" in res) toast.error(res.error);
                  else toast.success("Review deleted.");
                })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <p className="mb-3 text-sm font-semibold">
        {existingReview ? "Edit your review" : "Leave a review"}
      </p>

      {/* Star picker */}
      <div className="mb-3 flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="transition-transform hover:scale-110 focus:outline-none"
            onMouseEnter={() => setHovered(n)}
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
          >
            <Star
              className={`size-8 transition-colors ${
                n <= (hovered || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted"
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="What did you think of this course? (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mb-3 resize-none"
        rows={3}
        maxLength={2000}
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isPending || rating === 0}
          onClick={() =>
            startTransition(async () => {
              const res = await submitReviewAction(courseId, rating, body || undefined);
              if ("error" in res) toast.error(res.error);
              else {
                toast.success(existingReview ? "Review updated!" : "Review submitted!");
                setIsEditing(false);
              }
            })
          }
        >
          {isPending
            ? "Saving…"
            : existingReview
              ? "Update review"
              : "Submit review"}
        </Button>
        {existingReview && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
