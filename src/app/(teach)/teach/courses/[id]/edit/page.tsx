import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { requireAuth } from "@/lib/session";
import { getCourseForEdit, getInstructorCategories } from "@/features/instructor/queries/courses";
import { getCourseChapters } from "@/features/instructor/queries/chapters";
import { getCourseAttachments } from "@/features/instructor/queries/attachments";
import { EditCourseForm } from "@/features/instructor/components/edit-course-form";
import { ThumbnailUploader } from "@/features/instructor/components/thumbnail-uploader";
import { PublishToggle } from "@/features/instructor/components/publish-toggle";
import { ChaptersList } from "@/features/instructor/components/chapters-list";
import { AddChapterForm } from "@/features/instructor/components/add-chapter-form";
import { AttachmentsManager } from "@/features/instructor/components/attachments-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteCourseButton } from "@/features/instructor/components/delete-course-button";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditCoursePageProps) {
  const { id } = await params;
  const user = await requireAuth();
  const course = await getCourseForEdit(id, user.id);
  if (!course) return { title: "Course not found — EduFlow" };
  return { title: `Edit: ${course.title} — EduFlow` };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const user = await requireAuth();

  const [course, categories, chapters, attachments] = await Promise.all([
    getCourseForEdit(id, user.id),
    getInstructorCategories(),
    getCourseChapters(id, user.id),
    getCourseAttachments(id, user.id),
  ]);

  if (!course) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/teach/courses"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            My Courses
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="max-w-55 truncate text-sm font-medium">{course.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={course.status === "PUBLISHED" ? "default" : "outline"}
            className="text-xs"
          >
            {course.status === "PUBLISHED" ? "Published" : "Draft"}
          </Badge>
          {course.status === "PUBLISHED" && (
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View live <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left: Edit form */}
        <div className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Course details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <EditCourseForm course={course} categories={categories} />
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <ThumbnailUploader courseId={course.id} currentUrl={course.thumbnailUrl} />
            </CardContent>
          </Card>

          {/* Chapters */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Chapters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <ChaptersList chapters={chapters ?? []} courseId={course.id} />
              <AddChapterForm courseId={course.id} />
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Downloadable resources</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <AttachmentsManager courseId={course.id} initialAttachments={attachments} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Publish status */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <PublishToggle courseId={course.id} status={course.status} />
            </CardContent>
          </Card>

          {/* Course info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Course info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="max-w-40 text-right font-mono text-xs break-all">
                  {course.slug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(course.createdAt))}
                </span>
              </div>
              {course.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(course.publishedAt))}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <DeleteCourseButton courseId={course.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
