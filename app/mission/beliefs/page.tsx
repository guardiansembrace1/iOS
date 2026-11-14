import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Headings come from guardiansembrace.org/about-us. Body lines are short
// summaries, not the ministry's own wording. Swap in the approved text
// from the full Statement of Beliefs document before release.
const coreValues = [
  { title: "Faithfulness to God's Word", body: "Scripture is the foundation for our decisions and actions." },
  { title: "Biblical Family Relationships", body: "Marriage, parenting and family life built on God's design." },
  { title: "Financial Stewardship", body: "Managing God's resources wisely, generously and with integrity." },
  { title: "Protection of the Vulnerable", body: "Defending and nurturing children so they stay safe and grow in faith." },
  { title: "Discipleship & Community", body: "Faith encouraged through mentoring, teaching and outreach." },
];

const beliefs = [
  { title: "Biblical Family Relationships", body: "We support strong marriages and parenting, and encourage parents to teach their children the faith." },
  { title: "Christian Financial Stewardship", body: "We teach giving, generosity and sound money management as a way to honor God." },
  { title: "The Protection of God's Children", body: "We step in for exploited and at-risk children, partner with churches, and advocate for their well-being." },
];

function Section({ heading, items }: { heading: string; items: { title: string; body: string }[] }) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wide mb-3">
        {heading}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4"
          >
            <p className="font-semibold text-sm text-[var(--color-ink)] mb-1">{item.title}</p>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BeliefsPage() {
  return (
    <div className="p-5 pb-10">
      <Link
        href="/mission"
        className="flex items-center text-sm text-[var(--color-gold)] font-semibold mb-4"
      >
        <ChevronLeft size={16} /> Mission
      </Link>

      <h1 className="font-[family-name:var(--font-heading)] text-[26px] leading-tight text-[var(--color-ink)] mb-1">
        What we believe
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">
        Statement of beliefs and core values
      </p>

      <Section heading="Core values" items={coreValues} />
      <Section heading="Statement of beliefs" items={beliefs} />
    </div>
  );
}