"use client";
import { useEffect, useState } from "react";
import { MapPin, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  slots_available: number | null;
}

export default function ServePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [signedUpIds, setSignedUpIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id ?? null;
    setUserId(uid);

    const { data: opps } = await supabase
      .from("volunteer_opportunities")
      .select("*")
      .order("starts_at", { ascending: true });
    if (opps) setOpportunities(opps as Opportunity[]);

    if (uid) {
      const { data: signups } = await supabase
        .from("shift_signups")
        .select("opportunity_id")
        .eq("user_id", uid);
      if (signups) setSignedUpIds(signups.map((s) => s.opportunity_id));
    }
    setLoading(false);
  }

  async function signUp(opportunityId: string) {
    if (!userId) return;
    const { error } = await supabase.from("shift_signups").insert({
      opportunity_id: opportunityId,
      user_id: userId,
    });
    if (!error) setSignedUpIds((prev) => [...prev, opportunityId]);
  }

  return (
    <div className="p-5 pb-10">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-ink)] mb-1">
        Serve
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-5">
        Open opportunities and shift sign-up
      </p>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-24 bg-[var(--color-card-muted)] rounded-2xl" />
          <div className="h-24 bg-[var(--color-card-muted)] rounded-2xl" />
        </div>
      ) : opportunities.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          No open opportunities right now — check back soon.
        </p>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const isSignedUp = signedUpIds.includes(opp.id);
            return (
              <div
                key={opp.id}
                className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4"
              >
                <p className="font-semibold text-[var(--color-ink)] text-sm mb-1">{opp.title}</p>
                {opp.description && (
                  <p className="text-xs text-[var(--color-ink-muted)] mb-3 leading-relaxed">
                    {opp.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {opp.location ?? "TBD"}
                    </span>
                    {opp.starts_at && (
                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        {new Date(opp.starts_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => signUp(opp.id)}
                    disabled={isSignedUp}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-semibold shrink-0 ${
                      isSignedUp
                        ? "bg-[var(--color-card-muted)] text-[var(--color-ink-muted)]"
                        : "bg-[var(--color-gold)] text-white"
                    }`}
                  >
                    {isSignedUp ? "Signed up" : "Sign up"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}