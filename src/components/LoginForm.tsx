"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Mode = "signin" | "signup";

export function LoginForm({ next = "/search" }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const configured = isSupabaseConfigured;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!configured) {
      setError("Sign-in isn’t configured yet. Add your Supabase keys to .env.local.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          // Email confirmation is off: the user is signed in immediately.
          router.replace(next);
          router.refresh();
        } else {
          setNotice("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-12 flex w-full flex-col gap-3" noValidate>
      {!configured && (
        <p className="text-[13px] leading-[1.5] text-ash" role="status">
          Set <span className="text-bone">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
          <span className="text-bone">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> in <span className="text-bone">.env.local</span>, then
          restart the server.
        </p>
      )}

      <label htmlFor="email" className="label">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-[52px] w-full rounded-[4px] border border-ash bg-transparent px-4 text-[16px] text-fg placeholder:text-ash focus:border-fg focus:outline-none"
        placeholder="you@college.edu"
      />

      <label htmlFor="password" className="label mt-2">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-[52px] w-full rounded-[4px] border border-ash bg-transparent px-4 text-[16px] text-fg placeholder:text-ash focus:border-fg focus:outline-none"
        placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
      />

      {error && (
        <p className="text-[13px] leading-[1.5] text-ash" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-[13px] leading-[1.5] text-brass" role="status">
          {notice}
        </p>
      )}

      <button type="submit" className="btn mt-4 disabled:opacity-50" disabled={busy}>
        {busy ? "One moment" : "Continue"}
      </button>

      <p className="mt-4 text-center text-[13px] text-ash">
        {mode === "signin" ? "New here? " : "Already have an account? "}
        <button
          type="button"
          className="text-brass underline-offset-4 hover:underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
