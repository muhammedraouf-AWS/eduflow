import { AdminApplicationsTable } from "@/features/admin/components/admin-applications-table";
import { getAdminApplications } from "@/features/admin/queries/applications";

export const metadata = { title: "Instructor Applications — EduFlow Admin" };

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const applications = await getAdminApplications(status);

  const tabs = [
    { label: "All", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Instructor Applications
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex size-6 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-white">
              {pendingCount}
            </span>
          )}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {applications.length} {applications.length === 1 ? "application" : "applications"}
          {status && ` · ${status.toLowerCase()}`}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/applications${tab.value ? `?status=${tab.value}` : ""}`}
            className={`h-8 rounded-lg border px-3 text-xs font-medium leading-8 transition-colors ${
              (status ?? "") === tab.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <AdminApplicationsTable applications={applications} />
    </div>
  );
}
