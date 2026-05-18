/**
 * Randomizes createdAt for all Enrollment and Purchase rows to simulate
 * realistic activity spread across the last 30 days.
 *
 * Run: npx tsx prisma/randomize-dates.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env["DATABASE_URL"]! }),
});

function randomDateInLastNDays(days: number): Date {
  const now = Date.now();
  const oldest = now - days * 24 * 60 * 60 * 1000;
  return new Date(oldest + Math.random() * (now - oldest));
}

async function main() {
  const enrollments = await db.enrollment.findMany({
    select: { id: true, userId: true, courseId: true },
  });

  console.log(`Randomizing ${enrollments.length} enrollment(s) and their purchases…`);

  for (const e of enrollments) {
    const date = randomDateInLastNDays(30);

    await db.enrollment.update({
      where: { id: e.id },
      data: { createdAt: date },
    });

    // Keep the matching purchase timestamp in sync
    await db.purchase.updateMany({
      where: { userId: e.userId, courseId: e.courseId },
      data: { createdAt: date },
    });
  }

  console.log("Done.");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => db.$disconnect());
