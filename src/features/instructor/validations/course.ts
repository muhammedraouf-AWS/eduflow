import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title cannot exceed 80 characters"),
  categoryId: z.string().optional(),
});

export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title cannot exceed 80 characters")
    .optional(),
  shortDescription: z
    .string()
    .max(160, "Short description cannot exceed 160 characters")
    .optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").max(9999.99, "Price cannot exceed $9,999.99").nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).optional(),
  language: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  requirements: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
