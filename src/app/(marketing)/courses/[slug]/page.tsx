import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/session";
import { CourseCurriculum } from "@/features/courses/components/course-curriculum";
import { CourseHero } from "@/features/courses/components/course-hero";
import { CourseInstructor } from "@/features/courses/components/course-instructor";
import { CourseReviews } from "@/features/courses/components/course-reviews";
import { CourseSidebar } from "@/features/courses/components/course-sidebar";
import { CourseWhatYouLearn } from "@/features/courses/components/course-what-you-learn";
import {
  getCourseBySlug,
  getEnrollmentStatus,
} from "@/features/courses/queries/course-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found — EduFlow" };
  return {
    title: `${course.title} — EduFlow`,
    description: course.shortDescription ?? course.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [course, user] = await Promise.all([getCourseBySlug(slug), getCurrentUser()]);

  if (!course) notFound();

  const isEnrolled = user
    ? await getEnrollmentStatus(user.id, course.id)
    : false;

  const isLoggedIn = !!user;

  return (
    <>
      {/* Dark hero — spans full width */}
      <CourseHero course={course} />

      {/* Content area */}
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex gap-10">
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-10">
            <CourseWhatYouLearn objectives={course.objectives} />

            {/* Requirements */}
            {course.requirements.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold">Requirements</h2>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Description */}
            {course.description && (
              <section>
                <h2 className="mb-4 text-xl font-bold">About this course</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line text-sm leading-relaxed">{course.description}</p>
                </div>
              </section>
            )}

            <CourseCurriculum chapters={course.chapters} />
            <CourseInstructor instructor={course.instructor} />
            <CourseReviews reviews={course.reviews} avgRating={course.avgRating} />
          </div>

          {/* Sticky sidebar — desktop only */}
          <div className="hidden shrink-0 lg:block lg:w-80 xl:w-96">
            <div className="sticky top-20">
              <CourseSidebar
                course={course}
                isEnrolled={isEnrolled}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>
        </div>

        {/* Mobile CTA bar */}
        <div className="mt-10 lg:hidden">
          <CourseSidebar
            course={course}
            isEnrolled={isEnrolled}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </>
  );
}
