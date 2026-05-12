import "server-only";

import { db } from "@/lib/db";

export async function getInstructorAnalytics(userId: string) {
  const profile = await db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentEnrollments, allReviews, courses, allChapters] = await Promise.all([
    db.enrollment.findMany({
      where: {
        course: { instructorId: profile.id },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    db.review.findMany({
      where: { course: { instructorId: profile.id } },
      select: { rating: true },
    }),

    db.course.findMany({
      where: { instructorId: profile.id },
      orderBy: { totalStudents: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        totalStudents: true,
        avgRating: true,
        price: true,
        _count: {
          select: {
            reviews: true,
            chapters: { where: { isPublished: true } },
          },
        },
        purchases: { select: { amount: true } },
      },
    }),

    db.chapter.findMany({
      where: { course: { instructorId: profile.id }, isPublished: true },
      select: {
        id: true,
        title: true,
        course: { select: { title: true } },
      },
    }),
  ]);

  // Enrollment trend — fill every day in the last 30 days, even zeros
  const trendMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of recentEnrollments) {
    const key = e.createdAt.toISOString().slice(0, 10);
    trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  }
  const enrollmentTrend = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Rating distribution (5 → 1 order, Udemy-style)
  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of allReviews) {
    ratingDist[r.rating] = (ratingDist[r.rating] ?? 0) + 1;
  }
  const totalReviews = allReviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratingDist[star] ?? 0,
    pct:
      totalReviews > 0
        ? Math.round(((ratingDist[star] ?? 0) / totalReviews) * 100)
        : 0,
  }));

  // Top chapters by completion count
  const chapterIdList = allChapters.map((c) => c.id);
  const completionCounts =
    chapterIdList.length > 0
      ? await db.progress.groupBy({
          by: ["chapterId"],
          where: { chapterId: { in: chapterIdList }, isCompleted: true },
          _count: { chapterId: true },
          orderBy: { _count: { chapterId: "desc" } },
          take: 8,
        })
      : [];

  const chapterMap = new Map(allChapters.map((c) => [c.id, c]));
  const topChapters = completionCounts.map((cc) => ({
    chapterId: cc.chapterId,
    completions: cc._count.chapterId,
    title: chapterMap.get(cc.chapterId)?.title ?? "Unknown",
    courseTitle: chapterMap.get(cc.chapterId)?.course.title ?? "Unknown",
  }));

  // Course performance table
  const coursePerformance = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status as string,
    totalStudents: c.totalStudents,
    avgRating: c.avgRating,
    reviewCount: c._count.reviews,
    publishedChapters: c._count.chapters,
    price: c.price ? Number(c.price) : null,
    revenue: c.purchases.reduce((sum, p) => sum + Number(p.amount), 0),
  }));

  const totalRevenue = coursePerformance.reduce((sum, c) => sum + c.revenue, 0);
  const totalStudents = courses.reduce((sum, c) => sum + c.totalStudents, 0);

  return {
    enrollmentTrend,
    ratingDistribution,
    topChapters,
    coursePerformance,
    totalReviews,
    totalRevenue,
    totalStudents,
    newEnrollmentsThisMonth: recentEnrollments.length,
  };
}

export type InstructorAnalytics = NonNullable<
  Awaited<ReturnType<typeof getInstructorAnalytics>>
>;
