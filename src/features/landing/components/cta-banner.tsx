import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground md:px-16">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Ready to start learning?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-balance text-base opacity-85">
              Join thousands of students building real skills. Free to browse, easy to start.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-11 border border-white/20 bg-white px-6 text-base font-semibold text-primary hover:bg-white/90"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                Create free account
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-11 px-6 text-base font-semibold text-primary-foreground hover:bg-white/10"
                nativeButton={false}
                render={<Link href="/courses" />}
              >
                Browse courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
