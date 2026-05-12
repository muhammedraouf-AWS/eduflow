import { Star } from "lucide-react";

import type { InstructorAnalytics } from "@/features/instructor/queries/analytics";

export function RatingDistribution({
  distribution,
  totalReviews,
  avgRating,
}: {
  distribution: InstructorAnalytics["ratingDistribution"];
  totalReviews: number;
  avgRating: number | null;
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">Rating breakdown</h2>
          <p className="text-xs text-muted-foreground">{totalReviews} total reviews</p>
        </div>
        {avgRating !== null && (
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`size-3 ${
                    n <= Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {totalReviews === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="space-y-2">
          {distribution.map(({ star, count, pct }) => (
            <li key={star} className="flex items-center gap-2">
              <span className="flex w-12 shrink-0 items-center gap-1 text-xs font-medium">
                {star}
                <Star className="size-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-7 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {pct}%
              </span>
              <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
