import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduFlow",
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen flex-col overflow-hidden">{children}</div>;
}
