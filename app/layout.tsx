"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Playfair_Display, Inter } from "next/font/google";
import { Book, Heart, Home, ShieldCheck, Users } from "lucide-react";
import { useProfile } from "@/lib/useProfile";
import Header from "@/components/Header";
import "./globals.css";

const heading = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useProfile();

  const tabs = [
    { href: "/today", label: "Today", Icon: Home },
    { href: "/bible", label: "Bible", Icon: Book },
    { href: "/mission", label: "Mission", Icon: ShieldCheck },
    { href: "/give", label: "Give", Icon: Heart },
    ...(role === "volunteer" || role === "staff" || role === "admin"
      ? [{ href: "/serve", label: "Serve", Icon: Users }]
      : []),
    ...(role === "staff" || role === "admin"
      ? [{ href: "/manage", label: "Manage", Icon: ShieldCheck }]
      : []),
  ];

  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased bg-[#E9E4D8] md:py-6">
        {/* App shell: full-bleed on phones, framed like a device on wider screens */}
        <div className="flex flex-col h-screen md:h-[calc(100vh-3rem)] max-w-md mx-auto bg-[var(--color-bg)] md:rounded-[2rem] md:shadow-2xl overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
          <nav className="flex border-t border-[var(--color-border)] bg-[var(--color-card)] safe-bottom shrink-0">
            {tabs.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors"
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.4 : 1.8}
                    color={active ? "var(--color-gold)" : "var(--color-ink-muted)"}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: active ? "var(--color-gold)" : "var(--color-ink-muted)" }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </body>
    </html>
  );
}