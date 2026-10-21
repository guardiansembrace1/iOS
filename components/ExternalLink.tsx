"use client";
import { isNativeApp, openExternal } from "@/lib/external";

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** Called after the link was handed to the browser. */
  onOpen?: () => void;
  "aria-label"?: string;
}

/**
 * A real link (so long-press, keyboard and screen readers behave normally)
 * that opens outside the app. In the native shell it is routed through
 * `openExternal` so it lands in the system browser.
 */
export default function ExternalLink({
  href,
  className,
  children,
  onOpen,
  ...rest
}: ExternalLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isNativeApp()) {
      e.preventDefault();
      openExternal(href);
    }
    onOpen?.();
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      aria-label={rest["aria-label"]}
    >
      {children}
    </a>
  );
}
