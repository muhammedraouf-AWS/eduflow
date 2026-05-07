import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Type-safe environment variables.
 *
 * - Variables under `server` are NEVER exposed to the browser.
 * - Variables under `client` MUST be prefixed with `NEXT_PUBLIC_`.
 * - Validation runs at build time AND runtime — the app refuses to start
 *   if anything is missing or malformed. This catches misconfigured
 *   deployments (Vercel, Docker, etc.) before they reach users.
 */
export const env = createEnv({
  server: {
    // Runtime
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Database
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),

    // Auth.js v5
    AUTH_SECRET: z
      .string()
      .min(32, "AUTH_SECRET must be at least 32 chars (run: openssl rand -base64 32)"),
    AUTH_URL: z.string().url().optional(),

    // OAuth providers (optional during early development)
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),

    // Cloudinary (server-side — used to sign uploads)
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z
      .string()
      .min(1, "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required"),
  },
  /**
   * Next.js bundles `process.env` so destructuring server vars on the client
   * leaks them. We explicitly enumerate every var here.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
  /**
   * Run validation only on the server during build, and skip it for tests where
   * we may want to mock things out.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
