"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { updateProfileSchema } from "@/features/instructor/validations/settings";
import type { UpdateProfileInput } from "@/features/instructor/validations/settings";

export async function updateProfileAction(input: UpdateProfileInput) {
  const user = await requireRole("INSTRUCTOR");

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, headline, bio, website, twitter, linkedin } = parsed.data;

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { name },
    }),
    db.instructorProfile.update({
      where: { userId: user.id },
      data: {
        headline: headline || null,
        bio: bio || null,
        website: website || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
      },
    }),
  ]);

  revalidatePath("/teach/settings");
  revalidatePath("/teach");
  return { success: true };
}

export async function updateAvatarAction(avatarUrl: string) {
  const user = await requireRole("INSTRUCTOR");

  await db.instructorProfile.update({
    where: { userId: user.id },
    data: { avatarUrl },
  });

  revalidatePath("/teach/settings");
  revalidatePath("/teach");
  return { success: true };
}

export async function removeAvatarAction() {
  const user = await requireRole("INSTRUCTOR");

  await db.instructorProfile.update({
    where: { userId: user.id },
    data: { avatarUrl: null },
  });

  revalidatePath("/teach/settings");
  revalidatePath("/teach");
  return { success: true };
}
