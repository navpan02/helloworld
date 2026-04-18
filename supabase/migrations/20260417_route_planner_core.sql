-- =============================================================
-- Route Planner Core Schema
-- Run once in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- =============================================================

-- ── Branches (single "Default Branch" seeded; multi-tenant expansion later) ──
CREATE TABLE IF NOT EXISTS branches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  timezone     TEXT NOT NULL DEFAULT 'America/Chicago',
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO branches (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Default Branch')
ON CONFLICT DO NOTHING;

-- ── Agents ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT,
  phone          TEXT,
  start_address  TEXT,
  start_lat      NUMERIC(10,7),
  start_lng      NUMERIC(10,7),
  active         BOOLEAN DEFAULT TRUE,
  branch_id      UUID REFERENCES branches(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Geocode cache ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS geocode_cache (
  address_key  TEXT PRIMARY KEY,
  raw_address  TEXT,
  lat          NUMERIC(10,7),
  lng          NUMERIC(10,7),
  source       TEXT DEFAULT 'nominatim',
  cached_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Route plans (one per branch per day) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date     DATE NOT NULL,
  constraints   JSONB NOT NULL DEFAULT '{}',
  total_agents  INT DEFAULT 0,
  total_stops   INT DEFAULT 0,
  total_miles   NUMERIC(10,2) DEFAULT 0,
  unassigned_ct INT DEFAULT 0,
  status        TEXT CHECK (status IN ('draft','active','completed')) DEFAULT 'draft',
  created_by    TEXT,
  branch_id     UUID REFERENCES branches(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Per-agent route assignments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_assignments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          UUID REFERENCES route_plans(id) ON DELETE CASCADE,
  agent_id         UUID REFERENCES agents(id),
  agent_name       TEXT NOT NULL,
  cluster_sequence JSONB,
  stop_sequence    JSONB,
  total_stops      INT DEFAULT 0,
  total_miles      NUMERIC(10,2) DEFAULT 0,
  est_hours        NUMERIC(4,1) DEFAULT 0,
  google_maps_urls JSONB,
  view_token       TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  notified         BOOLEAN DEFAULT FALSE,
  branch_id        UUID REFERENCES branches(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Individual addresses within a plan ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID REFERENCES route_plans(id) ON DELETE CASCADE,
  address       TEXT NOT NULL,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  address_type  TEXT,
  priority_score INT DEFAULT 0,
  lat           NUMERIC(10,7),
  lng           NUMERIC(10,7),
  cluster_id    TEXT,
  assignment_id UUID REFERENCES route_assignments(id),
  stop_order    INT,
  status        TEXT CHECK (status IN ('assigned','unassigned','excluded')) DEFAULT 'unassigned',
  branch_id     UUID REFERENCES branches(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Portal users (admin2, branch managers) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role         TEXT CHECK (role IN ('admin', 'branch_manager')) NOT NULL,
  branch_id    UUID REFERENCES branches(id),
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed admin2 account (no password stored here — hash kept in Supabase secret)
INSERT INTO portal_users (username, display_name, role)
  VALUES ('admin2', 'Route Planner Admin', 'admin')
ON CONFLICT DO NOTHING;

-- ── Portal sessions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_sessions (
  token        TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(32), 'hex'),
  user_id      UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-expire: delete sessions older than 12 hours (run via pg_cron or manual cleanup)
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON portal_sessions(expires_at);

-- ── Useful indexes ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agents_branch      ON agents(branch_id);
CREATE INDEX IF NOT EXISTS idx_route_plans_date   ON route_plans(plan_date, branch_id);
CREATE INDEX IF NOT EXISTS idx_route_assign_plan  ON route_assignments(plan_id);
CREATE INDEX IF NOT EXISTS idx_route_assign_token ON route_assignments(view_token);
CREATE INDEX IF NOT EXISTS idx_route_addr_plan    ON route_addresses(plan_id);
CREATE INDEX IF NOT EXISTS idx_route_addr_assign  ON route_addresses(assignment_id);
CREATE INDEX IF NOT EXISTS idx_portal_users_uname ON portal_users(username);

-- ── Helper: get portal session branch from token ──────────────────────────────
-- Used by RLS policies to scope branch_manager queries
CREATE OR REPLACE FUNCTION portal_session_branch_id(p_token TEXT)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT pu.branch_id
  FROM portal_sessions ps
  JOIN portal_users pu ON pu.id = ps.user_id
  WHERE ps.token = p_token
    AND ps.expires_at > NOW()
    AND pu.role = 'branch_manager'
    AND pu.active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION portal_session_role(p_token TEXT)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT pu.role
  FROM portal_sessions ps
  JOIN portal_users pu ON pu.id = ps.user_id
  WHERE ps.token = p_token
    AND ps.expires_at > NOW()
    AND pu.active = TRUE
  LIMIT 1;
$$;
