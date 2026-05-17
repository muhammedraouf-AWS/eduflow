import { describe, expect, it } from "vitest";

import { cn } from "./utils";
import { slugify } from "./slugify";

// ─── cn ──────────────────────────────────────────────────────────────────────

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple class names with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("drops falsy values (false, null, undefined, 0)", () => {
    expect(cn("foo", false, null, undefined, 0 as never, "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — last class wins", () => {
    // tailwind-merge: p-4 then p-2 → p-2
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles conditional class objects", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });

  it("returns an empty string when given no truthy classes", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

// ─── slugify ─────────────────────────────────────────────────────────────────

describe("slugify", () => {
  it("lowercases the input", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("react for beginners")).toBe("react-for-beginners");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("next  js  course")).toBe("next-js-course");
  });

  it("strips special characters", () => {
    expect(slugify("C++ & Algorithms!")).toBe("c-algorithms");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  ---hello---  ")).toBe("hello");
  });

  it("handles an already slug-like string unchanged", () => {
    expect(slugify("react-hooks-deep-dive")).toBe("react-hooks-deep-dive");
  });

  it("returns an empty string for an empty input", () => {
    expect(slugify("")).toBe("");
  });
});
