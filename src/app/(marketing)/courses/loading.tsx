import { Skeleton } from "@/components/ui/skeleton";

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export default function CoursesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-36" />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="mb-6 h-8" />

      <div className="flex gap-8">
        <div className="hidden w-52 shrink-0 space-y-4 lg:block">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
