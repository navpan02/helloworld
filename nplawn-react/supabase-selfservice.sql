-- ============================================================
-- NPLawn — Self-Service Portal Extension
-- Run in your Supabase SQL editor after supabase-homeowner.sql
-- ============================================================
-- Tables: invoices, documents, service_feedback, provider_notes,
--         notification_preferences, referrals,
--         saved_payment_methods, service_plans
-- + Mock data for navpan+np1@gmail.com and navpan+np2@gmail.com
-- ============================================================


-- ── 1. Invoices ────────────────────────────────────────────
create table if not exists public.invoices (
  id             uuid default gen_random_uuid() primary key,
  homeowner_id   uuid not null,
  job_id         uuid,
  invoice_number text not null,
  service_type   text not null,
  provider_name  text,
  service_date   date,
  due_date       date,
  amount         decimal(10,2) not null,
  tax            decimal(10,2) default 0,
  status         text default 'unpaid' check (status in ('paid','unpaid','overdue')),
  pdf_url        text,
  notes          text,
  created_at     timestamptz default now()
);
alter table public.invoices enable row level security;
create policy "Homeowner views own invoices" on public.invoices
  for all using (homeowner_id::text = (
    select id::text from public.users where id = homeowner_id limit 1
  ));
-- Permissive policy so demo works without Supabase Auth session
create policy "Allow all on invoices (demo)" on public.invoices
  for all using (true) with check (true);


-- ── 2. Documents ───────────────────────────────────────────
create table if not exists public.documents (
  id           uuid default gen_random_uuid() primary key,
  homeowner_id uuid not null,
  title        text not null,
  type         text not null check (type in ('invoice','service_receipt','agreement','report','other')),
  pdf_url      text,
  job_id       uuid,
  created_at   timestamptz default now()
);
alter table public.documents enable row level security;
create policy "Allow all on documents (demo)" on public.documents
  for all using (true) with check (true);


-- ── 3. Service Feedback ────────────────────────────────────
create table if not exists public.service_feedback (
  id            uuid default gen_random_uuid() primary key,
  homeowner_id  uuid not null,
  job_id        uuid,
  provider_name text,
  service_type  text,
  service_date  date,
  rating        int check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz default now()
);
alter table public.service_feedback enable row level security;
create policy "Allow all on service_feedback (demo)" on public.service_feedback
  for all using (true) with check (true);


-- ── 4. Provider Notes ──────────────────────────────────────
create table if not exists public.provider_notes (
  id                uuid default gen_random_uuid() primary key,
  homeowner_id      uuid not null,
  property_nickname text,
  category          text default 'general' check (category in ('access','pets','instructions','general')),
  content           text not null,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.provider_notes enable row level security;
create policy "Allow all on provider_notes (demo)" on public.provider_notes
  for all using (true) with check (true);


-- ── 5. Notification Preferences ───────────────────────────
create table if not exists public.notification_preferences (
  homeowner_id              uuid primary key,
  email_upcoming_reminder   boolean default true,
  email_service_complete    boolean default true,
  email_invoice_due         boolean default true,
  email_new_quote           boolean default true,
  email_weather_delay       boolean default true,
  sms_upcoming_reminder     boolean default true,
  sms_service_complete      boolean default false,
  sms_invoice_due           boolean default false,
  sms_weather_delay         boolean default true,
  updated_at                timestamptz default now()
);
alter table public.notification_preferences enable row level security;
create policy "Allow all on notification_preferences (demo)" on public.notification_preferences
  for all using (true) with check (true);


-- ── 6. Referrals ───────────────────────────────────────────
create table if not exists public.referrals (
  id             uuid default gen_random_uuid() primary key,
  referrer_id    uuid not null,
  referral_email text not null,
  referral_code  text not null,
  status         text default 'pending' check (status in ('pending','signed_up','credited')),
  credit_amount  decimal(10,2) default 20.00,
  created_at     timestamptz default now()
);
alter table public.referrals enable row level security;
create policy "Allow all on referrals (demo)" on public.referrals
  for all using (true) with check (true);


-- ── 7. Saved Payment Methods ───────────────────────────────
create table if not exists public.saved_payment_methods (
  id              uuid default gen_random_uuid() primary key,
  homeowner_id    uuid not null,
  card_last4      text not null,
  card_brand      text not null check (card_brand in ('Visa','Mastercard','Amex','Discover')),
  card_exp_month  int,
  card_exp_year   int,
  is_default      boolean default false,
  autopay_enabled boolean default false,
  created_at      timestamptz default now()
);
alter table public.saved_payment_methods enable row level security;
create policy "Allow all on saved_payment_methods (demo)" on public.saved_payment_methods
  for all using (true) with check (true);


-- ── 8. Service Plans ───────────────────────────────────────
create table if not exists public.service_plans (
  id                 uuid default gen_random_uuid() primary key,
  homeowner_id       uuid not null,
  plan_name          text not null check (plan_name in ('Basic','Standard','Premium')),
  price_per_month    decimal(10,2),
  frequency          text,
  services_included  text[] default '{}',
  status             text default 'active' check (status in ('active','paused','cancelled')),
  next_billing_date  date,
  created_at         timestamptz default now()
);
alter table public.service_plans enable row level security;
create policy "Allow all on service_plans (demo)" on public.service_plans
  for all using (true) with check (true);


-- ============================================================
-- MOCK DATA
-- Looks up navpan+np1@gmail.com and navpan+np2@gmail.com by
-- email so the correct UUIDs are used even if those users
-- already existed in the database before this script ran.
-- Password for both: password123
-- SHA-256('password123') = ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
-- ============================================================

do $$
declare
  np1 uuid;
  np2 uuid;
begin

  -- ── Resolve real user IDs ───────────────────────────────
  -- Update name/password if users exist; insert if they don't.
  insert into public.users (id, email, name, role, password_hash)
  values
    (gen_random_uuid(), 'navpan+np1@gmail.com', 'Alex Martinez', 'user',
     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'),
    (gen_random_uuid(), 'navpan+np2@gmail.com', 'Jordan Lee', 'user',
     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f')
  on conflict (email) do update
    set name          = excluded.name,
        password_hash = excluded.password_hash;

  select id into np1 from public.users where email = 'navpan+np1@gmail.com';
  select id into np2 from public.users where email = 'navpan+np2@gmail.com';

  -- ── Recurring Schedules ──────────────────────────────────
  -- UUID scheme: {table}-{user}-0000-0000-{seq}
  -- table: 00000001=recurring_schedules, 00000002=jobs, 00000003=invoices,
  --        00000004=documents, 00000005=feedback, 00000006=provider_notes,
  --        00000007=payment_methods, 00000008=service_plans, 00000009=referrals
  insert into public.recurring_schedules
    (id, homeowner_id, service_type, frequency, day_of_week, time_window, status, next_date)
  values
    ('00000001-0001-0000-0000-000000000001', np1,
     'Lawn Mowing', 'weekly', 3, 'morning', 'active', '2025-03-19'),
    ('00000001-0001-0000-0000-000000000002', np1,
     'Hedge Trimming', 'monthly', 5, 'afternoon', 'active', '2025-04-04'),
    ('00000001-0002-0000-0000-000000000001', np2,
     'Lawn Mowing', 'biweekly', 2, 'morning', 'active', '2025-03-18'),
    ('00000001-0002-0000-0000-000000000002', np2,
     'Leaf Removal', 'seasonal', null, 'afternoon', 'paused', null)
  on conflict (id) do nothing;

  -- ── Jobs ────────────────────────────────────────────────
  insert into public.jobs
    (id, homeowner_id, service_type, scheduled_date, scheduled_time, status, notes, completed_at)
  values
    ('00000002-0001-0000-0000-000000000001', np1,
     'Lawn Mowing', '2025-01-15', '9:00 AM', 'completed',
     'Provider: GreenThumb Lawn Care', '2025-01-15 11:30:00+00'),
    ('00000002-0001-0000-0000-000000000002', np1,
     'Lawn Aeration & Overseeding', '2025-02-10', '8:00 AM', 'completed',
     'Provider: GreenThumb Lawn Care', '2025-02-10 12:00:00+00'),
    ('00000002-0001-0000-0000-000000000003', np1,
     'Hedge Trimming', '2025-03-19', '1:00 PM', 'upcoming',
     'Provider: GreenThumb Lawn Care', null),
    ('00000002-0001-0000-0000-000000000004', np1,
     'Lawn Mowing', '2025-03-26', '9:00 AM', 'upcoming',
     'Provider: GreenThumb Lawn Care', null),
    ('00000002-0002-0000-0000-000000000001', np2,
     'Leaf Removal', '2025-01-20', '10:00 AM', 'completed',
     'Provider: ProCut Lawn Services', '2025-01-20 13:30:00+00'),
    ('00000002-0002-0000-0000-000000000002', np2,
     'Lawn Mowing', '2025-03-04', '9:30 AM', 'completed',
     'Provider: ProCut Lawn Services', '2025-03-04 11:00:00+00'),
    ('00000002-0002-0000-0000-000000000003', np2,
     'Lawn Mowing', '2025-03-18', '9:30 AM', 'upcoming',
     'Provider: ProCut Lawn Services', null)
  on conflict (id) do nothing;

  -- ── Invoices ─────────────────────────────────────────────
  insert into public.invoices
    (id, homeowner_id, invoice_number, service_type, provider_name,
     service_date, due_date, amount, tax, status, pdf_url)
  values
    ('00000003-0001-0000-0000-000000000001', np1,
     'INV-2025-001', 'Lawn Mowing', 'GreenThumb Lawn Care',
     '2025-01-15', '2025-01-22', 65.00, 5.85, 'paid',
     '/NP02/docs/invoice-2025-001.pdf'),
    ('00000003-0001-0000-0000-000000000002', np1,
     'INV-2025-002', 'Lawn Aeration & Overseeding', 'GreenThumb Lawn Care',
     '2025-02-10', '2025-02-17', 120.00, 10.80, 'paid',
     '/NP02/docs/invoice-2025-002.pdf'),
    ('00000003-0001-0000-0000-000000000003', np1,
     'INV-2025-003', 'Hedge Trimming', 'GreenThumb Lawn Care',
     '2025-03-05', '2025-03-20', 85.00, 7.65, 'unpaid',
     '/NP02/docs/invoice-2025-003.pdf'),
    ('00000003-0002-0000-0000-000000000001', np2,
     'INV-2025-004', 'Leaf Removal', 'ProCut Lawn Services',
     '2025-01-20', '2025-01-27', 95.00, 8.55, 'paid',
     '/NP02/docs/invoice-2025-004.pdf'),
    ('00000003-0002-0000-0000-000000000002', np2,
     'INV-2025-005', 'Lawn Mowing (March)', 'ProCut Lawn Services',
     '2025-03-04', '2025-03-11', 60.00, 5.40, 'overdue',
     null)
  on conflict (id) do nothing;

  -- ── Documents ────────────────────────────────────────────
  insert into public.documents
    (id, homeowner_id, title, type, pdf_url)
  values
    ('00000004-0001-0000-0000-000000000001', np1,
     '2025 Service Agreement — GreenThumb', 'agreement',
     '/NP02/docs/service-agreement.pdf'),
    ('00000004-0001-0000-0000-000000000002', np1,
     'Service Completion Receipt — Mar 5', 'service_receipt',
     '/NP02/docs/completion-receipt.pdf'),
    ('00000004-0001-0000-0000-000000000003', np1,
     'Invoice #INV-2025-001', 'invoice',
     '/NP02/docs/invoice-2025-001.pdf'),
    ('00000004-0002-0000-0000-000000000001', np2,
     'Invoice #INV-2025-004', 'invoice',
     '/NP02/docs/invoice-2025-004.pdf'),
    ('00000004-0002-0000-0000-000000000002', np2,
     'Service Completion Receipt — Jan 20', 'service_receipt',
     '/NP02/docs/completion-receipt.pdf')
  on conflict (id) do nothing;

  -- ── Service Feedback ─────────────────────────────────────
  insert into public.service_feedback
    (id, homeowner_id, provider_name, service_type, service_date, rating, comment)
  values
    ('00000005-0001-0000-0000-000000000001', np1,
     'GreenThumb Lawn Care', 'Lawn Mowing', '2025-01-15', 5,
     'Excellent work! Arrived on time and left the yard spotless.'),
    ('00000005-0001-0000-0000-000000000002', np1,
     'GreenThumb Lawn Care', 'Lawn Aeration & Overseeding', '2025-02-10', 4,
     'Great job with the aeration. Could use a bit more seed coverage on the back corner.'),
    ('00000005-0002-0000-0000-000000000001', np2,
     'ProCut Lawn Services', 'Leaf Removal', '2025-01-20', 5,
     'They cleared everything in under 3 hours. Would highly recommend!'),
    ('00000005-0002-0000-0000-000000000002', np2,
     'ProCut Lawn Services', 'Lawn Mowing', '2025-03-04', 4,
     'Good clean cut. Edges could be a bit sharper but overall happy.')
  on conflict (id) do nothing;

  -- ── Provider Notes ───────────────────────────────────────
  insert into public.provider_notes
    (id, homeowner_id, property_nickname, category, content)
  values
    ('00000006-0001-0000-0000-000000000001', np1,
     'Main House', 'access',
     'Side gate code: 4829. Gate is on the left side of the house. Please latch after entering.'),
    ('00000006-0001-0000-0000-000000000002', np1,
     'Main House', 'pets',
     'We have a large yellow lab named Max. He is friendly but may bark. Please keep gate closed at all times.'),
    ('00000006-0001-0000-0000-000000000003', np1,
     'Main House', 'instructions',
     'Please avoid mowing the flower bed area near the front porch. The raised garden bed is off-limits.'),
    ('00000006-0002-0000-0000-000000000001', np2,
     'Home', 'access',
     'Parking on the street is fine. No gate — open yard access. Ring doorbell if you need anything.'),
    ('00000006-0002-0000-0000-000000000002', np2,
     'Home', 'instructions',
     'Leave clippings in the green bin on the left of the garage. Do not blow leaves into the neighbors yard.')
  on conflict (id) do nothing;

  -- ── Notification Preferences ─────────────────────────────
  insert into public.notification_preferences
    (homeowner_id,
     email_upcoming_reminder, email_service_complete, email_invoice_due,
     email_new_quote, email_weather_delay,
     sms_upcoming_reminder, sms_service_complete, sms_invoice_due, sms_weather_delay)
  values
    (np1, true, true, true, true, true,
     true, true, false, true),
    (np2, true, true, false, true, false,
     false, false, false, true)
  on conflict (homeowner_id) do update
    set email_upcoming_reminder = excluded.email_upcoming_reminder,
        sms_upcoming_reminder   = excluded.sms_upcoming_reminder;

  -- ── Saved Payment Methods ────────────────────────────────
  insert into public.saved_payment_methods
    (id, homeowner_id, card_last4, card_brand, card_exp_month, card_exp_year,
     is_default, autopay_enabled)
  values
    ('00000007-0001-0000-0000-000000000001', np1,
     '4242', 'Visa', 9, 2027, true, true),
    ('00000007-0001-0000-0000-000000000002', np1,
     '5353', 'Mastercard', 3, 2026, false, false),
    ('00000007-0002-0000-0000-000000000001', np2,
     '1111', 'Visa', 12, 2028, true, false)
  on conflict (id) do nothing;

  -- ── Service Plans ────────────────────────────────────────
  insert into public.service_plans
    (id, homeowner_id, plan_name, price_per_month, frequency,
     services_included, status, next_billing_date)
  values
    ('00000008-0001-0000-0000-000000000001', np1,
     'Standard', 199.00, 'weekly',
     ARRAY['Weekly Mowing & Edging','Monthly Hedge Trimming','Seasonal Aeration (2x)'],
     'active', '2025-04-01'),
    ('00000008-0002-0000-0000-000000000001', np2,
     'Basic', 99.00, 'biweekly',
     ARRAY['Bi-Weekly Mowing','Seasonal Leaf Removal (1x)'],
     'active', '2025-04-01')
  on conflict (id) do nothing;

  -- ── Referrals ────────────────────────────────────────────
  insert into public.referrals
    (id, referrer_id, referral_email, referral_code, status, credit_amount)
  values
    ('00000009-0001-0000-0000-000000000001', np1,
     'friend1@example.com', 'ALEX-NP1X', 'credited', 20.00),
    ('00000009-0001-0000-0000-000000000002', np1,
     'friend2@example.com', 'ALEX-NP1X', 'signed_up', 20.00),
    ('00000009-0001-0000-0000-000000000003', np1,
     'friend3@example.com', 'ALEX-NP1X', 'pending', 20.00),
    ('00000009-0002-0000-0000-000000000001', np2,
     'neighbor@example.com', 'JORD-NP2Y', 'credited', 20.00)
  on conflict (id) do nothing;

end $$;
