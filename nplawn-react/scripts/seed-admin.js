/**
 * One-time script to create the admin account.
 * Supabase handles password hashing (bcrypt) server-side — no plaintext is stored.
 *
 * Requires the SERVICE ROLE key (not the anon key) — get it from:
 *   Supabase dashboard → Project Settings → API → service_role key
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-admin.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL         = 'https://gbxnofjprrjqqbseivhe.supabase.co';
const SERVICE_ROLE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL          = 'admin@admin.com';
const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD ?? 'Admin$123';

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY env variable before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email:          ADMIN_EMAIL,
  password:       ADMIN_PASSWORD,          // Supabase bcrypt-hashes this
  email_confirm:  true,                    // skip email verification
  user_metadata:  { role: 'admin', name: 'Admin' },
});

if (error) {
  console.error('Failed:', error.message);
  process.exit(1);
}

console.log('Admin account created:', data.user.id, data.user.email);
