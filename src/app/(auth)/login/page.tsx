import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue learning
        </p>
      </div>

      {error === "OAuthAccountNotLinked" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          This email is already linked to another sign-in method. Please sign
          in with your original method.
        </div>
      )}


      <LoginForm callbackUrl={callbackUrl} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground hover:underline"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
