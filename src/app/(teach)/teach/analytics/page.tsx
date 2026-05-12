import { redirect } from "next/navigation";
import { BarChart2, DollarSign, Star, Users } from "lucide-react";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/session";
import { getInstructorAnalytics } from "@/features/instructor/queries/analytics";
import { EnrollmentChart } from "@/features/instructor/components/enrollment-chart";
import { RatingDistribution } from "@/features/instructor/components/rating-distribution";
import { CoursePerformanceTable } from "@/features/instructor/components/course-performance-table";
import { TopChapters } from "@/features/instructor/components/top-chapters";

export const metadata: Metadata = { title: "Analytics — EduFlow" };

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

function KpiCard({ label, value, sub, icon: Icon, iconColor, iconBg }: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Icon className={`size-5 ${iconColor}`} />
      </span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground/70">{sub}</p>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getInstructorAnalytics(user.id);

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <BarChart2 className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">No analytics yet</h1>
        <p className="text-sm text-muted-foreground">
          Publish a course to start seeing data.
        </p>
      </div>
    );
  }

  const avgRating =
    data.totalReviews > 0
      ? data.ratingDistribution.reduce((sum, r) => sum + r.star * r.count, 0) /
        data.totalReviews
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide performance across all your courses.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="New enrollments"
          value={data.newEnrollmentsThisMonth.toLocaleString()}
          sub="Last 30 days"
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          label="Total students"
          value={data.totalStudents.toLocaleString()}
          sub="All time"
          icon={Users}
          iconColor="text-violet-500"
          iconBg="bg-violet-500/10"
        />
        <KpiCard
          label="Total revenue"
          value={data.totalRevenue > 0 ? `$${data.totalRevenue.toFixed(2)}` : "—"}
          sub="All purchases"
          icon={DollarSign}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          label="Average rating"
          value={avgRating !== null ? `${avgRating.toFixed(1)} ★` : "—"}
          sub={`${data.totalReviews} review${data.totalReviews !== 1 ? "s" : ""}`}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Enrollment chart + rating distribution */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <EnrollmentChart trend={data.enrollmentTrend} />
        <RatingDistribution
          distribution={data.ratingDistribution}
          totalReviews={data.totalReviews}
          avgRating={avgRating}
        />
      </div>

      {/* Course performance table + top chapters */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <CoursePerformanceTable courses={data.coursePerformance} />
        <TopChapters chapters={data.topChapters} />
      </div>
    </div>
  );
}
