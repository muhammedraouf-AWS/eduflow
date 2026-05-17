"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn, signOut } from "@/auth";
import {
  loginSchema,
  registerSchema,
  type RegisterInput,
} from "@/features/auth/validations";
import { db } from "@/lib/db";

const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function loginFormAction(
  formData: FormData,
): Promise<{ error: string } | { redirectTo: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  const account = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, suspended: true, loginAttempts: true, lockedUntil: true },
  });

  if (account?.suspended) {
    return { error: "Your account has been suspended. Please contact support." };
  }

  if (account?.lockedUntil && account.lockedUntil > new Date()) {
    const minutes = Math.ceil((account.lockedUntil.getTime() - Date.now()) / 60_000);
    return {
      error: `Too many failed attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
    // Reset on success (non-redirect path — rare, but handle it)
    if (account?.id) {
      await db.user.update({
        where: { id: account.id },
        data: { loginAttempts: 0, lockedUntil: null },
      });
    }
    return { redirectTo: callbackUrl };
  } catch (error) {
    if (isRedirectError(error)) {
      // signIn succeeded — session created, reset failure counter
      if (account?.id && (account.loginAttempts ?? 0) > 0) {
        db.user
          .update({ where: { id: account.id }, data: { loginAttempts: 0, lockedUntil: null } })
          .catch(() => {});
      }
      return { redirectTo: callbackUrl };
    }
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin" && account?.id) {
        const newAttempts = (account.loginAttempts ?? 0) + 1;
        const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
        await db.user.update({
          where: { id: account.id },
          data: {
            loginAttempts: newAttempts,
            ...(shouldLock ? { lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) } : {}),
          },
        });
        if (shouldLock) {
          return { error: `Too many failed attempts. Your account is locked for 15 minutes.` };
        }
      }
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function registerAction(
  data: RegisterInput,
): Promise<{ error: string } | { redirectTo: string }> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({
    data: { name, email, hashedPassword },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { redirectTo: "/dashboard" };
  } catch (error) {
    if (isRedirectError(error)) {
      return { redirectTo: "/dashboard" };
    }
    if (error instanceof AuthError) {
      return { error: "Account created. Please sign in." };
    }
    throw error;
  }
}

export async function loginWithGoogleAction(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl") as string | null;
  await signIn("google", { redirectTo: callbackUrl ?? "/dashboard" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
