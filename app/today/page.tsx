"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, Bookmark, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { pickVerse, type Verse } from "@/lib/verses";

interface Progress {
  planTitle: string;
  currentDay: number;
  totalDays: number;
}

const card = "bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5";
const chip =
  "flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-[var(--color-card-muted)] text-[var(--color-ink)] font-medium";

export default function TodayPage() {
  const pathname = usePathname();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [dateLabel, setDateLabel] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  // New verse on first load and every time this tab is opened again.
  // Date and verse are set in an effect (not during render) so the server
  // and browser HTML always match.
  useEffect(() => {
    setVerse(pickVerse());
    setDateLabel(
      new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })
    );
  }, [pathname]);

  // Reading-plan progress (signed-in members only).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;

        const { data } = await supabase
          .from("plan_progress")
          .select("current_day, reading_plans(title, total_days)")
          .eq("user_id", auth.user.id)
          .maybeSingle();

        const plan = data?.reading_plans as unknown as { title: string; total_days: number } | null;
        if (active && data && plan) {
          setProgress({
            planTitle: plan.title,
            currentDay: data.current_day,
            totalDays: plan.total_days,
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function shareVerse() {
    if (!verse) return;
    const text = `"${verse.text}" — ${verse.ref} (KJV)`;
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch {
      /* user cancelled share */
    }
  }

  const percent = progress ? Math.min(100, (progress.currentDay / progress.totalDays) * 100) : 0;

  return (
    <div className="p-5 pb-10">
      <h1 className="font-[family-name:var(--font-heading)] text-[28px] leading-tight text-[var(--color-ink)] mb-1">
        Good morning
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-5 min-h-5">{dateLabel}</p>

      <div className={`${card} mb-4`}>
        <p className="text-[11px] font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3">
          Verse of the day
        </p>

        {verse ? (
          <>
            <p className="font-[family-name:var(--font-heading)] text-xl leading-relaxed text-[var(--color-ink)] mb-3">
              {verse.text}
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">{verse.ref} · King James Version</p>
          </>
        ) : (
          <div className="animate-pulse space-y-2 mb-4">
            <div className="h-5 bg-[var(--color-card-muted)] rounded" />
            <div className="h-5 bg-[var(--color-card-muted)] rounded w-4/5" />
          </div>
        )}

        <div className="flex gap-2">
          <button className={chip}>
            <BookOpen size={14} /> Read chapter
          </button>
          <button className={chip}>
            <Bookmark size={14} /> Save
          </button>
          <button onClick={shareVerse} className={chip}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse h-24 bg-[var(--color-card-muted)] rounded-2xl" />
      ) : progress ? (
        <div className={card}>
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-[var(--color-ink)]">{progress.planTitle}</p>
            <button className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-gold)] text-white font-semibold">
              Continue
            </button>
          </div>
          <p className="text-sm text-[var(--color-ink-muted)] mb-3">
            Day {progress.currentDay} of {progress.totalDays}
          </p>
          <div className="h-2 bg-[var(--color-card-muted)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-gold)] transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : (
        <div className={`${card} text-center`}>
          <p className="text-sm text-[var(--color-ink-muted)] mb-3">No reading plan started yet.</p>
          <button className="text-sm px-5 py-2 rounded-full bg-[var(--color-gold)] text-white font-semibold">
            Start a plan
          </button>
        </div>
      )}
    </div>
  );
}