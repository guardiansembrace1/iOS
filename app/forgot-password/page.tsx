"use client";
import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/auth/TextField";
import FormBanner from "@/components/auth/FormBanner";
import { sendPasswordReset, friendlyAuthError } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFieldError("");

    if (!email.trim()) {
      setFieldError("Please enter your email.");
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordReset(email.trim());
    setLoading(false);

    if (error) {
      setFormError(friendlyAuthError(error.message));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`If an account exists for ${email.trim()}, a reset link is on its way. The link expires in one hour.`}
        backHref="/sign-in"
      >
        <Link
          href="/sign-in"
          className="block w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-center text-sm font-semibold text-white shadow-sm"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you signed up with and we will send you a link to set a new password."
      backHref="/sign-in"
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
          error={fieldError}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
