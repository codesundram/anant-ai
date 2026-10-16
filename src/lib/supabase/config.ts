// Supabase connection details come from the browser-safe env vars. They are
// read in one place so the app can tell, everywhere, whether auth is set up yet.
// Before the keys are pasted into .env.local, `isConfigured` is false and the
// login page shows a setup notice instead of crashing.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
