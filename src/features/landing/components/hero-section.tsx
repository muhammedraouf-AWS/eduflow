import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection({ courseCount }: { courseCount: number }) {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      {/* subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,currentColor,currentColor 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,currentColor,currentColor 1px,transparent 1px,transparent 60px)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-6 py-20 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {courseCount.toLocaleString()} courses available now
        </div>

        <h1 className="max-w-3xl text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Learn skills that{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            move your career
          </span>{" "}
          forward.
        </h1>

        <p className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
          Expert-led courses in web development, data science, design, and more. Learn at your pace
          — on any device.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="h-11 px-6 text-base" nativeButton={false} render={<Link href="/courses" />}>
            Browse all courses
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-base"
            nativeButton={false}
            render={<Link href="/teach" />}
          >
            Start teaching
          </Button>
        </div>
      </div>
    </section>
  );
}
