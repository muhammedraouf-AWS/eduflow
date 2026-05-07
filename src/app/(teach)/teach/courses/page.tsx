import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "My Courses — EduFlow" };

export default function TeachCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <Button size="sm" nativeButton={false} render={<Link href="/teach/courses/new" />}>
          <PlusCircle className="size-4" />
          New course
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center">
        <p className="text-lg font-semibold">Course management coming in Step 8</p>
        <p className="text-sm text-muted-foreground">
          Create, edit, and publish your courses with chapters and video uploads.
        </p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/teach" />}
        >
          ← Back to overview
        </Button>
      </div>
    </div>
  );
}
