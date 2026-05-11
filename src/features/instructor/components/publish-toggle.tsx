"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Lock } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { togglePublishAction } from "@/features/instructor/actions/course";
import type { CourseStatus } from "@/generated/prisma/client";

interface PublishToggleProps {
  courseId: string;
  status: CourseStatus;
}

export function PublishToggle({ courseId, status }: PublishToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isPublished = status === "PUBLISHED";

  async function handleToggle() {
    setLoading(true);
    const result = await togglePublishAction(courseId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(isPublished ? "Course unpublished" : "Course published and live!");
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={isPublished ? "default" : "outline"}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
        {isPublished && (
          <span className="text-xs text-muted-foreground">Visible to students</span>
        )}
      </div>

      <Button
        size="sm"
        variant={isPublished ? "outline" : "default"}
        onClick={handleToggle}
        disabled={loading}
        className="w-full"
      >
        {isPublished ? (
          <>
            <Lock className="size-3.5" />
            {loading ? "Unpublishing…" : "Unpublish"}
          </>
        ) : (
          <>
            <Globe className="size-3.5" />
            {loading ? "Publishing…" : "Publish course"}
          </>
        )}
      </Button>
    </div>
  );
}
