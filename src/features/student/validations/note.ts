import { z } from "zod";

export const upsertNoteSchema = z.object({
  chapterId: z.string().min(1),
  courseSlug: z.string().min(1),
  body: z.string().max(10000),
});
