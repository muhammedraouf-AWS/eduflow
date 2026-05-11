import Link from "next/link";
import { BookOpen } from "lucide-react";

import { requireAuth } from "@/lib/session";
import { getEnrolledCourses } from "@/features/student/queries/dashboard";
import { EnrolledCourseCard } from "@/features/student/components/enrolled-course-card";

export const metadata = {
  title: "My Learning — EduFlow",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const courses = await getEnrolledCourses(user.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold">My Learning</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back{user.name ? `, ${user.name}` : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <BookOpen className="size-12 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="font-medium">No courses yet</p>
              <p className="text-sm text-muted-foreground">
                Enroll in a course to start learning
              </p>
            </div>
            <Link
              href="/courses"
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <EnrolledCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
