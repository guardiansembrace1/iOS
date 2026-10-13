"use client";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backHref?: string;
}

/**
 * Shared frame for every auth screen so sign-up, sign-in and the password
 * reset flow stay visually identical. Keeps the gold shield, the Playfair
 * heading and the spacing in one place.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  backHref,
}: AuthShellProps) {
  return (
    <div className="min-h-full flex flex-col px-6 py-8">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-[var(--color-ink-muted)] mb-6 -ml-1"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      ) : (
        <div className="mb-6" />
      )}

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-7">
          <div className="w-11 h-11 rounded-2xl bg-[var(--color-bg-dark)] flex items-center justify-center mb-5">
            <Shield
              size={20}
              color="var(--color-gold)"
              fill="var(--color-gold)"
              fillOpacity={0.2}
            />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-[27px] leading-tight text-[var(--color-ink)] mb-1.5">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{subtitle}</p>
          )}
        </div>

        {children}
      </div>

      {footer && <div className="pt-7">{footer}</div>}
    </div>
  );
}
