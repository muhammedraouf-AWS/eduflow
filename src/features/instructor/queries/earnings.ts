import "server-only";

import { db } from "@/lib/db";

export async function getInstructorEarnings(userId: string) {
  const profile = await db.instructorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [purchases, courses] = await Promise.all([
    db.purchase.findMany({
      where: { course: { instructorId: profile.id } },
      select: {
        id: true,
        amount: true,
        currency: true,
        createdAt: true,
        stripePaymentIntentId: true,
        user: { select: { name: true, email: true, image: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    db.course.findMany({
      where: { instructorId: profile.id },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        purchases: { select: { amount: true } },
      },
    }),
  ]);

  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.amount), 0);

  const revenueThisMonth = purchases
    .filter((p) => p.createdAt >= thirtyDaysAgo)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const avgSalePrice =
    purchases.length > 0 ? totalRevenue / purchases.length : 0;

  const courseBreakdown = courses
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      price: c.price ? Number(c.price) : null,
      sales: c.purchases.length,
      revenue: c.purchases.reduce((sum, p) => sum + Number(p.amount), 0),
    }))
    .filter((c) => c.sales > 0)
    .sort((a, b) => b.revenue - a.revenue);

  return {
    purchases: purchases.map((p) => ({
      ...p,
      amount: Number(p.amount),
    })),
    totalRevenue,
    revenueThisMonth,
    avgSalePrice,
    totalSales: purchases.length,
    courseBreakdown,
  };
}

export type InstructorEarnings = NonNullable<
  Awaited<ReturnType<typeof getInstructorEarnings>>
>;
