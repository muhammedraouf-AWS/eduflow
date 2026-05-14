import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, Calendar, ExternalLink, GraduationCap, User } from "lucide-react";

import { getCertificateByCode } from "@/features/student/queries/certificate";
import { siteConfig } from "@/config/site";
import { PrintButton } from "@/features/student/components/print-button";

interface CertificatePageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: CertificatePageProps): Promise<Metadata> {
  const { code } = await params;
  const cert = await getCertificateByCode(code);
  if (!cert) return { title: "Certificate Not Found — EduFlow" };

  return {
    title: `${cert.studentName ?? "Student"}'s Certificate — ${cert.courseTitle} | EduFlow`,
    description: `${cert.studentName ?? "A student"} has successfully completed ${cert.courseTitle} on EduFlow.`,
  };
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { code } = await params;
  const cert = await getCertificateByCode(code);

  if (!cert) notFound();

  const issuedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(cert.issuedAt));

  const verifyUrl = `${siteConfig.url}/certificates/${cert.code}`;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 print:bg-white">
      {/* Site nav bar (non-printed) */}
      <header className="border-b bg-white/80 backdrop-blur-sm print:hidden dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <GraduationCap className="size-5" />
            {siteConfig.name}
          </Link>
          <div className="flex items-center gap-3">
            <PrintButton />
            <Link
              href={`/courses/${cert.courseSlug}`}
              className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              View Course
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 print:p-0">
        {/* Certificate card */}
        <div
          id="certificate"
          className="relative overflow-hidden rounded-2xl border bg-white shadow-2xl print:rounded-none print:shadow-none dark:bg-slate-900"
        >
          {/* Decorative top bar */}
          <div className="h-2 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />

          {/* Corner ornaments */}
          <div className="pointer-events-none absolute left-6 top-6 size-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900/40" />
          <div className="pointer-events-none absolute right-6 top-6 size-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900/40" />
          <div className="pointer-events-none absolute bottom-6 left-6 size-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900/40" />
          <div className="pointer-events-none absolute bottom-6 right-6 size-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900/40" />

          {/* Main content */}
          <div className="px-8 py-12 text-center sm:px-16 sm:py-16">
            {/* Header: logo + platform name */}
            <div className="mb-10 flex flex-col items-center gap-2">
              <div className="flex items-center justify-center rounded-2xl bg-primary/10 p-4 dark:bg-primary/20">
                <Award className="size-10 text-primary" />
              </div>
              <p className="text-lg font-semibold tracking-widest text-primary uppercase">
                {siteConfig.name}
              </p>
            </div>

            {/* Certificate title */}
            <div className="mb-8 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Certificate of Completion
              </p>
              <div className="mx-auto mt-3 h-px w-24 bg-linear-to-r from-transparent via-border to-transparent" />
            </div>

            {/* Awarded text */}
            <p className="mb-3 text-base text-muted-foreground">
              This is to certify that
            </p>

            {/* Student name */}
            <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {cert.studentName ?? "A Valued Student"}
            </h1>

            <div className="mx-auto mb-6 h-px w-48 bg-linear-to-r from-transparent via-primary/30 to-transparent" />

            {/* Completion text */}
            <p className="mb-3 text-base text-muted-foreground">
              has successfully completed the course
            </p>

            {/* Course title */}
            <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
              {cert.courseTitle}
            </h2>

            {/* Category badge */}
            {cert.categoryName && (
              <span className="mb-8 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary dark:bg-primary/20">
                {cert.categoryName}
              </span>
            )}

            {/* Metadata row */}
            <div className="mx-auto mt-8 grid max-w-sm grid-cols-1 gap-4 sm:max-w-lg sm:grid-cols-3">
              {/* Issued date */}
              <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-muted/30 p-4 dark:bg-muted/10">
                <Calendar className="size-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Issued on</p>
                <p className="text-center text-sm font-semibold">{issuedDate}</p>
              </div>

              {/* Instructor */}
              <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-muted/30 p-4 dark:bg-muted/10">
                <User className="size-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Instructor</p>
                <p className="text-center text-sm font-semibold">
                  {cert.instructorName ?? "EduFlow Instructor"}
                </p>
              </div>

              {/* Platform */}
              <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-muted/30 p-4 dark:bg-muted/10">
                <BookOpen className="size-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="text-center text-sm font-semibold">{siteConfig.name}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-auto my-10 h-px w-full max-w-sm bg-linear-to-r from-transparent via-border to-transparent" />

            {/* Instructor signature area */}
            <div className="mx-auto flex max-w-xs flex-col items-center gap-1">
              <div className="h-px w-40 bg-border" />
              <p className="text-sm font-medium">
                {cert.instructorName ?? "EduFlow Team"}
              </p>
              <p className="text-xs text-muted-foreground">Course Instructor</p>
            </div>

            {/* Verification footer */}
            <div className="mx-auto mt-10 max-w-lg rounded-xl border border-dashed bg-muted/20 px-6 py-4 text-center dark:bg-muted/5">
              <p className="text-xs text-muted-foreground">
                Certificate ID:{" "}
                <span className="font-mono text-foreground">{cert.code}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Verify at{" "}
                <span className="font-mono text-primary">{verifyUrl}</span>
              </p>
            </div>
          </div>

          {/* Decorative bottom bar */}
          <div className="h-2 w-full bg-linear-to-r from-violet-500 via-indigo-500 to-blue-500" />
        </div>

        {/* Actions (non-printed) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <PrintButton variant="default" />
          <Link
            href={`/courses/${cert.courseSlug}`}
            className="flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <BookOpen className="size-4" />
            Back to course
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            My Learning
          </Link>
        </div>

        {/* Print-only footer */}
        <p className="mt-6 hidden text-center text-xs text-muted-foreground print:block">
          Verify this certificate at {verifyUrl}
        </p>
      </main>
    </div>
  );
}
