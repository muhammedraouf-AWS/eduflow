import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Prisma client singleton.
 *
 * Why driver adapter? Prisma 7 ships without a built-in query engine binary —
 * you bring your own driver. `@prisma/adapter-pg` uses node-postgres under the
 * hood and works seamlessly with Neon's pooled connection string, local
 * Postgres, AWS RDS, etc. (Future option: swap for `@prisma/adapter-neon` to
 * gain Edge Runtime support and Neon's serverless WebSocket driver.)
 *
 * Why singleton? In Next.js dev, hot module reload re-evaluates server modules
 * on every change. Without this guard each reload spawns a NEW PrismaClient
 * which exhausts your DB connection pool within seconds. We stash the instance
 * on `globalThis` so HMR reuses the same one. In production each Vercel
 * function instance gets its own fresh client, which is what we want.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
