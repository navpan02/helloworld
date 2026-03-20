-- ============================================================
-- Final RLS fix — works with the custom-auth + Supabase Auth
-- hybrid setup.
--
-- BEFORE running this:
--   Supabase Dashboard → Authentication → Settings → Email Auth
--   → DISABLE "Enable email confirmations"
--
-- Then: log out of the app and log back in.
-- The login will create a confirmed Supabase Auth session so
-- auth.email() is populated and these policies work.
-- ============================================================

-- ── homeowner_properties ────────────────────────────────────
DROP POLICY IF EXISTS "Owner manages own properties"          ON public.homeowner_properties;
DROP POLICY IF EXISTS "App-level auth bypass"                 ON public.homeowner_properties;

CREATE POLICY "Owner manages own properties" ON public.homeowner_properties
  FOR ALL
  USING     (homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()))
  WITH CHECK(homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()));

-- ── quote_requests ──────────────────────────────────────────
DROP POLICY IF EXISTS "Homeowner manages own requests"        ON public.quote_requests;
DROP POLICY IF EXISTS "App-level auth bypass"                 ON public.quote_requests;

CREATE POLICY "Homeowner manages own requests" ON public.quote_requests
  FOR ALL
  USING     (homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()))
  WITH CHECK(homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()));

-- keep provider read-access for the marketplace
DROP POLICY IF EXISTS "Providers can view open requests"      ON public.quote_requests;
CREATE POLICY "Providers can view open requests" ON public.quote_requests
  FOR SELECT USING (status = 'open');

-- ── quotes ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Homeowner can view quotes on own requests" ON public.quotes;
DROP POLICY IF EXISTS "Provider manages own quotes"           ON public.quotes;

CREATE POLICY "Homeowner can view quotes on own requests" ON public.quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quote_requests r
      WHERE r.id = request_id
        AND r.homeowner_id = (SELECT id FROM public.users WHERE email = auth.email())
    )
  );

CREATE POLICY "Provider manages own quotes" ON public.quotes
  FOR ALL
  USING     (provider_id = (SELECT id FROM public.users WHERE email = auth.email()))
  WITH CHECK(provider_id = (SELECT id FROM public.users WHERE email = auth.email()));

-- ── jobs ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Homeowner manages own jobs"            ON public.jobs;
DROP POLICY IF EXISTS "Provider views assigned jobs"          ON public.jobs;

CREATE POLICY "Homeowner manages own jobs" ON public.jobs
  FOR ALL
  USING     (homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()))
  WITH CHECK(homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()));

CREATE POLICY "Provider views assigned jobs" ON public.jobs
  FOR SELECT USING (provider_id = (SELECT id FROM public.users WHERE email = auth.email()));

-- ── recurring_schedules ─────────────────────────────────────
DROP POLICY IF EXISTS "Homeowner manages own schedules"       ON public.recurring_schedules;

CREATE POLICY "Homeowner manages own schedules" ON public.recurring_schedules
  FOR ALL
  USING     (homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()))
  WITH CHECK(homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()));

-- ── reviews ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Homeowner manages own reviews"         ON public.reviews;

CREATE POLICY "Homeowner manages own reviews" ON public.reviews
  FOR ALL
  USING     (homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()))
  WITH CHECK(homeowner_id = (SELECT id FROM public.users WHERE email = auth.email()));

-- ── messages ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users see own messages"               ON public.messages;

CREATE POLICY "Users see own messages" ON public.messages
  FOR ALL USING (
    from_user_id = (SELECT id FROM public.users WHERE email = auth.email())
    OR to_user_id = (SELECT id FROM public.users WHERE email = auth.email())
  );

-- ── notifications ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users manage own notifications"       ON public.notifications;

CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL
  USING     (user_id = (SELECT id FROM public.users WHERE email = auth.email()))
  WITH CHECK(user_id = (SELECT id FROM public.users WHERE email = auth.email()));
