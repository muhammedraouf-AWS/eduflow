import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { requireAuth } from "@/lib/session";
import { getChapterForEdit } from "@/features/instructor/queries/chapters";
import { ChapterEditForm } from "@/features/instructor/components/chapter-edit-form";
import { VideoUploader } from "@/features/instructor/components/video-uploader";
import { ChapterStatusCard } from "@/features/instructor/components/chapter-status-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChapterEditPageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export async function generateMetadata({ params }: ChapterEditPageProps) {
  const { id, chapterId } = await params;
  const user = await requireAuth();
  const chapter = await getChapterForEdit(chapterId, id, user.id);
  if (!chapter) return { title: "Chapter not found — EduFlow" };
  return { title: `Edit: ${chapter.title} — EduFlow` };
}

export default async function ChapterEditPage({ params }: ChapterEditPageProps) {
  const { id: courseId, chapterId } = await params;
  const user = await requireAuth();

  const chapter = await getChapterForEdit(chapterId, courseId, user.id);
  if (!chapter) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href={`/teach/courses/${courseId}/edit`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to course
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="max-w-[240px] truncate text-sm font-medium">{chapter.title}</span>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Left: Edit form + Video */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Chapter details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <ChapterEditForm chapter={chapter} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Video</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <VideoUploader
                courseId={courseId}
                chapterId={chapterId}
                currentVideoUrl={chapter.videoUrl}
                currentDuration={chapter.videoDuration}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Status card */}
        <div>
          <ChapterStatusCard
            chapterId={chapterId}
            courseId={courseId}
            isPublished={chapter.isPublished}
            isFree={chapter.isFree}
          />
        </div>
      </div>
    </div>
  );
}
