"use client";
import { useEffect, useState } from "react";
import { BookOpen, Share2, Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PlanDay {
  passage_ref: string;
  reflection: string | null;
}

interface ProgressInfo {
  planTitle: string;
  currentDay: number;
  totalDays: number;
}

export default function TodayPage() {
  const [verse, setVerse] = useState<PlanDay | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: days } = await supabase
        .from("reading_plan_days")
        .select("passage_ref, reflection")
        .order("day_number", { ascending: true });

      if (days && days.length > 0) {
        const dayOfYear = Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
        );
        setVerse(days[dayOfYear % days.length]);
      }

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: prog } = await supabase
          .from("plan_progress")
          .select("current_day, plan_id, reading_plans(title, total_days)")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        if (prog?.reading_plans) {
          const plan = prog.reading_plans as unknown as { title: string; total_days: number };
          setProgress({
            planTitle: plan.title,
            currentDay: prog.current_day,
            totalDays: plan.total_days,
          });
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-5 pb-10">
      <h1 className="font-[family-name:var(--font-heading)] text-[28px] leading-tight text-[var(--color-ink)] mb-1">
        Good morning
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-5">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-40 bg-[var(--color-card-muted)] rounded-2xl" />
          <div className="h-24 bg-[var(--color-card-muted)] rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5 mb-4">
            <p className="text-[11px] font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3">
              Verse of the day
            </p>
            <p className="font-[family-name:var(--font-heading)] text-xl leading-relaxed text-[var(--color-ink)] mb-3">
              {verse?.reflection ??
                "Defend the poor and fatherless: do justice to the afflicted and needy."}
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {verse?.passage_ref ?? "Psalm 82:3"} · King James Version
            </p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-[var(--color-card-muted)] text-[var(--color-ink)] font-medium">
                <BookOpen size={14} /> Read chapter
              </button>
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-[var(--color-card-muted)] text-[var(--color-ink)] font-medium">
                <Bookmark size={14} /> Save
              </button>
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-[var(--color-card-muted)] text-[var(--color-ink)] font-medium">
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          {progress ? (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5">
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
                <div
                  className="h-full bg-[var(--color-gold)] transition-all"
                  style={{ width: `${(progress.currentDay / progress.totalDays) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-5 text-center">
              <p className="text-sm text-[var(--color-ink-muted)] mb-3">
                No reading plan started yet.
              </p>
              <button className="text-sm px-5 py-2 rounded-full bg-[var(--color-gold)] text-white font-semibold">
                Start a plan
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}