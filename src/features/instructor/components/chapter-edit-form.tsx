"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateChapterAction } from "@/features/instructor/actions/chapter";
import type { ChapterForEdit } from "@/features/instructor/queries/chapters";

const editChapterSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be at most 80 characters"),
  description: z.string().optional(),
});
type EditChapterValues = z.infer<typeof editChapterSchema>;

interface ChapterEditFormProps {
  chapter: ChapterForEdit;
}

export function ChapterEditForm({ chapter }: ChapterEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditChapterValues>({
    resolver: zodResolver(editChapterSchema),
    defaultValues: {
      title: chapter.title,
      description: chapter.description ?? "",
    },
  });

  async function onSubmit(data: EditChapterValues) {
    setIsSubmitting(true);
    const result = await updateChapterAction(chapter.id, chapter.courseId, {
      title: data.title,
      description: data.description || undefined,
    });
    setIsSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Chapter saved");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="chapter-title">
          Chapter title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="chapter-title"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="chapter-description">Description</Label>
        <Textarea
          id="chapter-description"
          placeholder="Brief overview of what this chapter covers"
          className="min-h-[120px]"
          {...register("description")}
        />
      </div>

      <div className="flex items-center gap-3 border-t pt-4">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
        {isDirty && (
          <span className="text-xs text-muted-foreground">You have unsaved changes</span>
        )}
      </div>
    </form>
  );
}
