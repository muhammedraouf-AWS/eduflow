import "server-only";

import { db } from "@/lib/db";

export type InstructorStudent = {
  enrollmentId: string;
  userId: string;
  studentName: string | null;
  studentEmail: string;
  studentImage: string | null;
  courseId: string;
  courseTitle: string;
  enrolledAt: Date;
  totalChapters: number;
  completedChapters: number;
  hasCertificate: boolean;
};

export async function getInstructorStudents(
  userId: string,
  courseId?: string,
): Promise<InstructorStudent[]> {
  const profile = await db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  const enrollments = await db.enrollment.findMany({
    where: {
      course: { instructorId: profile.id },
      ...(courseId ? { courseId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      userId: true,
      courseId: true,
      user: { select: { name: true, email: true, image: true } },
      course: {
        select: {
          title: true,
          chapters: {
            where: { isPublished: true },
            select: { id: true },
          },
          certificates: {
            select: { userId: true },
          },
        },
      },
    },
  });

  if (enrollments.length === 0) return [];

  // Batch-fetch all completion records for the relevant students + chapters
  const allChapterIds = [
    ...new Set(enrollments.flatMap((e) => e.course.chapters.map((c) => c.id))),
  ];
  const allUserIds = [...new Set(enrollments.map((e) => e.userId))];

  const progressRecords = await db.progress.findMany({
    where: {
      userId: { in: allUserIds },
      chapterId: { in: allChapterIds },
      isCompleted: true,
    },
    select: { userId: true, chapterId: true },
  });

  // userId → Set<chapterId> for O(1) lookups
  const completedMap = new Map<string, Set<string>>();
  for (const p of progressRecords) {
    const existing = completedMap.get(p.userId);
    if (existing) {
      existing.add(p.chapterId);
    } else {
      completedMap.set(p.userId, new Set([p.chapterId]));
    }
  }

  return enrollments.map((e) => {
    const chapterIds = e.course.chapters.map((c) => c.id);
    const completedSet = completedMap.get(e.userId) ?? new Set<string>();
    const completedChapters = chapterIds.filter((id) =>
      completedSet.has(id),
    ).length;
    const hasCertificate = e.course.certificates.some(
      (cert) => cert.userId === e.userId,
    );

    return {
      enrollmentId: e.id,
      userId: e.userId,
      studentName: e.user.name,
      studentEmail: e.user.email,
      studentImage: e.user.image,
      courseId: e.courseId,
      courseTitle: e.course.title,
      enrolledAt: e.createdAt,
      totalChapters: chapterIds.length,
      completedChapters,
      hasCertificate,
    };
  });
}
