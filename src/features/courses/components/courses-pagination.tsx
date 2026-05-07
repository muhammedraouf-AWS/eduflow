"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoursesPaginationProps {
  page: number;
  pages: number;
  total: number;
}

export function CoursesPagination({ page, pages, total }: CoursesPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  if (pages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="flex items-center justify-center gap-1 pt-8">
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pageNumbers.map((p, i) => {
        const prev = pageNumbers[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-1 text-sm text-muted-foreground">…</span>
            )}
            <Button
              variant={p === page ? "default" : "outline"}
              size="icon-sm"
              onClick={() => goTo(p)}
              className={cn(p === page && "pointer-events-none")}
            >
              {p}
            </Button>
          </span>
        );
      })}

      <Button
        variant="outline"
        size="icon-sm"
        disabled={page >= pages}
        onClick={() => goTo(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
