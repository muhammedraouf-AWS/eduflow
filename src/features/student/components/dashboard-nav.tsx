"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, BookOpen, Award, LogOut, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { logoutAction } from "@/features/auth/actions";
import { siteConfig } from "@/config/site";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

const NAV_LINKS = [
  { label: "My Learning", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Browse Courses", href: "/courses", icon: BookOpen, exact: false },
  { label: "My Certificates", href: "/dashboard/certificates", icon: Award, exact: false },
];

export function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0]?.toUpperCase() ?? "?");

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <GraduationCap className="size-5 text-primary" />
          <span className="hidden sm:inline">{siteConfig.name}</span>
        </Link>

        {/* Nav links — hidden on small screens */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="relative size-8 overflow-hidden rounded-full border bg-muted">
                {user.image ? (
                  <Image src={user.image} alt="Avatar" fill sizes="32px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
                  </div>
                )}
              </div>
              <span className="hidden max-w-30 truncate text-sm font-medium sm:inline">
                {user.name ?? user.email}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* User info */}
              <DropdownMenuLabel className="font-normal">
                <p className="truncate font-medium text-foreground">{user.name ?? "My Account"}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Nav links (mobile — shown in dropdown on small screens) */}
              <DropdownMenuGroup className="md:hidden">
                {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                  <DropdownMenuItem key={href}>
                    <Link href={href} className="flex w-full items-center gap-2">
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>

              {/* Instructor / Admin shortcuts */}
              {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Link href="/teach" className="flex w-full items-center gap-2">
                        <GraduationCap className="size-4" />
                        Instructor dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/teach/settings" className="flex w-full items-center gap-2">
                        <Settings className="size-4" />
                        Profile settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Sign out */}
              <DropdownMenuItem variant="destructive">
                <form action={logoutAction} className="w-full">
                  <button type="submit" className="flex w-full items-center gap-2">
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
