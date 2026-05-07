import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OverviewStats } from "@/features/instructor/components/overview-stats";
import { RecentEnrollments } from "@/features/instructor/components/recent-enrollments";
import { TopCourses } from "@/features/instructor/components/top-courses";
import { getInstructorOverview } from "@/features/instructor/queries";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Instructor Overview — EduFlow" };

export default async function TeachOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const overview = await getInstructorOverview(user.id);

  if (!overview) {
    // User has INSTRUCTOR role but no profile yet — edge case
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Set up your instructor profile</h1>
        <p className="text-muted-foreground">
          Your instructor profile hasn&apos;t been created yet. Contact support to get set up.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name ?? user.email}
          </p>
        </div>
        <Button size="sm" nativeButton={false} render={<Link href="/teach/courses/new" />}>
          <PlusCircle className="size-4" />
          New course
        </Button>
      </div>

      <OverviewStats stats={overview.stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentEnrollments enrollments={overview.recentEnrollments} />
        <TopCourses courses={overview.topCourses} />
      </div>
    </div>
  );
}
