import { AdminUsersTable } from "@/features/admin/components/admin-users-table";
import { getAdminUsers } from "@/features/admin/queries/users";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "User Management — EduFlow Admin" };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [users, currentUser] = await Promise.all([getAdminUsers(q), getCurrentUser()]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "user" : "users"}
            {q && ` matching "${q}"`}
          </p>
        </div>
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="h-9 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Search
          </button>
        </form>
      </div>

      <AdminUsersTable users={users} currentUserId={currentUser?.id ?? ""} />
    </div>
  );
}
