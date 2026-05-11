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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateCourseAction } from "@/features/instructor/actions/course";
import { updateCourseSchema } from "@/features/instructor/validations/course";
import type { CourseForEdit } from "@/features/instructor/queries/courses";

// Local form schema: requirements/objectives stored as newline-separated strings
const editFormSchema = updateCourseSchema.omit({ requirements: true, objectives: true }).extend({
  requirements: z.string().optional(),
  objectives: z.string().optional(),
});
type EditFormValues = z.infer<typeof editFormSchema>;

interface EditCourseFormProps {
  course: CourseForEdit;
  categories: { id: string; name: string }[];
}

const LEVELS = [
  { value: "ALL_LEVELS", label: "All levels" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

export function EditCourseForm({ course, categories }: EditCourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: course.title,
      shortDescription: course.shortDescription ?? "",
      description: course.description ?? "",
      price: course.price ?? undefined,
      level: course.level,
      language: course.language,
      categoryId: course.categoryId ?? "",
      requirements: course.requirements.join("\n"),
      objectives: course.objectives.join("\n"),
    },
  });

  async function onSubmit(data: EditFormValues) {
    const splitLines = (s?: string) =>
      (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

    const payload = {
      ...data,
      categoryId: data.categoryId || null,
      shortDescription: data.shortDescription || undefined,
      description: data.description || undefined,
      requirements: splitLines(data.requirements),
      objectives: splitLines(data.objectives),
    };

    setIsSubmitting(true);
    const result = await updateCourseAction(course.id, payload);
    setIsSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Changes saved");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Course title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Complete React Developer Bootcamp"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Short description */}
      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Input
          id="shortDescription"
          placeholder="One-line summary shown on course cards (max 160 chars)"
          maxLength={160}
          aria-invalid={!!errors.shortDescription}
          {...register("shortDescription")}
        />
        {errors.shortDescription && (
          <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
        )}
      </div>

      {/* Full description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Full description</Label>
        <Textarea
          id="description"
          placeholder="Describe your course in detail. What will students learn? Who is it for?"
          className="min-h-[140px]"
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Category + Level row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            id="categoryId"
            defaultValue={course.categoryId ?? ""}
            {...register("categoryId")}
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="level">Level</Label>
          <Select id="level" defaultValue={course.level} {...register("level")}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Language + Price row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            placeholder="e.g. English"
            {...register("language")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            max="9999.99"
            placeholder="Leave empty for free"
            aria-invalid={!!errors.price}
            {...register("price", {
              setValueAs: (v: string) => (v === "" ? null : parseFloat(v)),
            })}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Leave empty to make the course free.</p>
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-1.5">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          placeholder={"One requirement per line\ne.g.\nBasic JavaScript knowledge\nA computer with internet access"}
          className="min-h-[100px]"
          {...register("requirements")}
        />
        <p className="text-xs text-muted-foreground">One requirement per line.</p>
      </div>

      {/* Objectives */}
      <div className="space-y-1.5">
        <Label htmlFor="objectives">What students will learn</Label>
        <Textarea
          id="objectives"
          placeholder={"One learning objective per line\ne.g.\nBuild real-world React applications\nUnderstand hooks and state management"}
          className="min-h-[100px]"
          {...register("objectives")}
        />
        <p className="text-xs text-muted-foreground">One objective per line.</p>
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
