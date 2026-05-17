import Link from "next/link";
import { Award } from "lucide-react";

import { requireAuth } from "@/lib/session";
import { getStudentCertificates } from "@/features/student/queries/certificate";
import { CertificateCard } from "@/features/student/components/certificate-card";

export const metadata = { title: "My Certificates — EduFlow" };

export default async function CertificatesPage() {
  const user = await requireAuth();
  const certificates = await getStudentCertificates(user.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <Award className="size-6 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold">My Certificates</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {certificates.length === 0
                  ? "Complete a course to earn your first certificate"
                  : `${certificates.length} certificate${certificates.length !== 1 ? "s" : ""} earned`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Award className="size-8 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No certificates yet</p>
              <p className="text-sm text-muted-foreground">
                Finish all lessons in a course to earn a certificate of completion.
              </p>
            </div>
            <Link
              href="/courses"
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <CertificateCard key={cert.code} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
