"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createChapterAction } from "@/features/instructor/actions/chapter";
import {
  createChapterSchema,
  type CreateChapterInput,
} from "@/features/instructor/validations/chapter";

interface AddChapterFormProps {
  courseId: string;
}

export function AddChapterForm({ courseId }: AddChapterFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateChapterInput>({
    resolver: zodResolver(createChapterSchema),
  });

  async function onSubmit(data: CreateChapterInput) {
    setIsSubmitting(true);
    const result = await createChapterAction(courseId, data);
    setIsSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Chapter added");
    reset();
    setIsOpen(false);
    router.push(`/teach/courses/${courseId}/chapters/${result.chapterId}`);
  }

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => setIsOpen(true)}
      >
        <PlusCircle className="size-4" />
        Add chapter
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border bg-muted/40 p-4">
      <div className="space-y-1.5">
        <Label htmlFor="chapter-title">Chapter title</Label>
        <Input
          id="chapter-title"
          placeholder="e.g. Introduction to the course"
          autoFocus
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add chapter"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { reset(); setIsOpen(false); }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
