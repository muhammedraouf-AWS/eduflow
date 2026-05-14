import Image from "next/image";
import { Award, BookOpen, Users } from "lucide-react";

import type { InstructorStudent } from "@/features/instructor/queries/students";

interface StudentsTableProps {
  students: InstructorStudent[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
        <Users className="mb-3 size-10 text-muted-foreground/40" />
        <p className="font-medium">No students yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Students will appear here once they enroll in your courses.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Student
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Course
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Progress
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                Enrolled on
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Certificate
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const pct =
                student.totalChapters > 0
                  ? Math.round(
                      (student.completedChapters / student.totalChapters) * 100,
                    )
                  : 0;
              const initials = (
                student.studentName ?? student.studentEmail
              )[0]?.toUpperCase();

              return (
                <tr
                  key={student.enrollmentId}
                  className="border-b last:border-0 transition-colors hover:bg-muted/20"
                >
                  {/* Student */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {student.studentImage ? (
                        <Image
                          src={student.studentImage}
                          alt={student.studentName ?? ""}
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {student.studentName ?? "—"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {student.studentEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="size-3.5 shrink-0" />
                      <span className="max-w-48 truncate">
                        {student.courseTitle}
                      </span>
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className="text-muted-foreground">
                          {student.completedChapters}/{student.totalChapters}{" "}
                          chapters
                        </span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Enrolled date */}
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(student.enrolledAt))}
                  </td>

                  {/* Certificate */}
                  <td className="px-4 py-3">
                    {student.hasCertificate ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Award className="size-3" />
                        Earned
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
