"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCourseAction } from "@/features/instructor/actions/course";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    setLoading(true);
    const result = await deleteCourseAction(courseId);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Course deleted");
      router.push("/teach/courses");
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDelete}
      className="w-full rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete course"}
    </button>
  );
}
