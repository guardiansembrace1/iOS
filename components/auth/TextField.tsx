"use client";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TextFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  inputMode?: "text" | "email";
}

export default function TextField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  hint,
  required,
  disabled,
  inputMode,
}: TextFieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && reveal ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-desc` : undefined}
          className={`w-full rounded-xl bg-[var(--color-card)] p-3.5 text-sm text-[var(--color-ink)] border transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 ${
            isPassword ? "pr-12" : ""
          } ${
            error
              ? "border-red-400 focus:ring-red-200"
              : "border-[var(--color-border)] focus:ring-[var(--color-gold)]/30"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-ink-muted)]"
          >
            {reveal ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {(error || hint) && (
        <p
          id={`${id}-desc`}
          className={`text-xs mt-1.5 ${error ? "text-red-600" : "text-[var(--color-ink-muted)]"}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
