-- ============================================================
-- Phase 1 — Multi-Tenancy Foundation
-- Adds: organizations, user_roles, org_id columns, RLS policies
-- ============================================================

-- ── 1. Organizations (top-level tenant) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO organizations (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Default Organization', 'default')
ON CONFLICT DO NOTHING;

-- ── 2. Role definitions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO user_roles (name, description) VALUES
  ('org_admin',      'Organization administrator — full access to all branches'),
  ('branch_manager', 'Branch manager — scoped to their assigned branch')
ON CONFLICT DO NOTHING;

-- ── 3. Add org_id to branches ─────────────────────────────────────────────────
ALTER TABLE branches
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
  DEFAULT '00000000-0000-0000-0000-000000000010';
UPDATE branches SET org_id = '00000000-0000-0000-0000-000000000010' WHERE org_id IS NULL;

-- ── 4. Migrate portal_users: add org_id, rename 'admin' → 'org_admin' ────────
ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
  DEFAULT '00000000-0000-0000-0000-000000000010';
UPDATE portal_users SET org_id = '00000000-0000-0000-0000-000000000010' WHERE org_id IS NULL;
UPDATE portal_users SET role = 'org_admin' WHERE role = 'admin';
ALTER TABLE portal_users DROP CONSTRAINT IF EXISTS portal_users_role_check;
ALTER TABLE portal_users ADD CONSTRAINT portal_users_role_check
  CHECK (role IN ('org_admin', 'branch_manager'));

-- ── 5. Denormalize org_id onto core tables for RLS performance ────────────────
ALTER TABLE agents ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
  DEFAULT '00000000-0000-0000-0000-000000000010';
UPDATE agents SET org_id = '00000000-0000-0000-0000-000000000010' WHERE org_id IS NULL;

ALTER TABLE route_plans ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
  DEFAULT '00000000-0000-0000-0000-000000000010';
UPDATE route_plans SET org_id = '00000000-0000-0000-0000-000000000010' WHERE org_id IS NULL;

ALTER TABLE route_assignments ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
  DEFAULT '00000000-0000-0000-0000-000000000010';
UPDATE route_assignments SET org_id = '00000000-0000-0000-0000-000000000010' WHERE org_id IS NULL;

ALTER TABLE route_addresses ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)
  DEFAULT '00000000-0000-0000-0000-000000000010';
UPDATE route_addresses SET org_id = '00000000-0000-0000-0000-000000000010' WHERE org_id IS NULL;

-- ── 6. Helper functions ───────────────────────────────────────────────────────

-- Reads the portal session token from the PostgREST x-portal-token request header
CREATE OR REPLACE FUNCTION current_portal_token()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT NULLIF(
    (current_setting('request.headers', true)::jsonb) ->> 'x-portal-token', ''
  );
$$;

CREATE OR REPLACE FUNCTION portal_session_org_id(p_token TEXT)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT pu.org_id
  FROM portal_sessions ps
  JOIN portal_users pu ON pu.id = ps.user_id
  WHERE ps.token = p_token AND ps.expires_at > NOW() AND pu.active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION portal_session_branch_id(p_token TEXT)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT pu.branch_id
  FROM portal_sessions ps
  JOIN portal_users pu ON pu.id = ps.user_id
  WHERE ps.token = p_token AND ps.expires_at > NOW()
    AND pu.role = 'branch_manager' AND pu.active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION portal_session_role(p_token TEXT)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT pu.role
  FROM portal_sessions ps
  JOIN portal_users pu ON pu.id = ps.user_id
  WHERE ps.token = p_token AND ps.expires_at > NOW() AND pu.active = TRUE
  LIMIT 1;
$$;

-- ── 7. Enable RLS ─────────────────────────────────────────────────────────────
ALTER TABLE organizations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE geocode_cache     ENABLE ROW LEVEL SECURITY;

-- ── 8. RLS policies ───────────────────────────────────────────────────────────

-- organizations
DROP POLICY IF EXISTS org_portal_select ON organizations;
CREATE POLICY org_portal_select ON organizations FOR SELECT
  USING (id = portal_session_org_id(current_portal_token()));

-- branches
DROP POLICY IF EXISTS branches_portal_select ON branches;
CREATE POLICY branches_portal_select ON branches FOR SELECT
  USING (org_id = portal_session_org_id(current_portal_token()));

DROP POLICY IF EXISTS branches_portal_insert ON branches;
CREATE POLICY branches_portal_insert ON branches FOR INSERT
  WITH CHECK (
    org_id = portal_session_org_id(current_portal_token())
    AND portal_session_role(current_portal_token()) = 'org_admin'
  );

DROP POLICY IF EXISTS branches_portal_update ON branches;
CREATE POLICY branches_portal_update ON branches FOR UPDATE
  USING (
    org_id = portal_session_org_id(current_portal_token())
    AND portal_session_role(current_portal_token()) = 'org_admin'
  );

-- agents: org_admin sees all; branch_manager sees own branch only
DROP POLICY IF EXISTS agents_portal_select ON agents;
CREATE POLICY agents_portal_select ON agents FOR SELECT
  USING (
    org_id = portal_session_org_id(current_portal_token())
    AND (
      portal_session_role(current_portal_token()) = 'org_admin'
      OR branch_id = portal_session_branch_id(current_portal_token())
    )
  );

DROP POLICY IF EXISTS agents_portal_insert ON agents;
CREATE POLICY agents_portal_insert ON agents FOR INSERT
  WITH CHECK (org_id = portal_session_org_id(current_portal_token()));

DROP POLICY IF EXISTS agents_portal_update ON agents;
CREATE POLICY agents_portal_update ON agents FOR UPDATE
  USING (org_id = portal_session_org_id(current_portal_token()));

-- route_plans
DROP POLICY IF EXISTS route_plans_portal_select ON route_plans;
CREATE POLICY route_plans_portal_select ON route_plans FOR SELECT
  USING (
    org_id = portal_session_org_id(current_portal_token())
    AND (
      portal_session_role(current_portal_token()) = 'org_admin'
      OR branch_id = portal_session_branch_id(current_portal_token())
    )
  );

DROP POLICY IF EXISTS route_plans_portal_insert ON route_plans;
CREATE POLICY route_plans_portal_insert ON route_plans FOR INSERT
  WITH CHECK (org_id = portal_session_org_id(current_portal_token()));

DROP POLICY IF EXISTS route_plans_portal_update ON route_plans;
CREATE POLICY route_plans_portal_update ON route_plans FOR UPDATE
  USING (org_id = portal_session_org_id(current_portal_token()));

-- route_assignments
DROP POLICY IF EXISTS route_assign_portal_select ON route_assignments;
CREATE POLICY route_assign_portal_select ON route_assignments FOR SELECT
  USING (
    org_id = portal_session_org_id(current_portal_token())
    AND (
      portal_session_role(current_portal_token()) = 'org_admin'
      OR branch_id = portal_session_branch_id(current_portal_token())
    )
  );

DROP POLICY IF EXISTS route_assign_portal_insert ON route_assignments;
CREATE POLICY route_assign_portal_insert ON route_assignments FOR INSERT
  WITH CHECK (org_id = portal_session_org_id(current_portal_token()));

DROP POLICY IF EXISTS route_assign_portal_update ON route_assignments;
CREATE POLICY route_assign_portal_update ON route_assignments FOR UPDATE
  USING (org_id = portal_session_org_id(current_portal_token()));

-- route_addresses
DROP POLICY IF EXISTS route_addr_portal_select ON route_addresses;
CREATE POLICY route_addr_portal_select ON route_addresses FOR SELECT
  USING (
    org_id = portal_session_org_id(current_portal_token())
    AND (
      portal_session_role(current_portal_token()) = 'org_admin'
      OR branch_id = portal_session_branch_id(current_portal_token())
    )
  );

DROP POLICY IF EXISTS route_addr_portal_insert ON route_addresses;
CREATE POLICY route_addr_portal_insert ON route_addresses FOR INSERT
  WITH CHECK (org_id = portal_session_org_id(current_portal_token()));

DROP POLICY IF EXISTS route_addr_portal_update ON route_addresses;
CREATE POLICY route_addr_portal_update ON route_addresses FOR UPDATE
  USING (org_id = portal_session_org_id(current_portal_token()));

DROP POLICY IF EXISTS route_addr_portal_delete ON route_addresses;
CREATE POLICY route_addr_portal_delete ON route_addresses FOR DELETE
  USING (org_id = portal_session_org_id(current_portal_token()));

-- portal_users
DROP POLICY IF EXISTS portal_users_portal_select ON portal_users;
CREATE POLICY portal_users_portal_select ON portal_users FOR SELECT
  USING (
    org_id = portal_session_org_id(current_portal_token())
    AND (
      portal_session_role(current_portal_token()) = 'org_admin'
      OR id = (
        SELECT pu2.id FROM portal_sessions ps2
        JOIN portal_users pu2 ON pu2.id = ps2.user_id
        WHERE ps2.token = current_portal_token() AND ps2.expires_at > NOW()
        LIMIT 1
      )
    )
  );

-- portal_sessions: each user sees only their own
DROP POLICY IF EXISTS portal_sessions_select ON portal_sessions;
CREATE POLICY portal_sessions_select ON portal_sessions FOR SELECT
  USING (
    user_id = (
      SELECT pu2.id FROM portal_sessions ps2
      JOIN portal_users pu2 ON pu2.id = ps2.user_id
      WHERE ps2.token = current_portal_token() AND ps2.expires_at > NOW()
      LIMIT 1
    )
  );

-- geocode_cache: shared across org, no PII, any portal user can read/write
DROP POLICY IF EXISTS geocode_cache_portal_select ON geocode_cache;
CREATE POLICY geocode_cache_portal_select ON geocode_cache FOR SELECT
  USING (current_portal_token() IS NOT NULL);

DROP POLICY IF EXISTS geocode_cache_portal_insert ON geocode_cache;
CREATE POLICY geocode_cache_portal_insert ON geocode_cache FOR INSERT
  WITH CHECK (current_portal_token() IS NOT NULL);

-- ── 9. Performance indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_organizations_slug  ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_branches_org        ON branches(org_id);
CREATE INDEX IF NOT EXISTS idx_agents_org          ON agents(org_id);
CREATE INDEX IF NOT EXISTS idx_route_plans_org     ON route_plans(org_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_route_assign_org    ON route_assignments(org_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_route_addr_org      ON route_addresses(org_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_portal_users_org    ON portal_users(org_id);
