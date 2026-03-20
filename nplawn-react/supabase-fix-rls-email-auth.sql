-- ============================================================
-- Fix RLS policies to work with custom-auth users.
--
-- Problem: All policies used auth.uid() which requires Supabase
-- Auth UUIDs. The app uses a custom public.users table with its
-- own UUIDs, so auth.uid() was always NULL → RLS denied every
-- insert/select.
--
-- Fix: Replace auth.uid() = <col> with a sub-select that looks
-- up the user's ID from public.users by auth.email(). Supabase
-- Auth is now established at sign-in (see auth.js), so
-- auth.email() returns the logged-in user's email.
-- ============================================================

-- ── homeowner_properties ────────────────────────────────────
drop policy if exists "Owner manages own properties" on public.homeowner_properties;
create policy "Owner manages own properties" on public.homeowner_properties
  for all
  using     (homeowner_id = (select id from public.users where email = auth.email()))
  with check(homeowner_id = (select id from public.users where email = auth.email()));

-- ── quote_requests ──────────────────────────────────────────
drop policy if exists "Homeowner manages own requests" on public.quote_requests;
create policy "Homeowner manages own requests" on public.quote_requests
  for all
  using     (homeowner_id = (select id from public.users where email = auth.email()))
  with check(homeowner_id = (select id from public.users where email = auth.email()));

-- keep the open-marketplace read policy as-is (no auth needed)
-- "Providers can view open requests" already uses: status = 'open'

-- ── quotes ──────────────────────────────────────────────────
drop policy if exists "Homeowner can view quotes on own requests" on public.quotes;
create policy "Homeowner can view quotes on own requests" on public.quotes
  for select using (
    exists (
      select 1 from public.quote_requests r
      where r.id = request_id
        and r.homeowner_id = (select id from public.users where email = auth.email())
    )
  );

drop policy if exists "Provider manages own quotes" on public.quotes;
create policy "Provider manages own quotes" on public.quotes
  for all
  using     (provider_id = (select id from public.users where email = auth.email()))
  with check(provider_id = (select id from public.users where email = auth.email()));

-- ── jobs ────────────────────────────────────────────────────
drop policy if exists "Homeowner manages own jobs" on public.jobs;
create policy "Homeowner manages own jobs" on public.jobs
  for all
  using     (homeowner_id = (select id from public.users where email = auth.email()))
  with check(homeowner_id = (select id from public.users where email = auth.email()));

drop policy if exists "Provider views assigned jobs" on public.jobs;
create policy "Provider views assigned jobs" on public.jobs
  for select using (provider_id = (select id from public.users where email = auth.email()));

-- ── recurring_schedules ─────────────────────────────────────
drop policy if exists "Homeowner manages own schedules" on public.recurring_schedules;
create policy "Homeowner manages own schedules" on public.recurring_schedules
  for all
  using     (homeowner_id = (select id from public.users where email = auth.email()))
  with check(homeowner_id = (select id from public.users where email = auth.email()));

-- ── reviews ─────────────────────────────────────────────────
drop policy if exists "Homeowner manages own reviews" on public.reviews;
create policy "Homeowner manages own reviews" on public.reviews
  for all
  using     (homeowner_id = (select id from public.users where email = auth.email()))
  with check(homeowner_id = (select id from public.users where email = auth.email()));

-- "Reviews are publicly readable" policy is unchanged (uses true)

-- ── messages ────────────────────────────────────────────────
drop policy if exists "Users see own messages" on public.messages;
create policy "Users see own messages" on public.messages
  for all using (
    from_user_id = (select id from public.users where email = auth.email())
    or to_user_id = (select id from public.users where email = auth.email())
  );

-- ── notifications ───────────────────────────────────────────
drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Users manage own notifications" on public.notifications
  for all
  using     (user_id = (select id from public.users where email = auth.email()))
  with check(user_id = (select id from public.users where email = auth.email()));
