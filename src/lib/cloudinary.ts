import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";

/**
 * Server-side Cloudinary client.
 *
 * SECURITY: This module is marked `server-only` so it can NEVER be bundled
 * into the client. The API secret would otherwise leak. All upload signing
 * happens here; the browser uploads directly to Cloudinary using a short-lived
 * signature we generate per request.
 */
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Folder convention. Always compute paths server-side — never let the browser
 * dictate where files land. Keeps quotas, costs, and lookups predictable.
 */
export const cloudinaryFolders = {
  courseThumbnail: (courseId: string) => `lms/courses/${courseId}/thumbnail`,
  chapterVideo: (courseId: string, chapterId: string) =>
    `lms/courses/${courseId}/chapters/${chapterId}/video`,
  courseResources: (courseId: string) => `lms/courses/${courseId}/resources`,
  userAvatar: (userId: string) => `lms/users/${userId}/avatar`,
} as const;
