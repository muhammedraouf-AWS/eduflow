import { z } from "zod";

export const applicationSchema = z.object({
  motivation: z.string().min(50, "Please write at least 50 characters.").max(1000),
  topics: z.string().min(10, "Please describe the topics you want to teach.").max(500),
  experience: z.string().max(1000).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
