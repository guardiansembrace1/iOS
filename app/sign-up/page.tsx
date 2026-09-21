"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/today");
    router.refresh();
  }

  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-10">
      <h1 className="font-[family-name:var(--font-heading)] text-[26px] text-[var(--color-ink)] mb-1">
        Create an account
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">
        Optional — save notes, highlights, and your giving history.
      </p>

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
          minLength={6}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-gold)] text-white rounded-xl p-3.5 font-semibold shadow-sm disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-[var(--color-ink-muted)] mt-5 text-center">
        Already have an account?{" "}
        <a href="/sign-in" className="text-[var(--color-gold)] font-semibold">
          Sign in
        </a>
      </p>
    </div>
  );
}