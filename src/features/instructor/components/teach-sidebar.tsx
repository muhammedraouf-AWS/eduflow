"use client";

import {
  BarChart2,
  BookOpen,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const NAV: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { label: "Overview", href: "/teach", icon: LayoutDashboard, exact: true },
  { label: "My Courses", href: "/teach/courses", icon: BookOpen },
  { label: "Students", href: "/teach/students", icon: Users },
  { label: "Earnings", href: "/teach/earnings", icon: DollarSign },
  { label: "Analytics", href: "/teach/analytics", icon: BarChart2 },
  { label: "Settings", href: "/teach/settings", icon: Settings },
];

export function TeachSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <GraduationCap className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">{siteConfig.name}</span>
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          Teach
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV.map(({ label, href, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(href, exact)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Back to site */}
      <div className="border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
