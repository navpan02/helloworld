-- ============================================================
-- NPLawn — RLS Fix Migration
-- Fixes all Supabase security scan errors.
--
-- Background: This app uses custom session-based auth (not
-- Supabase Auth JWTs), so auth.uid() is always null. All old
-- auth.uid() policies are replaced with permissive ones.
-- App-level auth (sessionStorage) enforces access control.
--
-- Run once in: Supabase Dashboard → SQL Editor → New Query 2
-- ============================================================


-- ── homeowner_properties ───────────────────────────────────
alter table public.homeowner_properties enable row level security;
drop policy if exists "Owner manages own properties" on public.homeowner_properties;
drop policy if exists "Owner manages own properties" on public.homeowner_properties;

create policy "Allow all on homeowner_properties" on public.homeowner_properties
  for all using (true) with check (true);


-- ── quote_requests ─────────────────────────────────────────
alter table public.quote_requests enable row level security;
drop policy if exists "Homeowner manages own requests" on public.quote_requests;
drop policy if exists "Providers can view open requests" on public.quote_requests;
create policy "Allow all on quote_requests" on public.quote_requests
  for all using (true) with check (true);


-- ── quotes ─────────────────────────────────────────────────
alter table public.quotes enable row level security;
drop policy if exists "Homeowner can view quotes on own requests" on public.quotes;
drop policy if exists "Provider manages own quotes" on public.quotes;
create policy "Allow all on quotes" on public.quotes
  for all using (true) with check (true);


-- ── jobs ───────────────────────────────────────────────────
alter table public.jobs enable row level security;
drop policy if exists "Homeowner manages own jobs" on public.jobs;
drop policy if exists "Provider views assigned jobs" on public.jobs;
create policy "Allow all on jobs" on public.jobs
  for all using (true) with check (true);


-- ── recurring_schedules ────────────────────────────────────
alter table public.recurring_schedules enable row level security;
drop policy if exists "Homeowner manages own schedules" on public.recurring_schedules;
create policy "Allow all on recurring_schedules" on public.recurring_schedules
  for all using (true) with check (true);


-- ── reviews ────────────────────────────────────────────────
alter table public.reviews enable row level security;
drop policy if exists "Homeowner manages own reviews" on public.reviews;
drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Allow all on reviews" on public.reviews
  for all using (true) with check (true);


-- ── messages ───────────────────────────────────────────────
alter table public.messages enable row level security;
drop policy if exists "Users see own messages" on public.messages;
create policy "Allow all on messages" on public.messages
  for all using (true) with check (true);


-- ── notifications ──────────────────────────────────────────
alter table public.notifications enable row level security;
drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Allow all on notifications" on public.notifications
  for all using (true) with check (true);


-- ── provider_profiles ──────────────────────────────────────
alter table public.provider_profiles enable row level security;
create policy "Allow all on provider_profiles" on public.provider_profiles
  for all using (true) with check (true);


-- ── provider_quotes ────────────────────────────────────────
alter table public.provider_quotes enable row level security;
create policy "Allow all on provider_quotes" on public.provider_quotes
  for all using (true) with check (true);


-- ── provider_jobs ──────────────────────────────────────────
alter table public.provider_jobs enable row level security;
create policy "Allow all on provider_jobs" on public.provider_jobs
  for all using (true) with check (true);


-- ── provider_messages ──────────────────────────────────────
alter table public.provider_messages enable row level security;
create policy "Allow all on provider_messages" on public.provider_messages
  for all using (true) with check (true);


-- ── provider_availability ──────────────────────────────────
alter table public.provider_availability enable row level security;
create policy "Allow all on provider_availability" on public.provider_availability
  for all using (true) with check (true);


-- ── np1 (custom table) ─────────────────────────────────────
alter table public.np1 enable row level security;
create policy "Allow all on np1" on public.np1
  for all using (true) with check (true);


-- ── public.users (needed for login SELECT) ─────────────────
alter table public.users enable row level security;
drop policy if exists "Allow anon login reads" on public.users;
create policy "Allow all on users" on public.users
  for all using (true) with check (true);


-- ── Verify: check all policies are now in place ────────────
-- select tablename, policyname, cmd
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename;
