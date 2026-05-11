"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createCourseAction } from "@/features/instructor/actions/course";
import {
  createCourseSchema,
  type CreateCourseInput,
} from "@/features/instructor/validations/course";

interface CreateCourseFormProps {
  categories: { id: string; name: string }[];
}

export function CreateCourseForm({ categories }: CreateCourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
  });

  async function onSubmit(data: CreateCourseInput) {
    setIsSubmitting(true);
    const result = await createCourseAction(data);
    setIsSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Course created!");
      router.push(`/teach/courses/${result.courseId}/edit`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Course title</Label>
        <Input
          id="title"
          placeholder="e.g. Complete React Developer Bootcamp"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Choose a clear, descriptive title. You can always change it later.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category (optional)</Label>
        <Select id="categoryId" defaultValue="" {...register("categoryId")}>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create & continue"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/teach/courses")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
