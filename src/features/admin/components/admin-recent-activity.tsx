import Image from "next/image";

import type { AdminStats } from "@/features/admin/queries";

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  return (
    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
      {image ? (
        <Image src={image} alt={name ?? ""} fill sizes="32px" className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-xs font-semibold text-muted-foreground">
          {name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      )}
    </div>
  );
}

interface AdminRecentActivityProps {
  recentUsers: AdminStats["recentUsers"];
  recentEnrollments: AdminStats["recentEnrollments"];
}

export function AdminRecentActivity({ recentUsers, recentEnrollments }: AdminRecentActivityProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent sign-ups */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Recent Sign-ups</h2>
        </div>
        <div className="divide-y">
          {recentUsers.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">No users yet.</p>
          )}
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={u.name} image={u.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name ?? u.email}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                  {u.role.toLowerCase()}
                </span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(u.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Recent Enrollments</h2>
        </div>
        <div className="divide-y">
          {recentEnrollments.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">
              No enrollments yet.
            </p>
          )}
          {recentEnrollments.map((e, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={e.user.name} image={e.user.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.user.name ?? e.user.email}</p>
                <p className="truncate text-xs text-muted-foreground">{e.course.title}</p>
              </div>
              <span className="text-[11px] text-muted-foreground">{timeAgo(e.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
