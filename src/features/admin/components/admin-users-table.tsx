"use client";

import Image from "next/image";
import { ShieldCheck, ShieldOff, UserCheck, UserMinus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { changeUserRoleAction, toggleSuspendUserAction } from "@/features/admin/actions/users";
import type { AdminUser } from "@/features/admin/queries/users";
import type { Role } from "@/generated/prisma/client";

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  return (
    <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
      {image ? (
        <Image src={image} alt={name ?? ""} fill sizes="36px" className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-xs font-semibold text-muted-foreground">
          {name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  if (role === "ADMIN") return <Badge className="text-[11px]">Admin</Badge>;
  if (role === "INSTRUCTOR")
    return (
      <Badge variant="outline" className="text-[11px]">
        Instructor
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-[11px]">
      Student
    </Badge>
  );
}

function UserRow({ user, currentUserId }: { user: AdminUser; currentUserId: string }) {
  const [pending, startTransition] = useTransition();
  const isSelf = user.id === currentUserId;
  const isAdmin = user.role === "ADMIN";
  const canModify = !isSelf && !isAdmin;

  function handleRoleChange(newRole: Role) {
    startTransition(async () => {
      const res = await changeUserRoleAction(user.id, newRole);
      if ("error" in res) toast.error(res.error);
      else toast.success("Role updated.");
    });
  }

  function handleSuspendToggle() {
    startTransition(async () => {
      const res = await toggleSuspendUserAction(user.id, !user.suspended);
      if ("error" in res) toast.error(res.error);
      else toast.success(user.suspended ? "User unsuspended." : "User suspended.");
    });
  }

  return (
    <div className="grid items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30 lg:grid-cols-[2fr_1fr_80px_100px_140px]">
      {/* User */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={user.name} image={user.image} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {user.name ?? "—"}
            {user.suspended && (
              <span className="ml-2 text-[11px] font-normal text-destructive">(suspended)</span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Role */}
      <RoleBadge role={user.role} />

      {/* Enrollments */}
      <span className="hidden text-sm text-muted-foreground lg:block">
        {user._count.enrollments}
      </span>

      {/* Joined */}
      <span className="hidden text-xs text-muted-foreground lg:block">
        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
          new Date(user.createdAt),
        )}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {canModify && user.role !== "INSTRUCTOR" && (
          <Button
            size="sm"
            variant="outline"
            className="size-7 p-0"
            disabled={pending}
            onClick={() => handleRoleChange("INSTRUCTOR")}
            title="Promote to Instructor"
          >
            <UserCheck className="size-3.5" />
          </Button>
        )}
        {canModify && user.role === "INSTRUCTOR" && (
          <Button
            size="sm"
            variant="outline"
            className="size-7 p-0"
            disabled={pending}
            onClick={() => handleRoleChange("STUDENT")}
            title="Demote to Student"
          >
            <UserMinus className="size-3.5" />
          </Button>
        )}
        {canModify && (
          <Button
            size="sm"
            variant="ghost"
            className="size-7 p-0 text-destructive hover:text-destructive"
            disabled={pending}
            onClick={handleSuspendToggle}
            title={user.suspended ? "Unsuspend user" : "Suspend user"}
          >
            {user.suspended ? <ShieldCheck className="size-3.5" /> : <ShieldOff className="size-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
}

interface AdminUsersTableProps {
  users: AdminUser[];
  currentUserId: string;
}

export function AdminUsersTable({ users, currentUserId }: AdminUsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="hidden grid-cols-[2fr_1fr_80px_100px_140px] items-center gap-4 border-b bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground lg:grid">
        <span>User</span>
        <span>Role</span>
        <span>Enrolled</span>
        <span>Joined</span>
        <span>Actions</span>
      </div>
      <div className="divide-y">
        {users.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No users found.</p>
        )}
        {users.map((u) => (
          <UserRow key={u.id} user={u} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}
