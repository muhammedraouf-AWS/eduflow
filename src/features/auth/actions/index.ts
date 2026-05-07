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

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
    return { redirectTo: callbackUrl };
  } catch (error) {
    if (isRedirectError(error)) {
      // signIn succeeded — session created, cookie set
      return { redirectTo: callbackUrl };
    }
    if (error instanceof AuthError) {
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
