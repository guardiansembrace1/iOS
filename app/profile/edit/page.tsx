"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { friendlyAuthError } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import TextField from "@/components/auth/TextField";
import FormBanner from "@/components/auth/FormBanner";

export default function EditProfilePage() {
  const { userId, email, fullName, loading, reload } = useProfile();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 p-6">
        <div className="h-12 rounded-xl bg-[var(--color-card-muted)]" />
        <div className="h-12 rounded-xl bg-[var(--color-card-muted)]" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm text-[var(--color-ink-muted)]">
          Sign in to edit your profile.
        </p>
        <Link
          href="/sign-in"
          className="rounded-xl bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // Mounted only once the profile has loaded, so the field can take its
  // starting value straight from the loaded name — no effect needed.
  return (
    <EditProfileForm
      userId={userId}
      email={email}
      initialName={fullName ?? ""}
      reload={reload}
    />
  );
}

function EditProfileForm({
  userId,
  email,
  initialName,
  reload,
}: {
  userId: string;
  email: string | null;
  initialName: string;
  reload: () => Promise<void>;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }

    setSaving(true);
    // Keep the name in both places: metadata is what sign-up wrote, and the
    // profiles row is what staff screens read.
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    });
    // Mirror it onto the profiles row too, for staff screens that read from
    // there. Ignored if the table has no full_name column yet — the name in
    // user metadata above is the one the app reads.
    if (!authError) {
      await supabase
        .from("profiles")
        .update({ full_name: trimmed })
        .eq("id", userId);
    }
    setSaving(false);

    if (authError) {
      setError(friendlyAuthError(authError.message));
      return;
    }
    await reload();
    router.push("/profile");
  }

  return (
    <div className="flex min-h-full flex-col px-6 py-8">
      <Link
        href="/profile"
        className="-ml-1 mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-ink-muted)]"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="mb-1.5 font-[family-name:var(--font-heading)] text-[27px] leading-tight text-[var(--color-ink)]">
        Edit profile
      </h1>
      <p className="mb-7 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        This is the name staff see when you volunteer or give.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <FormBanner tone="error">{error}</FormBanner>}

        <TextField
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Jane Doe"
          autoComplete="name"
          disabled={saving}
        />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink)]">
            Email
          </label>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-muted)] p-3.5 text-sm text-[var(--color-ink-muted)]">
            {email}
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
            To change the email on your account, contact{" "}
            <a
              href="mailto:info@guardiansembrace.org"
              className="font-semibold text-[var(--color-gold)]"
            >
              info@guardiansembrace.org
            </a>
            .
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[var(--color-gold)] p-3.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
