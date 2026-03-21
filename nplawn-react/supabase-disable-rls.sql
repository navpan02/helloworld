-- ============================================================
-- Disable RLS for custom-auth setup.
--
-- This app uses its own auth (public.users + SHA-256) instead
-- of Supabase Auth, so auth.uid() is always null and RLS
-- policies that depend on it block everything.
--
-- Data isolation is handled at the application level:
-- every query already filters by the logged-in user's ID.
--
-- Run this in the Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.homeowner_properties    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_schedules     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications           DISABLE ROW LEVEL SECURITY;
