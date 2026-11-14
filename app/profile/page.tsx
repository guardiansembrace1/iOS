"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  Heart,
  KeyRound,
  LifeBuoy,
  LogOut,
  Mail,
  Pencil,
  Scale,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sendPasswordReset, friendlyAuthError } from "@/lib/auth";
import { useProfile, initialsFor, ROLE_LABELS } from "@/lib/useProfile";
import FormBanner from "@/components/auth/FormBanner";

export default function ProfilePage() {
  const { role, userId, email, fullName, createdAt, loading } = useProfile();
  const router = useRouter();

  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    router.push("/today");
    router.refresh();
  }

  async function handlePasswordReset() {
    if (!email) return;
    setNotice(null);
    setBusy(true);
    const { error } = await sendPasswordReset(email);
    setBusy(false);
    setNotice(
      error
        ? { tone: "error", text: friendlyAuthError(error.message) }
        : {
            tone: "success",
            text: `We sent a link to ${email}. Open it to set a new password.`,
          }
    );
  }

  async function handleDeleteAccount() {
    setNotice(null);
    setBusy(true);
    // Deleting an auth user cannot be done with the public key, so this calls a
    // database function that deletes the caller's own account. See the note in
    // the pull request for the SQL that creates it.
    const { error } = await supabase.rpc("delete_own_account");
    setBusy(false);

    if (error) {
      setNotice({
        tone: "error",
        text: "We could not delete your account automatically. Please email info@guardiansembrace.org and we will remove it for you.",
      });
      setConfirmDelete(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/today");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-5">
        <div className="h-24 rounded-2xl bg-[var(--color-card-muted)]" />
        <div className="h-40 rounded-2xl bg-[var(--color-card-muted)]" />
      </div>
    );
  }

  // ---------------------------------------------------------------- guest
  if (!userId) {
    return (
      <div className="flex min-h-full flex-col px-6 py-10">
        <div className="mb-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg-dark)]">
            <UserRound size={24} color="var(--color-gold)" />
          </div>
          <h1 className="mb-1.5 font-[family-name:var(--font-heading)] text-[27px] leading-tight text-[var(--color-ink)]">
            Your account
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
            You are reading as a guest. An account is free, and it keeps your
            place when you change phones.
          </p>
        </div>

        <ul className="mb-8 space-y-3">
          <Benefit icon={BookOpen} title="Your notes and reading plan">
            Saved to your account instead of this device.
          </Benefit>
          <Benefit icon={Heart} title="Your giving history">
            Receipts and recurring gifts in one place.
          </Benefit>
          <Benefit icon={Users} title="Serve with us">
            Apply to volunteer and sign up for shifts.
          </Benefit>
        </ul>

        <div className="space-y-3">
          <Link
            href="/sign-up"
            className="block rounded-xl bg-[var(--color-gold)] p-3.5 text-center text-sm font-semibold text-white shadow-sm"
          >
            Create an account
          </Link>
          <Link
            href="/sign-in"
            className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3.5 text-center text-sm font-semibold text-[var(--color-ink)]"
          >
            Sign in
          </Link>
          <Link
            href="/forgot-password"
            className="block pt-1 text-center text-xs font-semibold text-[var(--color-gold)]"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--color-ink-muted)]">
          The Bible, our mission and giving all work without an account.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------- member
  const joined = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="p-5 pb-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)] font-[family-name:var(--font-heading)] text-xl text-white">
          {initialsFor(fullName, email)}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-[family-name:var(--font-heading)] text-[24px] leading-tight text-[var(--color-ink)]">
            {fullName || "Your account"}
          </h1>
          <p className="truncate text-sm text-[var(--color-ink-muted)]">{email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-card-muted)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-ink)]">
              {ROLE_LABELS[role]}
            </span>
            {joined && (
              <span className="text-[11px] text-[var(--color-ink-muted)]">
                Since {joined}
              </span>
            )}
          </div>
        </div>
      </div>

      {notice && (
        <div className="mb-5">
          <FormBanner tone={notice.tone}>{notice.text}</FormBanner>
        </div>
      )}

      <Section label="Account">
        <Row href="/profile/edit" icon={Pencil} title="Edit profile" />
        <Row
          onClick={handlePasswordReset}
          icon={KeyRound}
          title="Change password"
          subtitle="We email you a link"
          disabled={busy}
        />
      </Section>

      <Section label="Guardian's Embrace">
        <Row
          href="https://guardiansembrace.org/contact-legal/"
          external
          icon={LifeBuoy}
          title="Help and contact"
        />
        <Row
          href="https://guardiansembrace.org/contact-legal/"
          external
          icon={Scale}
          title="Legal and 501(c)(3) information"
          subtitle="EIN 33-3158917"
        />
        <Row
          href="mailto:info@guardiansembrace.org"
          external
          icon={Mail}
          title="Email the ministry"
        />
      </Section>

      <button
        onClick={handleSignOut}
        disabled={busy}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3.5 text-sm font-semibold text-[var(--color-ink)] disabled:opacity-60"
      >
        <LogOut size={16} /> Sign out
      </button>

      {confirmDelete ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="mb-1 text-sm font-semibold text-red-700">
            Delete your account?
          </p>
          <p className="mb-4 text-xs leading-relaxed text-red-700">
            This removes your notes, reading plan and volunteer application
            permanently. Your giving records are kept, because the ministry has to
            keep them for tax purposes. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteAccount}
              disabled={busy}
              className="flex-1 rounded-xl bg-red-600 p-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Yes, delete it"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
              className="flex-1 rounded-xl bg-white p-3 text-sm font-semibold text-[var(--color-ink)]"
            >
              Keep my account
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600"
        >
          <Trash2 size={14} /> Delete my account
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- pieces

function Benefit({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <Icon size={18} color="var(--color-gold)" className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
          {children}
        </p>
      </div>
    </li>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
        {label}
      </h2>
      <div className="divide-y divide-[var(--color-card-muted)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        {children}
      </div>
    </section>
  );
}

function Row({
  href,
  external,
  onClick,
  icon: Icon,
  title,
  subtitle,
  disabled,
}: {
  href?: string;
  external?: boolean;
  onClick?: () => void;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  const inner = (
    <>
      <Icon size={17} color="var(--color-ink-muted)" className="shrink-0" />
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm text-[var(--color-ink)]">{title}</span>
        {subtitle && (
          <span className="block text-xs text-[var(--color-ink-muted)]">
            {subtitle}
          </span>
        )}
      </span>
      <ChevronRight size={16} color="var(--color-gold)" className="shrink-0" />
    </>
  );

  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors disabled:opacity-60";

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {inner}
    </button>
  );
}
