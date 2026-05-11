import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/session";
import { getInstructorCourses } from "@/features/instructor/queries/courses";
import { InstructorCoursesTable } from "@/features/instructor/components/instructor-courses-table";

export const metadata = { title: "My Courses — EduFlow" };

export default async function TeachCoursesPage() {
  const user = await requireAuth();
  const courses = await getInstructorCourses(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>
        <Button size="sm" nativeButton={false} render={<Link href="/teach/courses/new" />}>
          <PlusCircle className="size-4" />
          New course
        </Button>
      </div>

      <InstructorCoursesTable courses={courses} />
    </div>
  );
}
