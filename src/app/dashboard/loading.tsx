import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-1 h-4 w-40" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
