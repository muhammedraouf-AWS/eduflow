"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function approveApplicationAction(
  applicationId: string,
): Promise<{ success: true } | { error: string }> {
  await requireRole("ADMIN");

  const app = await db.instructorApplication.findUnique({
    where: { id: applicationId },
    select: { userId: true, status: true },
  });
  if (!app) return { error: "Application not found." };
  if (app.status !== "PENDING") return { error: "Application is no longer pending." };

  await db.$transaction([
    db.instructorApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED", reviewedAt: new Date() },
    }),
    db.user.update({
      where: { id: app.userId },
      data: { role: "INSTRUCTOR" },
    }),
    db.instructorProfile.upsert({
      where: { userId: app.userId },
      create: { userId: app.userId },
      update: {},
    }),
  ]);

  revalidatePath("/admin/applications");
  return { success: true };
}

export async function rejectApplicationAction(
  applicationId: string,
  reason: string,
): Promise<{ success: true } | { error: string }> {
  await requireRole("ADMIN");

  const app = await db.instructorApplication.findUnique({
    where: { id: applicationId },
    select: { status: true },
  });
  if (!app) return { error: "Application not found." };
  if (app.status !== "PENDING") return { error: "Application is no longer pending." };

  await db.instructorApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      rejectionReason: reason.trim() || null,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/applications");
  return { success: true };
}
