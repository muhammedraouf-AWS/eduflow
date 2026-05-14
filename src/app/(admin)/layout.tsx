import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { getCurrentUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <div className="hidden lg:flex lg:flex-col lg:shrink-0">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
