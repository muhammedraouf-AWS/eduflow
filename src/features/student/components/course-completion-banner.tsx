import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";

interface CourseCompletionBannerProps {
  certificateCode: string;
  courseTitle: string;
}

export function CourseCompletionBanner({
  certificateCode,
  courseTitle,
}: CourseCompletionBannerProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-teal-50 p-5 dark:border-emerald-800/40 dark:from-emerald-950/30 dark:to-teal-950/30">
      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-full bg-emerald-100 p-2.5 dark:bg-emerald-900/40">
          <Award className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">
            Congratulations! You&apos;ve completed the course
          </p>
          <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-300 truncate">
            {courseTitle}
          </p>
          <Link
            href={`/certificates/${certificateCode}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Award className="size-3.5" />
            View Certificate
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
