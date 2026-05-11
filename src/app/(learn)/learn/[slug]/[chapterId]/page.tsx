import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

import { requireAuth } from "@/lib/session";
import { getCoursePlayer } from "@/features/student/queries/player";
import { VideoPlayer } from "@/features/student/components/video-player";
import { PlayerSidebar } from "@/features/student/components/player-sidebar";
import { ChapterNavigation } from "@/features/student/components/chapter-navigation";

interface PlayerPageProps {
  params: Promise<{ slug: string; chapterId: string }>;
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { slug, chapterId } = await params;
  const user = await requireAuth();
  const data = await getCoursePlayer(slug, chapterId, user.id);
  if (!data) return { title: "EduFlow" };
  return { title: `${data.chapter.title} — ${data.course.title} | EduFlow` };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug, chapterId } = await params;
  const user = await requireAuth();

  const data = await getCoursePlayer(slug, chapterId, user.id);
  if (!data) notFound();

  // Non-enrolled student hitting a paid chapter → back to course page
  if (!data.canWatch) {
    redirect(`/courses/${slug}`);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b bg-card px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/courses/${data.course.slug}`}
            className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Back to course"
          >
            <X className="size-5" />
          </Link>
          <span className="truncate text-sm font-medium">{data.course.title}</span>
        </div>
        {!data.isEnrolled && data.chapter.isFree && (
          <Link
            href={`/courses/${data.course.slug}`}
            className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Enroll to unlock all
          </Link>
        )}
      </header>

      {/* Main: video area + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content area */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
            {/* Video */}
            <VideoPlayer
              videoUrl={data.chapter.videoUrl}
              chapterId={chapterId}
              courseSlug={slug}
              isCompleted={data.chapter.isCompleted}
              isEnrolled={data.isEnrolled}
            />

            {/* Chapter info */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold">{data.chapter.title}</h1>
              {data.chapter.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.chapter.description}
                </p>
              )}
            </div>

            {/* Navigation */}
            <ChapterNavigation
              chapters={data.chapters}
              currentChapterId={chapterId}
              courseSlug={slug}
              isEnrolled={data.isEnrolled}
            />
          </div>
        </main>

        {/* Sidebar — hidden on mobile, visible md+ */}
        <div className="hidden w-72 shrink-0 overflow-hidden md:flex md:flex-col xl:w-80">
          <PlayerSidebar
            courseSlug={slug}
            chapters={data.chapters}
            currentChapterId={chapterId}
            isEnrolled={data.isEnrolled}
          />
        </div>
      </div>
    </div>
  );
}
