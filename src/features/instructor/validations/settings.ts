import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name cannot exceed 60 characters"),
  headline: z
    .string()
    .max(120, "Headline cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(2000, "Bio cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .max(50, "Twitter handle cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url("Must be a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
