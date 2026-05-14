"use client";

import { PrinterIcon } from "lucide-react";

interface PrintButtonProps {
  variant?: "default" | "outline";
}

export function PrintButton({ variant = "outline" }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        variant === "default"
          ? "flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          : "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
      }
    >
      <PrinterIcon className="size-4" />
      Print / Save PDF
    </button>
  );
}
