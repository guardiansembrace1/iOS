"use client";

/** 0 = empty, 1 = weak, 2 = fair, 3 = good, 4 = strong */
export function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const COLORS = [
  "transparent",
  "#dc2626",
  "#d97706",
  "var(--color-gold)",
  "var(--color-success)",
];

export default function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor: i <= score ? COLORS[score] : "var(--color-card-muted)",
            }}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--color-ink-muted)]">
        Password strength: {LABELS[score]}
      </p>
    </div>
  );
}
