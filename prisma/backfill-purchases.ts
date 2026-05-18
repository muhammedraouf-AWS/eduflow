/**
 * Backfill Purchase records for enrollments on paid courses that were
 * created before the Purchase model was wired up (e.g. via seed).
 *
 * Safe to re-run — skips enrollments that already have a Purchase row.
 *
 * Run: npx tsx prisma/backfill-purchases.ts
 */

import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"]! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // All enrollments on paid courses
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { price: { not: null } } },
    select: {
      userId: true,
      courseId: true,
      createdAt: true,
      course: { select: { price: true } },
    },
  });

  // Existing purchases (to skip)
  const existing = await prisma.purchase.findMany({
    select: { userId: true, courseId: true },
  });
  const existingSet = new Set(existing.map((p) => `${p.userId}:${p.courseId}`));

  const toCreate = enrollments.filter(
    (e) => !existingSet.has(`${e.userId}:${e.courseId}`)
  );

  if (toCreate.length === 0) {
    console.log("Nothing to backfill — all paid enrollments already have a Purchase row.");
    return;
  }

  console.log(`Backfilling ${toCreate.length} purchase(s)…`);

  for (const e of toCreate) {
    await prisma.purchase.create({
      data: {
        userId: e.userId,
        courseId: e.courseId,
        amount: e.course.price!,
        currency: "usd",
        stripePaymentIntentId: `sim_backfill_${e.userId}_${e.courseId}`,
        createdAt: e.createdAt,
      },
    });
    console.log(`  ✓ userId=${e.userId} courseId=${e.courseId} amount=${e.course.price}`);
  }

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
