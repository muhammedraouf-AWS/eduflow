import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { DollarSign, TrendingUp, ShoppingCart, BarChart2 } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { getInstructorEarnings } from "@/features/instructor/queries/earnings";

export const metadata: Metadata = { title: "Earnings — EduFlow" };

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

function KpiCard({ label, value, sub, icon: Icon, iconColor, iconBg }: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`size-5 ${iconColor}`} />
      </span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground/70">{sub}</p>
      </div>
    </div>
  );
}

function fmt(amount: number) {
  return amount === 0 ? "—" : `$${amount.toFixed(2)}`;
}

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getInstructorEarnings(user.id);

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <DollarSign className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">No earnings yet</h1>
        <p className="text-sm text-muted-foreground">
          Publish a paid course to start earning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
        <p className="text-sm text-muted-foreground">
          Revenue from all your paid courses.
        </p>
      </div>

      {/* Demo banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>Demo mode</strong> — payments are simulated. Withdrawal functionality will be available once real Stripe is connected.
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={fmt(data.totalRevenue)}
          sub="All time"
          icon={DollarSign}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          label="This month"
          value={fmt(data.revenueThisMonth)}
          sub="Last 30 days"
          icon={TrendingUp}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          label="Total sales"
          value={data.totalSales.toLocaleString()}
          sub="Paid enrollments"
          icon={ShoppingCart}
          iconColor="text-violet-500"
          iconBg="bg-violet-500/10"
        />
        <KpiCard
          label="Avg. sale price"
          value={fmt(data.avgSalePrice)}
          sub="Per transaction"
          icon={BarChart2}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Transactions table */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Transactions</h2>
          </div>

          {data.purchases.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <ShoppingCart className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {data.purchases.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                  {/* Avatar */}
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                    {p.user.image ? (
                      <Image
                        src={p.user.image}
                        alt={p.user.name ?? "Student"}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs font-medium text-muted-foreground">
                        {(p.user.name ?? p.user.email ?? "?")[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Student + course */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.user.name ?? p.user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.course.title}
                    </p>
                  </div>

                  {/* Date */}
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {fmtDate(p.createdAt)}
                  </p>

                  {/* Amount */}
                  <p className="w-16 shrink-0 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ${p.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by course */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">By course</h2>
          </div>

          {data.courseBreakdown.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No sales yet.
            </div>
          ) : (
            <div className="divide-y">
              {data.courseBreakdown.map((c) => (
                <div key={c.id} className="px-5 py-3.5">
                  <p className="line-clamp-1 text-sm font-medium">{c.title}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.sales} sale{c.sales !== 1 ? "s" : ""}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${c.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
