"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/features/auth/validations";
import { db } from "@/lib/db";

export async function loginAction(
  data: LoginInput,
  callbackUrl?: string,
): Promise<{ error: string } | { redirectTo: string }> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { redirectTo: callbackUrl ?? "/dashboard" };
  } catch (error) {
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
): Promise<{ error: string } | void> {
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
  } catch (error) {
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
