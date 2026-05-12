import "server-only";

import { db } from "@/lib/db";

export type AttachmentForList = {
  id: string;
  name: string;
  url: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: Date;
};

export async function getCourseAttachments(
  courseId: string,
  instructorUserId: string,
): Promise<AttachmentForList[]> {
  const profile = await db.instructorProfile.findUnique({
    where: { userId: instructorUserId },
    select: { id: true },
  });
  if (!profile) return [];

  return db.attachment.findMany({
    where: { courseId, course: { instructorId: profile.id } },
    select: { id: true, name: true, url: true, fileSize: true, mimeType: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}
