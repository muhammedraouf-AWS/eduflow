import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { createTestUser, cleanupTestData } from "@/test/db-helpers";
import { getStudentCertificates, isCourseCompleted } from "./certificate";

// ─── shared test fixtures ────────────────────────────────────────────────────

let studentId: string;
let instructorId: string;
let instructorProfileId: string;
let courseAId: string;
let courseBId: string;

beforeAll(async () => {
  const student = await createTestUser({ name: "Test Student" });
  studentId = student.id;

  const instructor = await createTestUser({ name: "Test Instructor" });
  instructorId = instructor.id;

  const profile = await db.instructorProfile.create({
    data: { userId: instructorId },
  });
  instructorProfileId = profile.id;

  const courseA = await db.course.create({
    data: {
      title: "Course A",
      slug: `course-a-${Date.now()}`,
      status: "PUBLISHED",
      instructorId: instructorProfileId,
    },
  });
  courseAId = courseA.id;

  const courseB = await db.course.create({
    data: {
      title: "Course B",
      slug: `course-b-${Date.now()}`,
      status: "PUBLISHED",
      instructorId: instructorProfileId,
    },
  });
  courseBId = courseB.id;
});

afterAll(async () => {
  // cleanupTestData deletes courses before users to satisfy the FK constraint
  await cleanupTestData();
});

// ─── getStudentCertificates ──────────────────────────────────────────────────

describe("getStudentCertificates", () => {
  it("returns an empty array when the student has no certificates", async () => {
    const certs = await getStudentCertificates(studentId);
    expect(certs).toEqual([]);
  });

  it("returns certificates after they are issued", async () => {
    await db.certificate.create({
      data: {
        code: `test-cert-a-${Date.now()}`,
        userId: studentId,
        courseId: courseAId,
      },
    });

    const certs = await getStudentCertificates(studentId);
    expect(certs).toHaveLength(1);
    expect(certs[0]).toMatchObject({
      courseTitle: "Course A",
      instructorName: "Test Instructor",
    });
  });

  it("returns certificates sorted newest-first", async () => {
    // courseA cert already exists from the previous test; add courseB cert
    await db.certificate.create({
      data: {
        code: `test-cert-b-${Date.now()}`,
        userId: studentId,
        courseId: courseBId,
      },
    });

    const certs = await getStudentCertificates(studentId);
    expect(certs.length).toBeGreaterThanOrEqual(2);
    // Most recently issued cert should be first
    expect(certs[0]!.courseTitle).toBe("Course B");
  });

  it("returns the expected shape for each certificate", async () => {
    const certs = await getStudentCertificates(studentId);
    const cert = certs[0]!;

    expect(cert).toHaveProperty("code");
    expect(cert).toHaveProperty("issuedAt");
    expect(cert).toHaveProperty("courseTitle");
    expect(cert).toHaveProperty("courseSlug");
    expect(cert).toHaveProperty("instructorName");
    expect(cert).toHaveProperty("categoryName");
    expect(cert).toHaveProperty("categoryColor");
    expect(cert.issuedAt).toBeInstanceOf(Date);
  });
});

// ─── isCourseCompleted ───────────────────────────────────────────────────────

describe("isCourseCompleted", () => {
  let chapterId: string;

  beforeAll(async () => {
    const chapter = await db.chapter.create({
      data: {
        title: "Chapter 1",
        position: 1,
        isPublished: true,
        courseId: courseAId,
      },
    });
    chapterId = chapter.id;
  });

  it("returns false when the student has not completed any chapters", async () => {
    const result = await isCourseCompleted(studentId, courseAId);
    expect(result).toBe(false);
  });

  it("returns true when all published chapters are completed", async () => {
    await db.progress.create({
      data: { userId: studentId, chapterId, isCompleted: true },
    });

    const result = await isCourseCompleted(studentId, courseAId);
    expect(result).toBe(true);
  });

  it("returns false when a course has no published chapters", async () => {
    // courseBId has no chapters
    const result = await isCourseCompleted(studentId, courseBId);
    expect(result).toBe(false);
  });
});
