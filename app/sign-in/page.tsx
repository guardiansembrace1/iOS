"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/auth/TextField";
import FormBanner from "@/components/auth/FormBanner";
import { signIn, friendlyAuthError } from "@/lib/auth";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Please enter your email.";
    if (!password) errors.password = "Please enter your password.";
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setFormError(friendlyAuthError(error.message));
      return;
    }

    router.push("/today");
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up your reading plan, notes and giving history."
      footer={
        <div className="space-y-4">
          <p className="text-center text-sm text-[var(--color-ink-muted)]">
            No account yet?{" "}
            <Link href="/sign-up" className="font-semibold text-[var(--color-gold)]">
              Create one
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
            autoComplete="current-password"
            error={fieldErrors.password}
            disabled={loading}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[var(--color-gold)]"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
