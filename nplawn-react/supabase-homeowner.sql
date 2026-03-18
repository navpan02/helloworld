-- ============================================================
-- NPLawn CleanLawn — Homeowner marketplace schema
-- Run in your Supabase SQL editor after supabase-setup.sql
-- ============================================================

-- ── Properties ─────────────────────────────────────────────
create table if not exists public.homeowner_properties (
  id           uuid default gen_random_uuid() primary key,
  homeowner_id uuid references public.users(id) on delete cascade not null,
  nickname     text,
  address      text not null,
  city         text,
  state        text default 'IL',
  zip          text,
  lot_size_sqft int,
  notes        text,
  photo_urls   text[] default '{}',
  is_primary   boolean default false,
  created_at   timestamptz default now()
);

alter table public.homeowner_properties enable row level security;
create policy "Owner manages own properties" on public.homeowner_properties
  for all using (auth.uid() = homeowner_id);

-- ── Quote Requests ─────────────────────────────────────────
create table if not exists public.quote_requests (
  id                   uuid default gen_random_uuid() primary key,
  homeowner_id         uuid references public.users(id) on delete cascade not null,
  property_id          uuid references public.homeowner_properties(id),
  service_types        text[] not null,
  description          text,
  lot_size             text,
  terrain              text,
  obstacles            text,
  media_urls           text[] default '{}',
  preferred_date       date,
  preferred_time_window text,
  schedule_type        text default 'one_time',  -- one_time | recurring
  recurrence_frequency text,                     -- weekly | biweekly | monthly | seasonal
  special_instructions text,
  status               text default 'open',      -- open | quotes_received | accepted | cancelled
  expires_at           timestamptz default (now() + interval '7 days'),
  created_at           timestamptz default now()
);

alter table public.quote_requests enable row level security;
create policy "Homeowner manages own requests" on public.quote_requests
  for all using (auth.uid() = homeowner_id);
create policy "Providers can view open requests" on public.quote_requests
  for select using (status = 'open');

-- ── Provider Quotes (responses to requests) ────────────────
create table if not exists public.quotes (
  id                 uuid default gen_random_uuid() primary key,
  request_id         uuid references public.quote_requests(id) on delete cascade,
  provider_id        uuid references public.users(id) not null,
  provider_email     text,
  provider_name      text,
  amount             decimal(10,2),
  description        text,
  estimated_duration text,
  valid_until        timestamptz default (now() + interval '5 days'),
  status             text default 'pending',  -- pending | accepted | declined | revised
  notes              text,
  created_at         timestamptz default now()
);

alter table public.quotes enable row level security;
create policy "Homeowner can view quotes on own requests" on public.quotes
  for select using (
    exists (select 1 from public.quote_requests r
            where r.id = request_id and r.homeowner_id = auth.uid())
  );
create policy "Provider manages own quotes" on public.quotes
  for all using (auth.uid() = provider_id);

-- ── Jobs ───────────────────────────────────────────────────
create table if not exists public.jobs (
  id             uuid default gen_random_uuid() primary key,
  homeowner_id   uuid references public.users(id) on delete cascade not null,
  provider_id    uuid references public.users(id),
  quote_id       uuid references public.quotes(id),
  property_id    uuid references public.homeowner_properties(id),
  service_type   text not null,
  scheduled_date date,
  scheduled_time text,
  status         text default 'upcoming',  -- upcoming | in_progress | completed | cancelled
  notes          text,
  created_at     timestamptz default now(),
  completed_at   timestamptz
);

alter table public.jobs enable row level security;
create policy "Homeowner manages own jobs" on public.jobs
  for all using (auth.uid() = homeowner_id);
create policy "Provider views assigned jobs" on public.jobs
  for select using (auth.uid() = provider_id);

-- ── Recurring Schedules ────────────────────────────────────
create table if not exists public.recurring_schedules (
  id             uuid default gen_random_uuid() primary key,
  homeowner_id   uuid references public.users(id) on delete cascade not null,
  property_id    uuid references public.homeowner_properties(id),
  provider_id    uuid references public.users(id),
  service_type   text not null,
  frequency      text not null,  -- weekly | biweekly | monthly | seasonal
  day_of_week    int,            -- 0=Sun … 6=Sat
  time_window    text,           -- e.g. 'morning' | 'afternoon'
  status         text default 'active',  -- active | paused | cancelled
  next_date      date,
  created_at     timestamptz default now()
);

alter table public.recurring_schedules enable row level security;
create policy "Homeowner manages own schedules" on public.recurring_schedules
  for all using (auth.uid() = homeowner_id);

-- ── Reviews ────────────────────────────────────────────────
create table if not exists public.reviews (
  id                uuid default gen_random_uuid() primary key,
  job_id            uuid references public.jobs(id),
  homeowner_id      uuid references public.users(id) not null,
  provider_id       uuid references public.users(id) not null,
  rating            int check (rating between 1 and 5),
  body              text,
  before_photo_urls text[] default '{}',
  after_photo_urls  text[] default '{}',
  provider_response text,
  created_at        timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "Homeowner manages own reviews" on public.reviews
  for all using (auth.uid() = homeowner_id);
create policy "Reviews are publicly readable" on public.reviews
  for select using (true);

-- ── Messages ───────────────────────────────────────────────
create table if not exists public.messages (
  id               uuid default gen_random_uuid() primary key,
  from_user_id     uuid references public.users(id) not null,
  to_user_id       uuid references public.users(id) not null,
  quote_request_id uuid references public.quote_requests(id),
  job_id           uuid references public.jobs(id),
  body             text not null,
  read             boolean default false,
  created_at       timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Users see own messages" on public.messages
  for all using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- ── Notifications ──────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.users(id) on delete cascade not null,
  type       text not null,  -- new_quote | new_message | job_reminder | review_request
  title      text not null,
  body       text,
  link       text,
  read       boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users manage own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- ── Profile photo column (extend existing profiles table) ──
alter table public.profiles
  add column if not exists phone text,
  add column if not exists photo_url text;
