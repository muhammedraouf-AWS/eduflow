import { z } from "zod";

export const createChapterSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be at most 80 characters"),
});

export const updateChapterSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be at most 80 characters")
    .optional(),
  description: z.string().optional(),
  videoUrl: z.string().url().nullable().optional(),
  videoDuration: z.number().int().nonnegative().nullable().optional(),
  isPublished: z.boolean().optional(),
  isFree: z.boolean().optional(),
});

export const reorderChaptersSchema = z.object({
  chapters: z.array(z.object({ id: z.string(), position: z.number().int().positive() })),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type ReorderChaptersInput = z.infer<typeof reorderChaptersSchema>;
