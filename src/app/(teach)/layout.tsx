import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/session";
import { BecomeInstructor } from "@/features/instructor/components/become-instructor";
import { TeachSidebar } from "@/features/instructor/components/teach-sidebar";
import { TeachTopbar } from "@/features/instructor/components/teach-topbar";

export default async function TeachLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?callbackUrl=/teach");

  if (user.role === "STUDENT") {
    return <BecomeInstructor userName={user.name} />;
  }

  const userLabel = user.name ?? user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:shrink-0">
        <TeachSidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <TeachTopbar userLabel={userLabel} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
