"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/today");
    router.refresh();
  }

  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-10">
      <h1 className="font-[family-name:var(--font-heading)] text-[26px] text-[var(--color-ink)] mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">Sign in to your account.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[var(--color-border)] rounded-xl p-3.5 bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[var(--color-border)] rounded-xl p-3.5 bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-gold)] text-white rounded-xl p-3.5 font-semibold shadow-sm disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-[var(--color-ink-muted)] mt-5 text-center">
        No account?{" "}
        <a href="/sign-up" className="text-[var(--color-gold)] font-semibold">
          Sign up
        </a>
      </p>
    </div>
  );
}