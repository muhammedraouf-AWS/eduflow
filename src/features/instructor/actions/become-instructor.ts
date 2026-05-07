"use server";

import { updateSession } from "@/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function becomeInstructorAction(): Promise<
  { error: string } | { redirectTo: string }
> {
  const user = await getCurrentUser();

  if (!user) return { error: "Not authenticated" };
  if (user.role !== "STUDENT") return { error: "Already an instructor" };

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { role: "INSTRUCTOR" },
    }),
    db.instructorProfile.create({
      data: { userId: user.id },
    }),
  ]);

  // Refresh the JWT so the new role takes effect without re-login
  await updateSession({ user: { role: "INSTRUCTOR" } });

  return { redirectTo: "/teach" };
}
