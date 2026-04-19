import { createClient } from 'npm:@supabase/supabase-js@2';

// Constant-time string comparison — prevents timing attacks on password checks
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  const paddedA = new Uint8Array(maxLen);
  const paddedB = new Uint8Array(maxLen);
  paddedA.set(aBytes);
  paddedB.set(bBytes);
  // length mismatch seeds a non-zero result so we still scan all bytes
  let result = aBytes.length === bBytes.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) result |= paddedA[i] ^ paddedB[i];
  return result === 0;
}

const ALLOWED_ORIGIN = Deno.env.get('PORTAL_ALLOWED_ORIGIN') ?? '';

function corsHeaders(origin: string) {
  const allowed = ALLOWED_ORIGIN
    ? (origin === ALLOWED_ORIGIN ? origin : '')
    : origin; // dev fallback: echo origin when env var not set
  return {
    'Access-Control-Allow-Origin': allowed || 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const CORS = corsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const sharedPassword = Deno.env.get('PORTAL_SHARED_PASSWORD');
    if (!sharedPassword) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    if (!timingSafeEqual(password, sharedPassword)) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Look up the user
    const { data: user, error: userErr } = await supabase
      .from('portal_users')
      .select('id, username, display_name, role, branch_id, active')
      .eq('username', username.trim().toLowerCase())
      .single();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    if (!user.active) {
      return new Response(JSON.stringify({ error: 'Account is disabled' }), {
        status: 403, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Create session (12-hour expiry)
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    const { data: session, error: sessionErr } = await supabase
      .from('portal_sessions')
      .insert({ user_id: user.id, expires_at: expiresAt })
      .select('token')
      .single();

    if (sessionErr || !session) {
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Fetch branch name if manager
    let branchName = null;
    if (user.branch_id) {
      const { data: branch } = await supabase
        .from('branches')
        .select('name')
        .eq('id', user.branch_id)
        .single();
      branchName = branch?.name ?? null;
    }

    return new Response(JSON.stringify({
      token: session.token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
        branchId: user.branch_id,
        branchName,
      },
      expiresAt,
    }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Portal login error:', err instanceof Error ? err.message : String(err));
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
