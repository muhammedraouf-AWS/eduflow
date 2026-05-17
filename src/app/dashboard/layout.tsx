import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardNav } from "@/features/student/components/dashboard-nav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <DashboardNav user={session.user} />
      {children}
    </>
  );
}
