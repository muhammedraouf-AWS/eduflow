import { BookOpen, CheckCircle2, GraduationCap } from "lucide-react";

const features = [
  "Expert-led courses across 50+ categories",
  "Learn at your own pace, anytime",
  "Earn verified certificates",
  "Track your progress in real time",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">EduFlow</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white/60 uppercase tracking-wider">
              <BookOpen className="size-4" />
              Learning platform
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Start your learning
              <br />
              journey today
            </h2>
            <p className="text-lg text-white/70">
              Join thousands of students already learning with EduFlow.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} EduFlow. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
