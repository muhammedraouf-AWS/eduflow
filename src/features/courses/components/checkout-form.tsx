"use client";

import { useTransition } from "react";
import { CreditCard, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fakePurchaseAction } from "@/features/courses/actions/purchase";

interface CheckoutFormProps {
  courseId: string;
  price: number;
}

export function CheckoutForm({ courseId, price }: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>Demo mode</strong> — no real payment is processed. Click &quot;Complete purchase&quot; to simulate checkout.
      </div>

      {/* Fake card fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Card number</label>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
            <CreditCard className="size-4 shrink-0" />
            <span>4242 4242 4242 4242</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Expiry</label>
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              12 / 27
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">CVC</label>
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              123
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name on card</label>
          <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
            Demo User
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        size="lg"
        className="w-full"
        disabled={isPending}
        onClick={() => startTransition(() => fakePurchaseAction(courseId))}
      >
        <Lock className="size-4" />
        {isPending ? "Processing…" : `Complete purchase — $${price.toFixed(2)}`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Secured by EduFlow · 30-day money-back guarantee
      </p>
    </div>
  );
}
