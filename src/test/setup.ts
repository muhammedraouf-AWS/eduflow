import { vi } from "vitest";

// server-only throws in non-server environments — no-op it
vi.mock("server-only", () => ({}));

// next-auth imports next/server internally which doesn't resolve in Vitest's
// Node environment. Mock it at the package boundary so the action's
// `instanceof AuthError` check still works with our test-supplied errors.
vi.mock("next-auth", () => {
  class AuthError extends Error {
    type: string;
    constructor(type = "") {
      super(type);
      this.type = type;
    }
  }
  return { AuthError };
});;

// next/navigation — redirect/notFound throw special errors in real Next.js;
// in tests we make them throw plain errors so we can assert on them
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// next/cache — no-op all cache primitives (unit/integration tests don't need ISR)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: unknown) => fn),
}));

// next/headers — stubs for cookies/headers used in server actions
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
  headers: vi.fn(() => new Headers()),
}));

// Auth.js — default stubs; override per-test with vi.mocked(signIn).mockX
vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  updateSession: vi.fn(),
}));
