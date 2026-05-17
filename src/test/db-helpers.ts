import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

// All test records are tagged with this prefix so cleanupTestData() is safe
const TEST_EMAIL_PREFIX = "vitest_";

export function testEmail(label: string) {
  return `${TEST_EMAIL_PREFIX}${label}_${Date.now()}@example.com`;
}

export async function createTestUser(
  overrides: Partial<{
    name: string;
    email: string;
    hashedPassword: string;
    suspended: boolean;
    loginAttempts: number;
    lockedUntil: Date | null;
  }> = {},
) {
  const email = overrides.email ?? testEmail("user");
  const hashedPassword =
    overrides.hashedPassword ?? (await bcrypt.hash("password123", 10));

  return db.user.create({
    data: {
      name: "Test User",
      email,
      hashedPassword,
      loginAttempts: 0,
      ...overrides,
    },
  });
}

export async function deleteTestUser(id: string) {
  // Cascade deletes handle related records
  await db.user.deleteMany({ where: { id } });
}

/** Remove every record created by this test suite. Call in afterAll. */
export async function cleanupTestData() {
  // Course.instructorId → InstructorProfile has no cascade delete.
  // Delete courses owned by test instructors before deleting the users.
  const testProfiles = await db.instructorProfile.findMany({
    where: { user: { email: { startsWith: TEST_EMAIL_PREFIX } } },
    select: { id: true },
  });
  if (testProfiles.length > 0) {
    await db.course.deleteMany({
      where: { instructorId: { in: testProfiles.map((p) => p.id) } },
    });
  }

  // User cascade deletes: InstructorProfile, Enrollment, Progress, Certificate, etc.
  await db.user.deleteMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
  });
}
