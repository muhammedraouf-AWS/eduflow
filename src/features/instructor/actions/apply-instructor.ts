"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { applicationSchema } from "@/features/instructor/validations/application";

export async function applyInstructorAction(
  formData: FormData,
): Promise<{ success: true } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  if (user.role !== "STUDENT") return { error: "Only students can apply." };

  const parsed = applicationSchema.safeParse({
    motivation: formData.get("motivation"),
    topics: formData.get("topics"),
    experience: formData.get("experience") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Upsert so re-applying after rejection just resets the record
  await db.instructorApplication.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: "PENDING",
      motivation: parsed.data.motivation,
      topics: parsed.data.topics,
      experience: parsed.data.experience ?? null,
    },
    update: {
      status: "PENDING",
      motivation: parsed.data.motivation,
      topics: parsed.data.topics,
      experience: parsed.data.experience ?? null,
      rejectionReason: null,
      reviewedAt: null,
    },
  });

  return { success: true };
}
