import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { cloudinary, cloudinaryFolders } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { courseId?: string };
  const { courseId } = body;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const profile = await db.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId: profile.id },
    select: { id: true },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const folder = cloudinaryFolders.courseThumbnail(courseId);
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET,
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
