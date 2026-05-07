"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { TeachSidebar } from "@/features/instructor/components/teach-sidebar";

export function TeachTopbar({ userLabel }: { userLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <header className="flex h-14 items-center gap-3 border-b bg-card px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
        <span className="text-sm font-semibold">Instructor dashboard</span>
        <span className="ml-auto text-xs text-muted-foreground">{userLabel}</span>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full shadow-xl">
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
              <TeachSidebar />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TeachShell({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col">{children}</div>;
}
