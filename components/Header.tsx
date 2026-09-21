"use client";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/useProfile";

export default function Header() {
  const { userId, email, loading } = useProfile();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/today");
    router.refresh();
  }

  return (
    <header className="safe-top shrink-0 bg-[var(--color-bg-dark)] text-white">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Shield
            size={18}
            className="shrink-0"
            color="var(--color-gold)"
            fill="var(--color-gold)"
            fillOpacity={0.15}
          />
          <span className="font-[family-name:var(--font-heading)] text-sm leading-none tracking-wide truncate">
            Guardian&apos;s Embrace
          </span>
        </div>

        {loading ? (
          <div className="w-16 h-6 shrink-0" />
        ) : userId ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-xs text-[var(--color-gold)] max-w-[100px] truncate">
              {email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <a
            href="/sign-in"
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-[var(--color-gold)] text-white font-semibold"
          >
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}