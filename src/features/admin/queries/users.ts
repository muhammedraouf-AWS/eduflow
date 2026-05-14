import "server-only";

import { db } from "@/lib/db";

export async function getAdminUsers(search?: string) {
  return db.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      suspended: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });
}

export type AdminUser = Awaited<ReturnType<typeof getAdminUsers>>[number];
