import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const fresh = await db.user.findUnique({
    where: { id: user.id },
    select: { suspended: true },
  });
  if (fresh?.suspended) redirect("/login?error=suspended");

  return user;
}

export async function requireRole(role: Role) {
  const user = await requireAuth();
  if (user.role !== role) redirect("/dashboard");
  return user;
}
