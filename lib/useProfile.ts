"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Role = "anonymous" | "member" | "volunteer" | "staff" | "admin";

export const ROLE_LABELS: Record<Role, string> = {
  anonymous: "Guest",
  member: "Member",
  volunteer: "Volunteer",
  staff: "Staff",
  admin: "Admin",
};

export function useProfile() {
  const [role, setRole] = useState<Role>("anonymous");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);

  async function load() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      setUserId(null);
      setEmail(null);
      setFullName(null);
      setCreatedAt(null);
      setRole("anonymous");
      setLoading(false);
      return;
    }
    setUserId(data.user.id);
    setEmail(data.user.email ?? null);
    // Sign-up stores the name in user metadata; the profiles table may also
    // carry one, and that wins if it is set.
    setFullName((data.user.user_metadata?.full_name as string) ?? null);
    setCreatedAt(data.user.created_at ?? null);

    // select("*") rather than naming columns: the profiles table may not have
    // a full_name column yet, and naming a missing column fails the whole
    // query — which would quietly downgrade staff and admins to "member".
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    setRole((profile?.role as Role) ?? "member");
    if (profile?.full_name) setFullName(profile.full_name as string);
    setLoading(false);
  }

  return { role, userId, email, fullName, createdAt, loading, reload: load };
}

/** Initials for the avatar: from the name if there is one, otherwise the email. */
export function initialsFor(fullName: string | null, email: string | null): string {
  const source = fullName?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
