"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function VolunteerApplyPage() {
  const [reason, setReason] = useState("");
  const [availability, setAvailability] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error" | "need-login">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setStatus("need-login");
      return;
    }

    const { error } = await supabase.from("volunteer_applications").insert({
      user_id: userData.user.id,
      application_data: { reason, availability },
    });

    setStatus(error ? "error" : "done");
  }

  if (status === "done") {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 size={40} color="var(--color-success)" className="mb-3" />
        <h1 className="font-[family-name:var(--font-heading)] text-xl text-[var(--color-ink)] mb-2">
          Application submitted
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          Staff will review your application. Once approved, a &quot;Serve&quot; tab will appear
          with open opportunities and shift sign-up.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-ink)] mb-1">
        Volunteer with us
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">
        Tell us a bit about yourself. Staff review every application.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          placeholder="Why do you want to volunteer?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-[var(--color-border)] rounded-xl p-3.5 bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
          rows={3}
          required
        />
        <input
          type="text"
          placeholder="Availability (e.g. weekday evenings)"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full border border-[var(--color-border)] rounded-xl p-3.5 bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
          required
        />

        {status === "need-login" && (
          <p className="text-sm text-red-600">
            Please{" "}
            <a href="/sign-in" className="underline font-semibold">
              sign in
            </a>{" "}
            first, then submit again.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">Something went wrong — please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-[var(--color-gold)] text-white rounded-xl p-3.5 font-semibold shadow-sm disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}