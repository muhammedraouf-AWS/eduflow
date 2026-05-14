"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { Role } from "@/generated/prisma/client";

export async function changeUserRoleAction(
  targetUserId: string,
  newRole: Role,
): Promise<{ success: true } | { error: string }> {
  const admin = await requireRole("ADMIN");
  if (targetUserId === admin.id) return { error: "You cannot change your own role." };

  const target = await db.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
  if (!target) return { error: "User not found." };
  if (target.role === "ADMIN") return { error: "Cannot change another admin's role." };

  await db.user.update({ where: { id: targetUserId }, data: { role: newRole } });

  // Create InstructorProfile when promoting to instructor
  if (newRole === "INSTRUCTOR") {
    await db.instructorProfile.upsert({
      where: { userId: targetUserId },
      create: { userId: targetUserId },
      update: {},
    });
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleSuspendUserAction(
  targetUserId: string,
  suspend: boolean,
): Promise<{ success: true } | { error: string }> {
  const admin = await requireRole("ADMIN");
  if (targetUserId === admin.id) return { error: "You cannot suspend yourself." };

  const target = await db.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
  if (!target) return { error: "User not found." };
  if (target.role === "ADMIN") return { error: "Cannot suspend another admin." };

  await db.user.update({ where: { id: targetUserId }, data: { suspended: suspend } });
  revalidatePath("/admin/users");
  return { success: true };
}
