"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/auth/TextField";
import FormBanner from "@/components/auth/FormBanner";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { signUp, friendlyAuthError } from "@/lib/auth";

const TERMS_VERSION = "2026-10-01";
const MIN_PASSWORD_LENGTH = 8;

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
}

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!fullName.trim()) errors.fullName = "Please enter your name.";
    if (!email.trim()) {
      errors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "That does not look like a valid email address.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirm !== password) errors.confirm = "The two passwords do not match.";
    if (!acceptedTerms) errors.terms = "Please accept the terms to continue.";
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const { data, error } = await signUp(email.trim(), password, {
      fullName: fullName.trim(),
      acceptedTermsVersion: TERMS_VERSION,
    });
    setLoading(false);

    if (error) {
      setFormError(friendlyAuthError(error.message));
      return;
    }

    // Supabase returns no session when email confirmation is switched on.
    if (!data.session) {
      setCheckInbox(true);
      return;
    }

    router.push("/today");
    router.refresh();
  }

  if (checkInbox) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`We sent a confirmation link to ${email.trim()}. Open it to finish setting up your account.`}
      >
        <div className="flex flex-col items-start gap-5">
          <div className="w-11 h-11 rounded-2xl bg-[var(--color-card-muted)] flex items-center justify-center">
            <Mail size={20} color="var(--color-gold)" />
          </div>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            No email after a minute or two? Check your spam folder, or go back and
            make sure the address is right.
          </p>
          <Link
            href="/sign-in"
            className="w-full text-center rounded-xl bg-[var(--color-gold)] p-3.5 text-sm font-semibold text-white shadow-sm"
          >
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Optional — it saves your notes, highlights, reading plan and giving history. You can keep reading without one."
      footer={
        <div className="space-y-4">
          <p className="text-center text-sm text-[var(--color-ink-muted)]">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-[var(--color-gold)]">
              Sign in
            </Link>
          </p>
          <Link
            href="/today"
            className="block text-center text-sm font-medium text-[var(--color-ink-muted)] underline"
          >
            Continue without an account
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && <FormBanner tone="error">{formError}</FormBanner>}

        <TextField
          label="Full name"
          value={fullName}
          onChange={setFullName}
          placeholder="Jane Doe"
          autoComplete="name"
          error={fieldErrors.fullName}
          disabled={loading}
        />

        <TextField
          label="Email"
          type="email"
          inputMode="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={fieldErrors.email}
          disabled={loading}
        />

        <div>
          <TextField
            label="Password"
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
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          error={fieldErrors.confirm}
          disabled={loading}
        />

        <div>
          <label className="flex gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-gold)]"
            />
            <span className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-[var(--color-gold)]">
                terms of use
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[var(--color-gold)]">
                privacy policy
              </Link>
              .
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.terms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
