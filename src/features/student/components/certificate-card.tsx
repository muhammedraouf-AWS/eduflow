import Image from "next/image";
import Link from "next/link";
import { Award, BookOpen, Calendar, ExternalLink } from "lucide-react";

import type { StudentCertificate } from "@/features/student/queries/certificate";

export function CertificateCard({ cert }: { cert: StudentCertificate }) {
  const issued = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(cert.issuedAt));

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {/* Course thumbnail */}
      <div className="relative aspect-video w-full bg-muted">
        {cert.thumbnailUrl ? (
          <Image
            src={cert.thumbnailUrl}
            alt={cert.courseTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Completion badge */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
          <Award className="size-3" />
          Completed
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {cert.categoryName && (
          <span
            className="w-fit rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              background: cert.categoryColor ? `${cert.categoryColor}20` : undefined,
              color: cert.categoryColor ?? undefined,
            }}
          >
            {cert.categoryName}
          </span>
        )}

        <div>
          <h3 className="font-semibold leading-snug line-clamp-2">{cert.courseTitle}</h3>
          {cert.instructorName && (
            <p className="mt-0.5 text-xs text-muted-foreground">{cert.instructorName}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" />
          <span>Issued {issued}</span>
        </div>

        {/* Certificate ID */}
        <p className="font-mono text-[10px] text-muted-foreground/60 truncate">
          ID: {cert.code}
        </p>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-1">
          <Link
            href={`/certificates/${cert.code}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
          >
            <Award className="size-3.5" />
            View Certificate
          </Link>
          <Link
            href={`/courses/${cert.courseSlug}`}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            Course
          </Link>
        </div>
      </div>
    </div>
  );
}
