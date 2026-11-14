import { Capacitor } from "@capacitor/core";

/**
 * Real outside links the app uses. Each one was checked on
 * guardiansembrace.org (or the ministry's RightNow library) on 2026-10-21.
 * Add a link here only after it has been checked the same way.
 */
export const LINKS = {
  /** The ministry's only donation form (child sponsorships and one-off gifts). */
  zeffyDonate:
    "https://www.zeffy.com/en-US/donation-form/guardians-embrace-child-sponsorships",
  /** Tickets for the charity golf tournament at Torrey Pines. */
  golfTickets:
    "https://www.zeffy.com/ticketing/guardians-embrace-charity-golf-tournament-at-torrey-pines",
  /** Guardian's Embrace library on RightNow Media (needs a RightNow login). */
  rightNowLibrary: "https://app.rightnowmedia.org/en/library/custom/66345",
  /** Free RightNow Media account, sponsored through the ministry. */
  rightNowJoin: "https://app.rightnowmedia.org/join/guardiansembrace",
  /** The web app volunteers use today for hours and weekly updates. */
  volunteerPortal: "https://dgmspt8ntq6jd.cloudfront.net/dashboard",
} as const;

/** True inside the Capacitor iOS/Android shell, false in a normal browser. */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Opens a URL outside the app.
 *
 * - Native shell: hands the URL to the system browser (`_system`), so
 *   checkout and logins happen in Safari, never inside our web view.
 * - Web: a new tab with no access back to this page (`opener` cleared).
 *
 * Returns false when the browser blocked the new tab, so the caller can
 * show the link for the person to tap themselves.
 */
export function openExternal(url: string): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeApp()) {
    window.open(url, "_system");
    return true;
  }
  const win = window.open(url, "_blank");
  if (!win) return false;
  try {
    win.opener = null;
  } catch {
    // Cross-origin windows may refuse the write; the link is already open.
  }
  return true;
}
