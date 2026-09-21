"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function GivePage() {
  const [amount, setAmount] = useState(50);
  const amounts = [25, 50, 100];

  return (
    <div className="p-5 pb-10">
      <h1 className="font-[family-name:var(--font-heading)] text-[26px] leading-tight text-[var(--color-ink)] mb-1">
        Give
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-5">Sponsor a child, or give once</p>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {amounts.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
              amount === a
                ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                : "bg-[var(--color-card)] text-[var(--color-ink)] border-[var(--color-border)]"
            }`}
          >
            {`$${a}`}
          </button>
        ))}
        <button className="py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm font-semibold text-[var(--color-ink)]">
          Other
        </button>
      </div>

      <a
        href="#"
        className="block text-center bg-[var(--color-success)] text-white rounded-xl p-3.5 font-semibold mb-5 shadow-sm"
      >
        {`Give $${amount} securely`}
      </a>

      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 flex justify-between items-center mb-4">
        <div>
          <p className="font-semibold text-sm text-[var(--color-ink)]">Sponsor a child</p>
          <p className="text-xs text-[var(--color-ink-muted)]">$40 a month · updates from staff</p>
        </div>
        <button className="text-xs px-4 py-2 rounded-full bg-[var(--color-gold)] text-white font-semibold shrink-0">
          Start
        </button>
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 mb-4">
        <p className="font-semibold text-sm text-[var(--color-ink)] mb-3">Impact Giving Store</p>
        <div className="flex justify-between py-2.5 border-b border-[var(--color-card-muted)]">
          <div>
            <p className="text-sm text-[var(--color-ink)]">School supplies</p>
            <p className="text-xs text-[var(--color-ink-muted)]">One child, one term</p>
          </div>
          <p className="font-semibold text-[var(--color-ink)]">$35</p>
        </div>
        <div className="flex justify-between pt-2.5">
          <div>
            <p className="text-sm text-[var(--color-ink)]">Meals for a week</p>
            <p className="text-xs text-[var(--color-ink-muted)]">Safe house</p>
          </div>
          <p className="font-semibold text-[var(--color-ink)]">$60</p>
        </div>
      </div>

      <div className="bg-[var(--color-success-bg)] rounded-xl p-3.5 flex gap-2.5">
        <ShieldCheck size={18} color="var(--color-success)" className="shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-success)] leading-relaxed">
          <strong>Apple takes nothing.</strong> A $100 gift arrives as $100 — no app-store
          commission on nonprofit donations, no processing fee through Zeffy.
        </p>
      </div>
    </div>
  );
}