import { GraduationCap, Layers, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const phases = [
  {
    icon: Layers,
    title: "Phase 1 · Foundation",
    description: "Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, Cloudinary scaffolding.",
    status: "In progress",
  },
  {
    icon: ShieldCheck,
    title: "Phase 1 · Auth & Roles",
    description: "Auth.js v5 with Google + Credentials, role-based route protection.",
    status: "Up next",
  },
  {
    icon: Sparkles,
    title: "Phase 2 · Public UI",
    description: "Landing page, course catalog, search & filters, single course page.",
    status: "Planned",
  },
  {
    icon: GraduationCap,
    title: "Phase 3 · Instructor",
    description: "Course builder, chapter management, signed Cloudinary uploads.",
    status: "Planned",
  },
] as const;

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-24 md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            Project bootstrapped — Phase 1 · Step 1 complete
          </span>

          <div className="flex flex-col gap-6">
            <h1 className="text-5xl font-semibold tracking-tight text-balance md:text-7xl">
              {siteConfig.name}
            </h1>
            <p className="max-w-2xl text-lg text-balance text-muted-foreground md:text-xl">
              {siteConfig.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/courses" />}>
              Browse courses
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/teach" />}
            >
              Become an instructor
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Build roadmap</h2>
          <p className="text-sm text-muted-foreground">
            We ship in small, reviewable steps. Each step updates{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">/docs/project-context.md</code> —
            the single source of truth for the project.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {phases.map((phase) => (
            <article
              key={phase.title}
              className="group rounded-xl border bg-card p-6 transition-colors hover:bg-accent/40"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <phase.icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">{phase.status}</span>
              </div>
              <h3 className="mb-1 text-base font-semibold">{phase.title}</h3>
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </span>
          <span>Built with Next.js · Prisma · Cloudinary · Tailwind · shadcn/ui</span>
        </div>
      </footer>
    </main>
  );
}
