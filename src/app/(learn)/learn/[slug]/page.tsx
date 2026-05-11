import { redirect, notFound } from "next/navigation";

import { requireAuth } from "@/lib/session";
import { getFirstChapterId } from "@/features/student/queries/player";

interface LearnRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LearnRedirectPage({ params }: LearnRedirectPageProps) {
  const { slug } = await params;
  const user = await requireAuth();

  const result = await getFirstChapterId(slug, user.id);
  if (!result) notFound();

  redirect(`/learn/${result.slug}/${result.chapterId}`);
}
