export const revalidate = 900;

import { CtaBanner } from "@/features/landing/components/cta-banner";
import { CategoriesSection } from "@/features/landing/components/categories-section";
import { FeaturedCourses } from "@/features/landing/components/featured-courses";
import { HeroSection } from "@/features/landing/components/hero-section";
import { InstructorsSection } from "@/features/landing/components/instructors-section";
import { StatsSection } from "@/features/landing/components/stats-section";
import {
  getCategories,
  getFeaturedCourses,
  getLandingStats,
  getTopInstructors,
} from "@/features/landing/queries";

export default async function HomePage() {
  const [courses, categories, stats, instructors] = await Promise.all([
    getFeaturedCourses(),
    getCategories(),
    getLandingStats(),
    getTopInstructors(),
  ]);

  return (
    <>
      <HeroSection courseCount={stats.courses} />
      <CategoriesSection categories={categories} />
      <FeaturedCourses courses={courses} />
      <StatsSection stats={stats} />
      <InstructorsSection instructors={instructors} />
      <CtaBanner />
    </>
  );
}
