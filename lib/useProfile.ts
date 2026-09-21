"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Role = "anonymous" | "member" | "volunteer" | "staff" | "admin";

export function useProfile() {
  const [role, setRole] = useState<Role>("anonymous");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
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
      setRole("anonymous");
      setLoading(false);
      return;
    }
    setUserId(data.user.id);
    setEmail(data.user.email ?? null);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    setRole((profile?.role as Role) ?? "member");
    setLoading(false);
  }

  return { role, userId, email, loading };
}