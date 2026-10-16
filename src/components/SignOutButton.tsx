"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Nothing to sign out of until auth is configured.
  if (!isSupabaseConfigured) return null;

  const signOut = async () => {
    setBusy(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // ignore — return to the login page regardless
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <button type="button" onClick={signOut} disabled={busy} className={`text-ash disabled:opacity-50 ${className}`}>
      {busy ? "Signing out" : "Sign out"}
    </button>
  );
}
