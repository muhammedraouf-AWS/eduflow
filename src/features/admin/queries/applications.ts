import "server-only";

import { db } from "@/lib/db";

export async function getAdminApplications(status?: string) {
  const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
  const statusFilter = validStatuses.includes(status ?? "") ? status : undefined;

  return db.instructorApplication.findMany({
    where: statusFilter
      ? { status: statusFilter as "PENDING" | "APPROVED" | "REJECTED" }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      motivation: true,
      topics: true,
      experience: true,
      rejectionReason: true,
      reviewedAt: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

export type AdminApplication = Awaited<ReturnType<typeof getAdminApplications>>[number];
