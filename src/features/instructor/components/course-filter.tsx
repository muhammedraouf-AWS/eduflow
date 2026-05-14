"use client";

import { useRouter } from "next/navigation";

interface CourseFilterProps {
  courses: { id: string; title: string }[];
  selectedCourseId?: string;
}

export function CourseFilter({ courses, selectedCourseId }: CourseFilterProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    router.push(value ? `/teach/students?course=${value}` : "/teach/students");
  }

  return (
    <select
      value={selectedCourseId ?? ""}
      onChange={handleChange}
      className="rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All courses</option>
      {courses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
    </select>
  );
}
