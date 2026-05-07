"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function MobileFiltersToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <SlidersHorizontal className="size-3.5" />
        Filters
      </Button>

      {open && (
        <div className="mt-4 rounded-xl border bg-card p-4">
          {children}
        </div>
      )}
    </div>
  );
}
