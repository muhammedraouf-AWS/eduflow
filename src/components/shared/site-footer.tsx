import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/config/site";

const footerLinks = [
  {
    heading: "Learn",
    links: [
      { label: "Browse courses", href: "/courses" },
      { label: "Categories", href: "/courses" },
      { label: "Top instructors", href: "/instructors" },
    ],
  },
  {
    heading: "Teach",
    links: [
      { label: "Become an instructor", href: "/teach" },
      { label: "Teaching resources", href: "/teach/resources" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <GraduationCap className="size-5 text-primary" />
              <span>{siteConfig.name}</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">{siteConfig.tagline}</p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="mb-3 text-sm font-semibold">{group.heading}</p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
          <span>Built with Next.js · Prisma · Tailwind · shadcn/ui</span>
        </div>
      </div>
    </footer>
  );
}
