import { describe, expect, it } from "vitest";

import { applicationSchema } from "./application";
import { updateProfileSchema } from "./settings";

// ─── updateProfileSchema ─────────────────────────────────────────────────────

describe("updateProfileSchema", () => {
  const valid = {
    name: "Jane Doe",
    headline: "Senior React Developer",
    bio: "I teach web development.",
    website: "https://janedoe.dev",
    twitter: "janedoe",
    linkedin: "https://linkedin.com/in/janedoe",
  };

  it("accepts a fully populated profile", () => {
    expect(updateProfileSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a profile with only the required name field", () => {
    expect(updateProfileSchema.safeParse({ name: "Jane" }).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, name: "J" }).success,
    ).toBe(false);
  });

  it("rejects a name longer than 60 characters", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, name: "J".repeat(61) }).success,
    ).toBe(false);
  });

  it("rejects a headline longer than 120 characters", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, headline: "x".repeat(121) })
        .success,
    ).toBe(false);
  });

  it("accepts an empty headline (optional field)", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, headline: "" }).success,
    ).toBe(true);
  });

  it("rejects a bio longer than 2000 characters", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, bio: "x".repeat(2001) })
        .success,
    ).toBe(false);
  });

  it("rejects an invalid website URL", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, website: "not-a-url" }).success,
    ).toBe(false);
  });

  it("accepts an empty website (optional field)", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, website: "" }).success,
    ).toBe(true);
  });

  it("rejects an invalid LinkedIn URL", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, linkedin: "just-a-handle" })
        .success,
    ).toBe(false);
  });

  it("rejects a Twitter handle longer than 50 characters", () => {
    expect(
      updateProfileSchema.safeParse({ ...valid, twitter: "x".repeat(51) })
        .success,
    ).toBe(false);
  });
});

// ─── applicationSchema ───────────────────────────────────────────────────────

describe("applicationSchema", () => {
  const valid = {
    motivation: "I want to teach because ".padEnd(50, "x"),
    topics: "React and TypeScript",
    experience: "5 years of professional development",
  };

  it("accepts a valid application", () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an application without the optional experience field", () => {
    const { experience: _, ...rest } = valid;
    expect(applicationSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects motivation shorter than 50 characters", () => {
    expect(
      applicationSchema.safeParse({ ...valid, motivation: "Too short" }).success,
    ).toBe(false);
  });

  it("rejects motivation longer than 1000 characters", () => {
    expect(
      applicationSchema.safeParse({ ...valid, motivation: "x".repeat(1001) })
        .success,
    ).toBe(false);
  });

  it("rejects topics shorter than 10 characters", () => {
    expect(
      applicationSchema.safeParse({ ...valid, topics: "React" }).success,
    ).toBe(false);
  });

  it("rejects topics longer than 500 characters", () => {
    expect(
      applicationSchema.safeParse({ ...valid, topics: "x".repeat(501) })
        .success,
    ).toBe(false);
  });
});
