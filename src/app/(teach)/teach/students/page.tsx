import type { Metadata } from "next";

import { requireAuth } from "@/lib/session";
import { getInstructorStudents } from "@/features/instructor/queries/students";
import { getInstructorCourses } from "@/features/instructor/queries/courses";
import { StudentsTable } from "@/features/instructor/components/students-table";
import { CourseFilter } from "@/features/instructor/components/course-filter";

export const metadata: Metadata = {
  title: "Students — EduFlow",
};

interface StudentsPageProps {
  searchParams: Promise<{ course?: string }>;
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const { course: courseFilter } = await searchParams;
  const user = await requireAuth();

  const [students, courses] = await Promise.all([
    getInstructorStudents(user.id, courseFilter),
    getInstructorCourses(user.id),
  ]);

  const uniqueStudentCount = new Set(students.map((s) => s.userId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {uniqueStudentCount} unique student
            {uniqueStudentCount !== 1 ? "s" : ""} across {courses.length} course
            {courses.length !== 1 ? "s" : ""}
          </p>
        </div>

        <CourseFilter courses={courses} selectedCourseId={courseFilter} />
      </div>

      <StudentsTable students={students} />
    </div>
  );
}
