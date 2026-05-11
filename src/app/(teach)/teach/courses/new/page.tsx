import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { requireAuth } from "@/lib/session";
import { getInstructorCategories } from "@/features/instructor/queries/courses";
import { CreateCourseForm } from "@/features/instructor/components/create-course-form";

export const metadata = { title: "New Course — EduFlow" };

export default async function NewCoursePage() {
  await requireAuth();
  const categories = await getInstructorCategories();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/teach/courses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          My Courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Create a new course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start with a title — you can fill in the rest on the next page.
        </p>
      </div>

      <div className="rounded-xl border bg-card px-6 py-6">
        <CreateCourseForm categories={categories} />
      </div>
    </div>
  );
}
