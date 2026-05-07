interface Stats {
  courses: number;
  instructors: number;
  students: number;
}

function formatBig(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
  return `${n}+`;
}

const statItems = (stats: Stats) => [
  { value: formatBig(stats.students), label: "Students enrolled" },
  { value: formatBig(stats.courses), label: "Courses available" },
  { value: formatBig(stats.instructors), label: "Expert instructors" },
  { value: "4.8", label: "Average rating" },
];

export function StatsSection({ stats }: { stats: Stats }) {
  return (
    <section className="border-y bg-primary py-14 text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statItems(stats).map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1 text-center">
              <span className="text-4xl font-bold tracking-tight md:text-5xl">{value}</span>
              <span className="text-sm font-medium opacity-80">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
