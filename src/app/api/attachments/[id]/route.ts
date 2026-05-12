import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const attachment = await db.attachment.findUnique({
    where: { id },
    select: {
      url: true,
      name: true,
      course: {
        select: {
          enrollments: {
            where: { userId: session.user.id },
            select: { id: true },
          },
          instructor: { select: { userId: true } },
        },
      },
    },
  });

  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isEnrolled = attachment.course.enrollments.length > 0;
  const isInstructor = attachment.course.instructor.userId === session.user.id;

  if (!isEnrolled && !isInstructor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch from Cloudinary and stream back with the original filename.
  // A redirect would let Cloudinary dictate the filename (the random public_id);
  // streaming through here lets us set Content-Disposition with attachment.name.
  const upstream = await fetch(attachment.url);
  if (!upstream.ok) {
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 502 });
  }

  const encoded = encodeURIComponent(attachment.name);
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${attachment.name}"; filename*=UTF-8''${encoded}`,
      ...(upstream.headers.get("Content-Length")
        ? { "Content-Length": upstream.headers.get("Content-Length")! }
        : {}),
    },
  });
}
