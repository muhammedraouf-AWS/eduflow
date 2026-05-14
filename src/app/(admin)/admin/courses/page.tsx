import { AdminCoursesTable } from "@/features/admin/components/admin-courses-table";
import { getAdminCourses } from "@/features/admin/queries/courses";

export const metadata = { title: "Course Moderation — EduFlow Admin" };

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminCoursesPage({ searchParams }: Props) {
  const { q, status } = await searchParams;
  const courses = await getAdminCourses(q, status);

  const statuses = ["", "PUBLISHED", "DRAFT", "ARCHIVED"];
  const statusLabels: Record<string, string> = {
    "": "All",
    PUBLISHED: "Published",
    DRAFT: "Draft",
    ARCHIVED: "Archived",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
            {q && ` matching "${q}"`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          {statuses.map((s) => (
            <a
              key={s}
              href={`/admin/courses?${new URLSearchParams({ ...(q ? { q } : {}), ...(s ? { status: s } : {}) }).toString()}`}
              className={`h-8 rounded-lg border px-3 text-xs font-medium leading-8 transition-colors ${
                (status ?? "") === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {statusLabels[s]}
            </a>
          ))}

          {/* Search */}
          <form method="GET" className="flex gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search title…"
              className="h-8 rounded-lg border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="h-8 rounded-lg border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <AdminCoursesTable courses={courses} />
    </div>
  );
}
