import { ChevronRight } from "lucide-react";

const journey = [
  { title: "Given and prayed over", desc: "Every gift is received and brought before the Lord." },
  { title: "A need is identified", desc: "Staff name the child, the family or the project, and budget it." },
  { title: "Carried out", desc: "Rescue, restoration, schooling, food, shelter." },
  { title: "Held for the long term", desc: "An account kept for each child, for the years ahead." },
];

export default function MissionPage() {
  return (
    <div className="p-5 pb-10">
      <h1 className="font-[family-name:var(--font-heading)] text-[26px] leading-tight text-[var(--color-ink)] mb-1">
        Our mission
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">
        Defending the vulnerable · San Diego
      </p>

      <h2 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wide mb-4">
        The journey of a gift
      </h2>
      <ol className="space-y-4 mb-6">
        {journey.map((step, i) => (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-gold)] shrink-0" />
              {i < journey.length - 1 && (
                <span className="w-px flex-1 bg-[var(--color-border)] mt-1" />
              )}
            </div>
            <div className="pb-1">
              <p className="font-semibold text-sm text-[var(--color-ink)] mb-0.5">
                {i + 1}. {step.title}
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <button className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm p-4 text-left flex justify-between items-center mb-3">
        <div>
          <p className="font-semibold text-[var(--color-ink)] text-sm">What we believe</p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Statement of beliefs and core values
          </p>
        </div>
        <ChevronRight size={18} color="var(--color-gold)" />
      </button>

      <a
        href="/volunteer-apply"
        className="block w-full bg-[var(--color-bg-dark)] rounded-2xl p-4 text-center"
      >
        <p className="font-semibold text-white text-sm">Volunteer with us</p>
        <p className="text-xs text-white/60 mt-0.5">Applications reviewed by staff</p>
      </a>
    </div>
  );
}