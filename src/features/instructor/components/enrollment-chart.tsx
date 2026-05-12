import type { InstructorAnalytics } from "@/features/instructor/queries/analytics";

function formatAxisLabel(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function EnrollmentChart({
  trend,
}: {
  trend: InstructorAnalytics["enrollmentTrend"];
}) {
  const max = Math.max(...trend.map((d) => d.count), 1);
  const total = trend.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-semibold">Enrollment trend</h2>
          <p className="text-xs text-muted-foreground">New enrollments per day — last 30 days</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">this period</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex h-28 items-end gap-px">
        {trend.map((day) => {
          const heightPct = (day.count / max) * 100;
          return (
            <div
              key={day.date}
              title={`${day.count} enrollment${day.count !== 1 ? "s" : ""} on ${formatAxisLabel(day.date)}`}
              className="group relative flex flex-1 flex-col items-center justify-end"
            >
              <div
                style={{ height: `${Math.max(heightPct, day.count > 0 ? 4 : 1)}%` }}
                className={`w-full rounded-sm transition-colors ${
                  day.count > 0
                    ? "bg-primary/60 group-hover:bg-primary"
                    : "bg-muted"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis: show label every ~7 days */}
      <div className="mt-1.5 flex">
        {trend.map((day, i) => (
          <div key={day.date} className="flex flex-1 justify-center">
            {(i === 0 || i === 6 || i === 13 || i === 20 || i === 29) && (
              <span className="text-[9px] leading-none text-muted-foreground">
                {formatAxisLabel(day.date)}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
