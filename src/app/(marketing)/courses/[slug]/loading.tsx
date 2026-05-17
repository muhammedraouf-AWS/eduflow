import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="bg-foreground/5 px-6 py-12">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-5 w-40 bg-white/10" />
          <Skeleton className="h-10 w-3/4 bg-white/10" />
          <Skeleton className="h-6 w-2/3 bg-white/10" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24 bg-white/10" />
            <Skeleton className="h-5 w-24 bg-white/10" />
            <Skeleton className="h-5 w-24 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex gap-10">
          <div className="min-w-0 flex-1 space-y-10">
            {/* What you'll learn */}
            <div className="space-y-3">
              <Skeleton className="h-7 w-48" />
              <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Curriculum */}
            <div className="space-y-3">
              <Skeleton className="h-7 w-36" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton — desktop */}
          <div className="hidden shrink-0 lg:block lg:w-80 xl:w-96">
            <div className="space-y-4 rounded-xl border p-5">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-11 w-full rounded-full" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
