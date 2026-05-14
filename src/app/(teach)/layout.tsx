import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { BecomeInstructor } from "@/features/instructor/components/become-instructor";
import { SessionRefresher } from "@/features/instructor/components/session-refresher";
import { TeachSidebar } from "@/features/instructor/components/teach-sidebar";
import { TeachTopbar } from "@/features/instructor/components/teach-topbar";

export default async function TeachLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/teach");

  // Always read role from DB — catches admin-approved applications without re-login
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      instructorApplication: {
        select: { status: true, rejectionReason: true },
      },
    },
  });

  const dbRole = dbUser?.role ?? user.role;
  const jwtStale = dbRole !== "STUDENT" && user.role === "STUDENT";

  if (dbRole === "STUDENT") {
    const app = dbUser?.instructorApplication ?? null;
    return (
      <BecomeInstructor
        userName={user.name}
        application={
          app
            ? { status: app.status as "PENDING" | "REJECTED", rejectionReason: app.rejectionReason }
            : null
        }
      />
    );
  }

  const userLabel = user.name ?? user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {jwtStale && <SessionRefresher newRole={dbRole} />}
      <div className="hidden lg:flex lg:flex-col lg:shrink-0">
        <TeachSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <TeachTopbar userLabel={userLabel} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
