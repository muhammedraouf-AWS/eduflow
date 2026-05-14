import { AdminRecentActivity } from "@/features/admin/components/admin-recent-activity";
import { AdminStats } from "@/features/admin/components/admin-stats";
import { getAdminStats } from "@/features/admin/queries";

export const metadata = { title: "Admin Overview — EduFlow" };

export default async function AdminOverviewPage() {
  const data = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Platform-wide statistics and recent activity.</p>
      </div>

      <AdminStats stats={data.stats} />
      <AdminRecentActivity recentUsers={data.recentUsers} recentEnrollments={data.recentEnrollments} />
    </div>
  );
}
