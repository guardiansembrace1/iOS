"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink as ExternalIcon, Lock, Mail, ShieldCheck } from "lucide-react";
import ExternalLink from "@/components/ExternalLink";
import { LINKS } from "@/lib/external";
import { useProfile } from "@/lib/useProfile";

type Choice = 25 | 50 | 100 | "other";

const AMOUNTS: Choice[] = [25, 50, 100, "other"];

// Items from the approved proposal. Prices are set on the ministry's Zeffy
// form, not here, so none are shown until the ministry confirms them.
const STORE_ITEMS = [
  { title: "School supplies", desc: "One child, one term" },
  { title: "Meals for a week", desc: "Safe house" },
];

export default function GivePage() {
  const { userId, loading } = useProfile();
  const [choice, setChoice] = useState<Choice>(50);
  const [opened, setOpened] = useState<string | null>(null);

  const hint =
    choice === "other"
      ? "Zeffy's page asks for the amount you want to give."
      : `Zeffy's page asks for the amount. Enter $${choice} there, or any amount you like.`;

  function opening(what: string) {
    setOpened(what);
  }

  return (
    <div className="p-5 pb-10">
      <h1 className="font-[family-name:var(--font-heading)] text-[26px] leading-tight text-[var(--color-ink)] mb-1">
        Give
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-5">
        Sponsor a child, or give once. No account needed.
      </p>

      <fieldset className="mb-2">
        <legend className="text-xs font-semibold text-[var(--color-ink)] mb-2">
          Pick a starting amount
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {AMOUNTS.map((a) => {
            const selected = choice === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setChoice(a)}
                aria-pressed={selected}
                className={`min-h-11 rounded-xl border text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                    : "bg-[var(--color-card)] text-[var(--color-ink)] border-[var(--color-border)] hover:bg-[var(--color-card-muted)]"
                }`}
              >
                {a === "other" ? "Other" : `$${a}`}
              </button>
            );
          })}
        </div>
      </fieldset>
      <p className="text-xs text-[var(--color-ink-muted)] mb-4" aria-live="polite">
        {hint}
      </p>

      <ExternalLink
        href={LINKS.zeffyDonate}
        onOpen={() => opening("checkout")}
        className="min-h-12 flex items-center justify-center gap-2 bg-[var(--color-success)] text-white rounded-xl px-4 py-3.5 font-semibold shadow-sm"
      >
        <Lock size={16} aria-hidden />
        Continue to secure checkout
      </ExternalLink>
      <p className="text-xs text-[var(--color-ink-muted)] text-center mt-2 mb-1">
        Opens Zeffy, the ministry&apos;s donation page, outside the app.
      </p>
      {opened && (
        <p role="status" className="text-xs text-[var(--color-success)] text-center mb-1">
          Zeffy opened in a new window. Come back here any time.
        </p>
      )}

      <div className="mt-5 bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 flex justify-between items-center gap-3 mb-4">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-[var(--color-ink)]">Sponsor a child</p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Set up on the ministry&apos;s Zeffy page
          </p>
        </div>
        <ExternalLink
          href={LINKS.zeffyDonate}
          onOpen={() => opening("sponsor")}
          className="min-h-11 inline-flex items-center gap-1 text-xs px-4 rounded-full bg-[var(--color-gold)] text-white font-semibold shrink-0"
        >
          Start
          <ExternalIcon size={13} aria-hidden />
        </ExternalLink>
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 mb-4">
        <p className="font-semibold text-sm text-[var(--color-ink)]">Impact Giving Store</p>
        <p className="text-xs text-[var(--color-ink-muted)] mb-1">
          Give toward something specific. You choose the amount on Zeffy.
        </p>
        <ul>
          {STORE_ITEMS.map((item, i) => (
            <li
              key={item.title}
              className={i < STORE_ITEMS.length - 1 ? "border-b border-[var(--color-card-muted)]" : ""}
            >
              <ExternalLink
                href={LINKS.zeffyDonate}
                onOpen={() => opening(item.title)}
                className="min-h-12 flex justify-between items-center gap-3 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm text-[var(--color-ink)]">{item.title}</span>
                  <span className="block text-xs text-[var(--color-ink-muted)]">{item.desc}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-gold-dark)] shrink-0">
                  Give
                  <ChevronRight size={15} aria-hidden />
                </span>
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>

      {!loading && userId && (
        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 mb-4 flex gap-3">
          <Mail size={18} color="var(--color-gold-dark)" className="shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold text-sm text-[var(--color-ink)]">Giving history</p>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
              Zeffy emails a receipt for every gift to the address you give at checkout. Keep
              those for your records and taxes.
            </p>
          </div>
        </div>
      )}

      {!loading && !userId && (
        <p className="text-xs text-[var(--color-ink-muted)] mb-4 leading-relaxed">
          Zeffy emails your receipt.{" "}
          <Link href="/sign-up" className="font-semibold text-[var(--color-gold-dark)] underline">
            A free account
          </Link>{" "}
          adds notes, highlights and your saved place in the Bible.
        </p>
      )}

      <div className="bg-[var(--color-success-bg)] rounded-xl p-3.5 flex gap-2.5">
        <ShieldCheck size={18} color="var(--color-success)" className="shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-[var(--color-success)] leading-relaxed">
          <strong>Apple takes nothing.</strong> Gifts go through Zeffy, not an in-app purchase,
          so there is no app-store cut. Zeffy charges the ministry no fees. It may ask you for an
          optional tip to Zeffy, which you can set to zero.
        </p>
      </div>
    </div>
  );
}
