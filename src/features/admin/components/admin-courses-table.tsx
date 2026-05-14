"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminDeleteCourseAction, adminSetCourseStatusAction } from "@/features/admin/actions/courses";
import type { AdminCourse } from "@/features/admin/queries/courses";

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED")
    return <Badge className="text-[11px]">Published</Badge>;
  if (status === "ARCHIVED")
    return (
      <Badge variant="secondary" className="text-[11px]">
        Archived
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-[11px]">
      Draft
    </Badge>
  );
}

function CourseRow({ course }: { course: AdminCourse }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleStatus(status: "PUBLISHED" | "ARCHIVED" | "DRAFT") {
    startTransition(async () => {
      const res = await adminSetCourseStatusAction(course.id, status);
      if ("error" in res) toast.error(res.error);
      else toast.success(`Course ${status.toLowerCase()}.`);
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startTransition(async () => {
      const res = await adminDeleteCourseAction(course.id);
      if ("error" in res) toast.error(res.error);
      else toast.success("Course deleted.");
    });
  }

  return (
    <div className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30 lg:grid-cols-[2fr_1fr_80px_80px_160px]">
      {/* Thumbnail + title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
          {course.thumbnailUrl ? (
            <Image src={course.thumbnailUrl} alt={course.title} fill sizes="40px" className="object-cover" />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="line-clamp-1 text-sm font-medium hover:text-primary"
          >
            {course.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {course.instructor.user.name ?? course.instructor.user.email}
          </p>
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={course.status} />

      {/* Students */}
      <span className="hidden text-sm text-muted-foreground lg:block">
        {course._count.enrollments}
      </span>

      {/* Chapters */}
      <span className="hidden text-sm text-muted-foreground lg:block">
        {course._count.chapters}
      </span>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1.5">
        {course.status !== "PUBLISHED" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() => handleStatus("PUBLISHED")}
          >
            Publish
          </Button>
        )}
        {course.status !== "ARCHIVED" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() => handleStatus("ARCHIVED")}
          >
            Archive
          </Button>
        )}
        {course.status === "ARCHIVED" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() => handleStatus("DRAFT")}
          >
            Unarchive
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
          disabled={pending}
          onClick={handleDelete}
        >
          {confirmDelete ? "Confirm?" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

interface AdminCoursesTableProps {
  courses: AdminCourse[];
}

export function AdminCoursesTable({ courses }: AdminCoursesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="hidden grid-cols-[2fr_1fr_80px_80px_160px] items-center gap-4 border-b bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground lg:grid">
        <span>Course</span>
        <span>Status</span>
        <span>Students</span>
        <span>Chapters</span>
        <span>Actions</span>
      </div>
      <div className="divide-y">
        {courses.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No courses found.</p>
        )}
        {courses.map((c) => (
          <CourseRow key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
