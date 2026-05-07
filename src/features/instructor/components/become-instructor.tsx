"use client";

import { useState } from "react";
import { BarChart2, BookOpen, DollarSign, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { becomeInstructorAction } from "@/features/instructor/actions/become-instructor";

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Create courses your way",
    body: "Build structured courses with videos, attachments, and chapter quizzes at your own pace.",
  },
  {
    icon: Users,
    title: "Reach real students",
    body: "Your courses are visible to the EduFlow catalog the moment you publish them.",
  },
  {
    icon: DollarSign,
    title: "Set your own price",
    body: "Offer courses for free or charge what you think they're worth — you decide.",
  },
  {
    icon: BarChart2,
    title: "Track your impact",
    body: "See enrollment counts, ratings, and earnings in your instructor dashboard.",
  },
];

export function BecomeInstructor({ userName }: { userName?: string | null }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsPending(true);
    setError(null);
    const result = await becomeInstructorAction();
    if ("error" in result) {
      setError(result.error);
      setIsPending(false);
    } else {
      window.location.href = result.redirectTo;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl space-y-10 text-center">
        {/* Heading */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">
            {userName ? `Hey ${userName} —` : "Welcome —"}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Start teaching on EduFlow
          </h1>
          <p className="text-lg text-muted-foreground">
            Share what you know. Build a course once, help students forever.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-5 space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <p className="font-semibold text-sm">{title}</p>
              </div>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          size="lg"
          className="px-10"
          disabled={isPending}
          onClick={handleClick}
        >
          {isPending ? "Setting up your account…" : "Start Teaching"}
        </Button>

        <p className="text-xs text-muted-foreground">
          You can always go back to browsing courses as a student.
        </p>
      </div>
    </div>
  );
}
