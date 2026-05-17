import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./index";

// ─── loginSchema ────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password longer than 128 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a password exactly 128 characters long", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(128),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an email longer than 254 characters", () => {
    const result = loginSchema.safeParse({
      email: "a".repeat(250) + "@b.com",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });
});

// ─── registerSchema ──────────────────────────────────────────────────────────

describe("registerSchema", () => {
  const valid = {
    name: "Alice",
    email: "alice@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    const issue = result.error?.issues[0];
    expect(issue?.path).toContain("confirmPassword");
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(registerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });

  it("rejects a name longer than 60 characters", () => {
    expect(
      registerSchema.safeParse({ ...valid, name: "A".repeat(61) }).success,
    ).toBe(false);
  });

  it("accepts a name exactly 60 characters long", () => {
    expect(
      registerSchema.safeParse({ ...valid, name: "A".repeat(60) }).success,
    ).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        password: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });

  it("rejects a password longer than 128 characters", () => {
    const long = "a".repeat(129);
    expect(
      registerSchema.safeParse({
        ...valid,
        password: long,
        confirmPassword: long,
      }).success,
    ).toBe(false);
  });

  it("accepts a password exactly 128 characters long", () => {
    const long = "a".repeat(128);
    expect(
      registerSchema.safeParse({
        ...valid,
        password: long,
        confirmPassword: long,
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid email format", () => {
    expect(
      registerSchema.safeParse({ ...valid, email: "not-an-email" }).success,
    ).toBe(false);
  });
});
