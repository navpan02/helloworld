-- ============================================================
-- Orders table for lawn care plan orders (Order.jsx)
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id               TEXT PRIMARY KEY,          -- e.g. NPL-123456
  user_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
  plan             TEXT NOT NULL,             -- GrassBasic | GrassPro | GrassNatural
  sqft             INT  NOT NULL,
  total            INT  NOT NULL,
  avg_per_app      INT,
  rounds           INT,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT,
  customer_phone   TEXT,
  customer_address TEXT,
  customer_city    TEXT,
  customer_zip     TEXT,
  customer_notes   TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | active | cancelled
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);
