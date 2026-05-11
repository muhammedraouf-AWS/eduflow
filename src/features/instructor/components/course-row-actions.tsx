"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  togglePublishAction,
  deleteCourseAction,
} from "@/features/instructor/actions/course";
import type { CourseStatus } from "@/generated/prisma/client";

interface CourseRowActionsProps {
  courseId: string;
  status: CourseStatus;
}

export function CourseRowActions({ courseId, status }: CourseRowActionsProps) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleTogglePublish() {
    setPublishing(true);
    const result = await togglePublishAction(courseId);
    setPublishing(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(status === "PUBLISHED" ? "Course unpublished" : "Course published");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    setDeleting(true);
    const result = await deleteCourseAction(courseId);
    setDeleting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Course deleted");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon-sm"
        variant="ghost"
        nativeButton={false}
        render={<Link href={`/teach/courses/${courseId}/edit`} />}
        title="Edit course"
      >
        <Pencil className="size-3.5" />
      </Button>

      <Button
        size="icon-sm"
        variant="ghost"
        onClick={handleTogglePublish}
        disabled={publishing}
        title={status === "PUBLISHED" ? "Unpublish" : "Publish"}
      >
        <Globe className="size-3.5" />
      </Button>

      <Button
        size="icon-sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={deleting}
        title="Delete course"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
