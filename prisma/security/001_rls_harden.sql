-- ANANT · RLS hardening for the Supabase Postgres database
-- --------------------------------------------------------
-- Context: every table is created by Prisma in the `public` schema. The app
-- reaches the database ONLY through Prisma, which connects as the `postgres`
-- role (BYPASSRLS), so nothing below affects the app. The Supabase client is
-- used for auth only — it never queries these tables via PostgREST.
--
-- This migration (idempotent):
--   1. Ensures Row Level Security is enabled on all 12 Prisma tables.
--   2. Adds NO policies — with RLS on and no policy, the public API roles
--      (anon, authenticated) are denied all row access through PostgREST.
--   3. Revokes every direct table privilege from anon/authenticated, so the
--      data is protected even if RLS is ever toggled off or a policy is added.
--   4. Stops future Prisma-created tables from being granted to those roles.

DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
      AND c.relname IN (
        'Industry','Company','Explainer','ExplainerPart','Figure','Source',
        'QuizQuestion','ProSubscription','Completion','Track','TrackItem','Certificate',
        'ProgressNote','ProgressQuiz','ProgressStreak','ProgressIndustry'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated;', t);
  END LOOP;
END $$;

-- Future tables created by the Prisma (postgres) role: no grants to API roles.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
