import "server-only";

import { db } from "@/lib/db";

export type CertificateData = {
  code: string;
  issuedAt: Date;
  studentName: string | null;
  courseTitle: string;
  courseSlug: string;
  instructorName: string | null;
  categoryName: string | null;
};

/** Fetch a certificate by its public share code (for the public cert page). */
export async function getCertificateByCode(
  code: string,
): Promise<CertificateData | null> {
  const cert = await db.certificate.findUnique({
    where: { code },
    select: {
      code: true,
      issuedAt: true,
      user: { select: { name: true } },
      course: {
        select: {
          title: true,
          slug: true,
          instructor: { select: { user: { select: { name: true } } } },
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!cert) return null;

  return {
    code: cert.code,
    issuedAt: cert.issuedAt,
    studentName: cert.user.name,
    courseTitle: cert.course.title,
    courseSlug: cert.course.slug,
    instructorName: cert.course.instructor.user.name,
    categoryName: cert.course.category?.name ?? null,
  };
}

/** Check if a student has a certificate for a specific course. */
export async function getCourseCertificate(
  userId: string,
  courseId: string,
): Promise<{ code: string; issuedAt: Date } | null> {
  const cert = await db.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { code: true, issuedAt: true },
  });
  return cert ?? null;
}

/** Returns true when all published chapters of the course are completed by the user. */
export async function isCourseCompleted(
  userId: string,
  courseId: string,
): Promise<boolean> {
  const publishedChapterIds = await db.chapter.findMany({
    where: { courseId, isPublished: true },
    select: { id: true },
  });

  if (publishedChapterIds.length === 0) return false;

  const completedCount = await db.progress.count({
    where: {
      userId,
      chapterId: { in: publishedChapterIds.map((c) => c.id) },
      isCompleted: true,
    },
  });

  return completedCount === publishedChapterIds.length;
}
