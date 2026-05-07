export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "EduFlow",
  shortName: "EduFlow",
  description:
    "EduFlow is a modern learning platform where instructors create world-class courses and students learn at their own pace.",
  tagline: "Learn anything. Teach anyone.",
  url: process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
  ogImage: "/og.png",
  authors: [{ name: "EduFlow", url: "https://eduflow.dev" }],
  keywords: [
    "online courses",
    "lms",
    "elearning",
    "udemy alternative",
    "course platform",
    "instructor",
    "students",
  ],
  links: {
    github: "",
    twitter: "",
    docs: "/docs",
  },
} as const;
