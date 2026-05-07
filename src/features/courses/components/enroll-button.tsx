"use client";

import Link from "next/link";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { enrollAction } from "@/features/courses/actions/enroll";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  price: number | null;
  isEnrolled: boolean;
  isLoggedIn: boolean;
}

export function EnrollButton({
  courseId,
  courseSlug,
  price,
  isEnrolled,
  isLoggedIn,
}: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (isEnrolled) {
    return (
      <Button size="lg" className="w-full" nativeButton={false} render={<Link href="/dashboard" />}>
        Continue learning
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button
        size="lg"
        className="w-full"
        nativeButton={false}
        render={<Link href={`/login?callbackUrl=/courses/${courseSlug}`} />}
      >
        {price ? `Buy for $${Number(price).toFixed(2)}` : "Enroll for free"}
      </Button>
    );
  }

  if (price !== null) {
    return (
      <Button size="lg" className="w-full" disabled>
        Buy for ${Number(price).toFixed(2)} — coming soon
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isPending}
      onClick={() => startTransition(() => enrollAction(courseId, courseSlug))}
    >
      {isPending ? "Enrolling…" : "Enroll for free"}
    </Button>
  );
}
