import { BarChart2, BookOpen, Star, Users } from "lucide-react";

import type { InstructorOverview } from "@/features/instructor/queries";

const statConfig = [
  {
    key: "totalStudents" as const,
    label: "Total students",
    icon: Users,
    format: (v: number) => v.toLocaleString(),
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "publishedCourses" as const,
    label: "Published courses",
    icon: BookOpen,
    format: (v: number) => String(v),
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "avgRating" as const,
    label: "Average rating",
    icon: Star,
    format: (v: number | null) => (v ? v.toFixed(1) : "—"),
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    key: "totalCourses" as const,
    label: "Total courses",
    icon: BarChart2,
    format: (v: number) => String(v),
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
] as const;

export function OverviewStats({ stats }: { stats: InstructorOverview["stats"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statConfig.map(({ key, label, icon: Icon, format, color, bg }) => (
        <div key={key} className="flex items-center gap-4 rounded-xl border bg-card p-5">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
            <Icon className={`size-5 ${color}`} />
          </span>
          <div>
            <p className="text-2xl font-bold">{format(stats[key] as never)}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
