import { supabase } from "./supabase";

/**
 * Where Supabase sends people back to after they click a link in an email
 * (confirm your address, reset your password).
 *
 * Every URL this returns must also be listed under
 * Supabase dashboard -> Authentication -> URL Configuration -> Redirect URLs,
 * or the link in the email will be rejected.
 *
 * Note for the Capacitor build: inside the native shell the origin is
 * capacitor://localhost rather than an https:// address, so the native app
 * needs its own deep-link scheme adding to that allow-list before email
 * links will work on a phone. On the web dev server this just works.
 */
export function authRedirectUrl(path: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${path}`;
}

export interface SignUpOptions {
  fullName?: string;
  acceptedTermsVersion?: string;
}

export async function signUp(
  email: string,
  password: string,
  options: SignUpOptions = {}
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectUrl("/today"),
      data: {
        full_name: options.fullName ?? null,
        accepted_terms_version: options.acceptedTermsVersion ?? null,
        accepted_terms_at: options.acceptedTermsVersion
          ? new Date().toISOString()
          : null,
      },
    },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

/** Sends the "reset your password" email. */
export async function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authRedirectUrl("/reset-password"),
  });
}

/** Sets a new password once the user has arrived from the reset email. */
export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

/**
 * Supabase returns technically-worded errors. This maps the ones people
 * actually hit onto plain English, and leaves anything unexpected alone.
 */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "That email and password do not match an account.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email address first — check your inbox for the link.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "An account already exists for that email. Try signing in instead.";
  }
  if (m.includes("password should be at least")) {
    return "That password is too short.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "Could not reach the server. Check your connection and try again.";
  }
  return message;
}
