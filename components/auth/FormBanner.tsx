"use client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormBannerProps {
  tone: "error" | "success";
  children: React.ReactNode;
}

export default function FormBanner({ tone, children }: FormBannerProps) {
  const error = tone === "error";
  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex gap-2.5 rounded-xl p-3.5 ${
        error ? "bg-red-50" : "bg-[var(--color-success-bg)]"
      }`}
    >
      {error ? (
        <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-600" />
      ) : (
        <CheckCircle2
          size={17}
          color="var(--color-success)"
          className="shrink-0 mt-0.5"
        />
      )}
      <p
        className={`text-xs leading-relaxed ${
          error ? "text-red-700" : "text-[var(--color-success)]"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
