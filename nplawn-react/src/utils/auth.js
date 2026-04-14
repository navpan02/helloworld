import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Auth helpers — passwords are hashed client-side with SHA-256 before storage.
// Users are stored in the public.users table (not Supabase Auth).
// ---------------------------------------------------------------------------

/** SHA-256 of a string → 64-char lowercase hex. */
export async function sha256(message) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Seed accounts that cannot be re-registered. */
export const RESERVED_EMAILS = ['admin@admin.com', 'navpan@gmail.com'];

// ---------------------------------------------------------------------------
// Legacy / local-auth helpers (kept for backward-compat and test coverage)
// ---------------------------------------------------------------------------

export function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem('nplawn_users') || '[]'); }
  catch { return []; }
}

export function saveRegisteredUsers(users) {
  localStorage.setItem('nplawn_users', JSON.stringify(users));
}

/** Look up a user by email + password in localStorage (legacy). */
export async function findUser(email, password) {
  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!found) return null;
  if (!found.verified) return { error: 'unverified' };
  const hash = await sha256(password);
  if (hash !== found.hash) return null;
  return { email: found.email, name: found.name || '', role: found.role || 'user' };
}

// ---------------------------------------------------------------------------
// Session helpers (sessionStorage)
// ---------------------------------------------------------------------------

const SESSION_KEY = 'nplawn_session';
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { user, expires } = JSON.parse(raw);
    if (Date.now() > expires) { localStorage.removeItem(SESSION_KEY); return null; }
    return user;
  } catch { return null; }
}

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    user,
    expires: Date.now() + SESSION_TTL,
  }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Application-level auth — users stored in public.users table
// ---------------------------------------------------------------------------

/**
 * Register a new user in the public.users table.
 * role: 'user' | 'provider' | 'admin'
 */
export async function signUpUser({ email, password, name, role = 'user' }) {
  const normalEmail = email.toLowerCase().trim();

  // Check for existing account
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalEmail)
    .maybeSingle();

  if (existing) {
    return { data: null, error: { message: 'User already registered' } };
  }

  const id = crypto.randomUUID();
  const password_hash = await sha256(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      id,
      email: normalEmail,
      password_hash,
      name: name || normalEmail.split('@')[0],
      role,
    })
    .select('id, email, name, role')
    .single();

  return { data, error };
}

/**
 * Sign in by looking up the user in public.users and comparing password hash.
 * Returns { data: { user }, error } on success.
 */
export async function signInUser({ email, password }) {
  const normalEmail = email.toLowerCase().trim();

  const { data: dbUser, error } = await supabase
    .from('users')
    .select('id, email, name, role, password_hash')
    .eq('email', normalEmail)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!dbUser) return { data: null, error: { message: 'Invalid login credentials' } };

  const hash = await sha256(password);
  if (hash !== dbUser.password_hash) {
    return { data: null, error: { message: 'Invalid login credentials' } };
  }

  const { password_hash: _omit, ...user } = dbUser;
  return { data: { user }, error: null };
}

/**
 * Map an error object to a user-friendly message.
 */
export function authErrorMessage(error) {
  if (!error) return '';
  const msg = error.message?.toLowerCase() ?? '';
  if (msg.includes('invalid login') || msg.includes('invalid credentials'))
    return 'Invalid email or password.';
  if (msg.includes('user already registered'))
    return 'An account with this email already exists.';
  if (msg.includes('password should be') || msg.includes('at least'))
    return 'Password must be at least 6 characters.';
  if (msg.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.';
  return error.message || 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------------------
// Retained for backward-compatibility while orders still read localStorage
// ---------------------------------------------------------------------------
export function getOrders() {
  try { return JSON.parse(localStorage.getItem('nplawn_orders') || '[]'); }
  catch { return []; }
}
