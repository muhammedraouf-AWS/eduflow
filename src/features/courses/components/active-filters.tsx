"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface ActiveFiltersProps {
  q: string;
  category: string;
  level: string;
  categoryName?: string;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
};

export function ActiveFilters({ q, category, level, categoryName }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const chips = [
    ...(q ? [{ key: "q", label: `"${q}"` }] : []),
    ...(category ? [{ key: "category", label: categoryName ?? category }] : []),
    ...(level ? [{ key: "level", label: LEVEL_LABELS[level] ?? level }] : []),
  ];

  if (chips.length === 0) return null;

  function remove(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function clearAll() {
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium"
        >
          {chip.label}
          <button
            onClick={() => remove(chip.key)}
            className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
