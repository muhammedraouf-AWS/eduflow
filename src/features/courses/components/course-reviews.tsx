import Image from "next/image";
import { Star } from "lucide-react";

import { ReviewForm } from "@/features/courses/components/review-form";
import type { CourseDetail } from "@/features/courses/queries/course-detail";
import type { UserReview } from "@/features/courses/queries/course-detail";

function Stars({ rating }: { rating: number }) {
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

interface CourseReviewsProps {
  reviews: CourseDetail["reviews"];
  avgRating: number | null;
  courseId: string;
  isEnrolled: boolean;
  userReview: UserReview | null;
}

export function CourseReviews({
  reviews,
  avgRating,
  courseId,
  isEnrolled,
  userReview,
}: CourseReviewsProps) {
  const otherReviews = userReview
    ? reviews.filter((r) => r.id !== userReview.id)
    : reviews;

  const hasContent = isEnrolled || reviews.length > 0;
  if (!hasContent) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold">Student reviews</h2>
        {avgRating && (
          <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {avgRating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Review form for enrolled students */}
      {isEnrolled && (
        <div className="mb-6">
          <ReviewForm courseId={courseId} existingReview={userReview} />
        </div>
      )}

      {/* Reviews list */}
      {otherReviews.length > 0 && (
        <ul className="space-y-5">
          {otherReviews.map((review) => {
            const name = review.user.name ?? "Student";
            return (
              <li key={review.id} className="flex gap-3">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs font-bold text-muted-foreground">
                      {name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{name}</span>
                    <Stars rating={review.rating} />
                  </div>
                  {review.body && (
                    <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
