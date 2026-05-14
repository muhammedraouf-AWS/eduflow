import { BookOpen, DollarSign, GraduationCap, Users } from "lucide-react";

import type { AdminStats } from "@/features/admin/queries";

interface AdminStatsProps {
  stats: AdminStats["stats"];
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`flex size-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        label="Total Users"
        value={stats.totalUsers.toLocaleString()}
        sub={`${stats.studentCount} students · ${stats.instructorCount} instructors`}
        color="bg-blue-500/10 text-blue-600"
      />
      <StatCard
        icon={BookOpen}
        label="Total Courses"
        value={stats.totalCourses.toLocaleString()}
        sub={`${stats.publishedCount} published · ${stats.draftCount} draft · ${stats.archivedCount} archived`}
        color="bg-violet-500/10 text-violet-600"
      />
      <StatCard
        icon={GraduationCap}
        label="Total Enrollments"
        value={stats.totalEnrollments.toLocaleString()}
        color="bg-emerald-500/10 text-emerald-600"
      />
      <StatCard
        icon={DollarSign}
        label="Total Revenue"
        value={`$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        color="bg-amber-500/10 text-amber-600"
      />
    </div>
  );
}
