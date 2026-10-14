"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/auth/TextField";
import FormBanner from "@/components/auth/FormBanner";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { supabase } from "@/lib/supabase";
import { updatePassword, friendlyAuthError } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;

type Stage = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Arriving from the email link, supabase-js reads the recovery token out of
  // the URL and creates a temporary session. That can land either before or
  // after this component mounts, so check both.
  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setStage("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStage((current) =>
        current === "ready" ? current : data.session ? "ready" : "invalid"
      );
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const errors: { password?: string; confirm?: string } = {};
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirm !== password) errors.confirm = "The two passwords do not match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setFormError(friendlyAuthError(error.message));
      return;
    }
    setStage("done");
  }

  if (stage === "checking") {
    return (
      <AuthShell title="One moment" subtitle="Checking your reset link…">
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-xl bg-[var(--color-card-muted)]" />
          <div className="h-12 animate-pulse rounded-xl bg-[var(--color-card-muted)]" />
        </div>
      </AuthShell>
    );
  }

  if (stage === "invalid") {
    return (
      <AuthShell
        title="That link has expired"
        subtitle="Reset links last one hour and can only be used once. Request a fresh one and it will arrive in a moment."
      >
        <Link
          href="/forgot-password"
          className="block w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-center text-sm font-semibold text-white shadow-sm"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (stage === "done") {
    return (
      <AuthShell
        title="Password updated"
        subtitle="You are signed in and ready to go."
      >
        <button
          onClick={() => {
            router.push("/today");
            router.refresh();
          }}
          className="w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-sm font-semibold text-white shadow-sm"
        >
          Continue
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose something you have not used on this account before."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && <FormBanner tone="error">{formError}</FormBanner>}

        <div>
          <TextField
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            autoComplete="new-password"
            error={fieldErrors.password}
            disabled={loading}
          />
          <PasswordStrength password={password} />
        </div>

        <TextField
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          error={fieldErrors.confirm}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthShell>
  );
}
