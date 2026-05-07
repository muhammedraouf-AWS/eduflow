"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@/providers/theme-provider";

/**
 * Single client-side provider tree.
 *
 * Compose ALL client-only providers here (theme, session, query client, etc.)
 * so the root layout can stay a Server Component. Adding a new provider only
 * needs an edit in one place.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
