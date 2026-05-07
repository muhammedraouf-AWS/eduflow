import { Check } from "lucide-react";

export function CourseWhatYouLearn({ objectives }: { objectives: string[] }) {
  if (objectives.length === 0) return null;

  return (
    <section className="rounded-xl border p-6">
      <h2 className="mb-4 text-xl font-bold">What you&apos;ll learn</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {objectives.map((obj, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>{obj}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
