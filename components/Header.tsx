"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, UserRound } from "lucide-react";
import { useProfile, initialsFor } from "@/lib/useProfile";

export default function Header() {
  const { userId, email, fullName, loading } = useProfile();
  const pathname = usePathname();
  const onProfile = pathname?.startsWith("/profile");

  return (
    <header className="safe-top shrink-0 bg-[var(--color-bg-dark)] text-white">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/today" className="flex min-w-0 items-center gap-2">
          <Shield
            size={18}
            className="shrink-0"
            color="var(--color-gold)"
            fill="var(--color-gold)"
            fillOpacity={0.15}
          />
          <span className="truncate font-[family-name:var(--font-heading)] text-sm leading-none tracking-wide">
            Guardian&apos;s Embrace
          </span>
        </Link>

        {loading ? (
          <div className="h-9 w-9 shrink-0 rounded-full bg-white/10" />
        ) : (
          <Link
            href="/profile"
            aria-label={userId ? "Your profile" : "Sign in"}
            aria-current={onProfile ? "page" : undefined}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              userId
                ? "bg-[var(--color-gold)] text-white"
                : "border border-white/25 text-white hover:bg-white/10"
            } ${onProfile ? "ring-2 ring-white/60" : ""}`}
          >
            {userId ? initialsFor(fullName, email) : <UserRound size={18} />}
          </Link>
        )}
      </div>
    </header>
  );
}
