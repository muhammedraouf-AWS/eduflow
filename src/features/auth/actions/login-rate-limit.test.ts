import { AuthError } from "next-auth";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";
import { createTestUser, cleanupTestData } from "@/test/db-helpers";
import { loginFormAction } from "./index";

// signIn is mocked in src/test/setup.ts — pull it in so we can configure it
const { signIn } = await import("@/auth");

// Simulate a failed credentials login (what Auth.js throws on bad password)
function mockSignInFail() {
  const err = Object.assign(new AuthError("CredentialsSignin"), {
    type: "CredentialsSignin" as const,
  });
  vi.mocked(signIn).mockRejectedValue(err);
}

function makeFormData(email: string, password = "wrong") {
  const fd = new FormData();
  fd.set("email", email);
  fd.set("password", password);
  return fd;
}

describe("loginFormAction — rate limiting", () => {
  let userEmail: string;
  let userId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSignInFail();
    const user = await createTestUser();
    userEmail = user.email;
    userId = user.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it("increments loginAttempts by 1 on the first failed login", async () => {
    await loginFormAction(makeFormData(userEmail));

    const updated = await db.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true },
    });
    expect(updated?.loginAttempts).toBe(1);
  });

  it("accumulates loginAttempts across multiple failures", async () => {
    await loginFormAction(makeFormData(userEmail));
    await loginFormAction(makeFormData(userEmail));
    await loginFormAction(makeFormData(userEmail));

    const updated = await db.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true },
    });
    expect(updated?.loginAttempts).toBe(3);
  });

  it("sets lockedUntil after 10 failed attempts", async () => {
    // Seed 9 existing failures so the 10th call triggers the lock
    await db.user.update({
      where: { id: userId },
      data: { loginAttempts: 9 },
    });

    const result = await loginFormAction(makeFormData(userEmail));

    expect(result).toMatchObject({
      error: expect.stringContaining("locked"),
    });

    const updated = await db.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true, lockedUntil: true },
    });
    expect(updated?.loginAttempts).toBe(10);
    expect(updated?.lockedUntil).not.toBeNull();
    // Lock should be ~15 minutes in the future (allow ±5 s for test latency)
    const msUntilUnlock = updated!.lockedUntil!.getTime() - Date.now();
    expect(msUntilUnlock).toBeGreaterThan(14 * 60 * 1000);
    expect(msUntilUnlock).toBeLessThan(16 * 60 * 1000);
  });

  it("returns a lockout error immediately when lockedUntil is in the future", async () => {
    await db.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 10,
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const result = await loginFormAction(makeFormData(userEmail));

    expect(result).toMatchObject({
      error: expect.stringContaining("Too many failed attempts"),
    });
    // signIn must NOT be called — we short-circuit before attempting auth
    expect(signIn).not.toHaveBeenCalled();
  });

  it("does NOT track attempts for an email that does not exist", async () => {
    const result = await loginFormAction(makeFormData("ghost@example.com"));

    // Still returns the generic error, not a lockout message
    expect(result).toMatchObject({ error: "Invalid email or password" });
    // signIn WAS called (we let auth.js handle the not-found case)
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it("returns the generic error message (not an account-enumeration leak)", async () => {
    const result = await loginFormAction(makeFormData(userEmail));

    expect(result).toMatchObject({ error: "Invalid email or password" });
  });

  it("rejects validation before hitting the DB for an invalid email format", async () => {
    const result = await loginFormAction(makeFormData("not-an-email"));

    expect(result).toMatchObject({ error: "Invalid email or password" });
    // No DB hit and no signIn call
    expect(signIn).not.toHaveBeenCalled();
  });
});
