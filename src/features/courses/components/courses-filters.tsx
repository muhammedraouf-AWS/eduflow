"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import type { getCourseFilterMeta } from "@/features/courses/queries";

type FilterMeta = Awaited<ReturnType<typeof getCourseFilterMeta>>;

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All levels" },
] as const;

interface CoursesFiltersProps {
  meta: FilterMeta;
  activeCategory: string;
  activeLevel: string;
}

export function CoursesFilters({ meta, activeCategory, activeLevel }: CoursesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <aside className="flex flex-col gap-6">
      {/* Category */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam("category", null)}
              className={cn(
                "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                !activeCategory && "bg-muted font-medium",
              )}
            >
              All categories
            </button>
          </li>
          {meta.categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() =>
                  setParam("category", activeCategory === cat.slug ? null : cat.slug)
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                  activeCategory === cat.slug && "bg-muted font-medium",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#64748b" }}
                  />
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground">{cat._count.courses}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Level */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Level
        </p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam("level", null)}
              className={cn(
                "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                !activeLevel && "bg-muted font-medium",
              )}
            >
              Any level
            </button>
          </li>
          {LEVELS.map((lvl) => (
            <li key={lvl.value}>
              <button
                onClick={() => setParam("level", activeLevel === lvl.value ? null : lvl.value)}
                className={cn(
                  "w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                  activeLevel === lvl.value && "bg-muted font-medium",
                )}
              >
                {lvl.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
