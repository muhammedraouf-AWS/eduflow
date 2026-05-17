import { db } from "@/lib/db";

export async function getInstructorProfileSettings(userId: string) {
  const [user, profile] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    }),
    db.instructorProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        headline: true,
        bio: true,
        avatarUrl: true,
        website: true,
        twitter: true,
        linkedin: true,
      },
    }),
  ]);

  if (!user || !profile) return null;
  return { user, profile };
}

export type ProfileSettings = NonNullable<Awaited<ReturnType<typeof getInstructorProfileSettings>>>;
