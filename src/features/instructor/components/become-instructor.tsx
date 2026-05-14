"use client";

import { Clock, XCircle } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { applyInstructorAction } from "@/features/instructor/actions/apply-instructor";

interface ApplicationState {
  status: "PENDING" | "REJECTED";
  rejectionReason?: string | null;
}

interface BecomeInstructorProps {
  userName?: string | null;
  application: ApplicationState | null;
}

function PendingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
            <Clock className="size-8 text-amber-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Application under review</h1>
          <p className="text-muted-foreground">
            Your application has been submitted. Our team will review it and get back to you soon.
            You&apos;ll be able to start teaching once it&apos;s approved.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationForm({
  userName,
  rejectionReason,
}: {
  userName?: string | null;
  rejectionReason?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await applyInstructorAction(formData);
      if ("error" in res) {
        setError(res.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  if (submitted) return <PendingState />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">
            {userName ? `Hey ${userName} —` : "Welcome —"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Apply to teach on EduFlow</h1>
          <p className="text-muted-foreground">
            Tell us a bit about yourself. We review every application and aim to respond within 2
            business days.
          </p>
        </div>

        {/* Rejection notice */}
        {rejectionReason && (
          <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Your previous application was rejected</p>
              <p className="mt-1 text-sm text-muted-foreground">{rejectionReason}</p>
              <p className="mt-2 text-sm text-muted-foreground">You&apos;re welcome to apply again below.</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="motivation" className="text-sm font-medium">
              Why do you want to teach on EduFlow? <span className="text-destructive">*</span>
            </label>
            <textarea
              id="motivation"
              name="motivation"
              required
              rows={4}
              placeholder="Share your passion for teaching and what drives you to share your knowledge…"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground">Minimum 50 characters.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="topics" className="text-sm font-medium">
              What topics do you want to teach? <span className="text-destructive">*</span>
            </label>
            <textarea
              id="topics"
              name="topics"
              required
              rows={3}
              placeholder="e.g. React, Python, Machine Learning, UI/UX Design…"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="experience" className="text-sm font-medium">
              Relevant experience{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="experience"
              name="experience"
              rows={3}
              placeholder="Industry experience, previous courses you've created, certifications, etc."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Submitting…" : "Submit Application"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function BecomeInstructor({ userName, application }: BecomeInstructorProps) {
  if (application?.status === "PENDING") return <PendingState />;

  return (
    <ApplicationForm
      userName={userName}
      rejectionReason={application?.status === "REJECTED" ? application.rejectionReason : null}
    />
  );
}
