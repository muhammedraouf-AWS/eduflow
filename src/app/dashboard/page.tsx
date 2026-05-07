import { requireAuth } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name ?? user.email}
        </p>
        <p className="text-xs text-muted-foreground">Role: {user.role}</p>
      </div>
    </div>
  );
}
