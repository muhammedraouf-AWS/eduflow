import Link from "next/link";

import type { LandingCategory } from "@/features/landing/queries";

export function CategoriesSection({ categories }: { categories: LandingCategory[] }) {
  return (
    <section className="border-b bg-muted/20 py-14">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Categories
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Find your next skill
            </h2>
          </div>
          <Link
            href="/courses"
            className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/courses?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <span
                className="size-10 rounded-lg"
                style={{ backgroundColor: `${cat.color ?? "#64748b"}20` }}
              >
                <span
                  className="flex size-full items-center justify-center rounded-lg text-lg font-bold"
                  style={{ color: cat.color ?? "#64748b" }}
                >
                  {cat.name.charAt(0)}
                </span>
              </span>
              <span className="text-xs font-medium leading-tight">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {cat._count.courses} course{cat._count.courses !== 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
