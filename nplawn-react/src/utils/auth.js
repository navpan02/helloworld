import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Auth helpers — all password hashing is handled server-side by Supabase
// (bcrypt with per-user salt). No plaintext or local hashes are stored.
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 * role: 'user' | 'provider' | 'admin'
 * Supabase will send a confirmation email with a 6-digit OTP when email
 * confirmation is enabled in the Supabase dashboard (recommended).
 */
export async function signUpUser({ email, password, name, role = 'user' }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: { name: name || email.split('@')[0], role },
    },
  });
  return { data, error };
}

/**
 * Verify the 6-digit OTP sent to the user's email after signUp.
 */
export async function verifyEmailOtp({ email, token }) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token,
    type: 'email',
  });
  return { data, error };
}

/**
 * Resend the signup confirmation OTP.
 */
export async function resendConfirmation(email) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.toLowerCase().trim(),
  });
  return { error };
}

/**
 * Sign in with Google OAuth.
 * Supabase redirects back to the app; session is picked up by onAuthStateChange.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/' },
  });
  return { data, error };
}

/**
 * Sign in with Facebook OAuth.
 */
export async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: window.location.origin + '/' },
  });
  return { data, error };
}

/**
 * Sign in with email + password.
 * Returns { data: { session, user }, error }.
 */
export async function signInUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  return { data, error };
}

/**
 * Map a Supabase auth error code to a user-friendly message.
 */
export function authErrorMessage(error) {
  if (!error) return '';
  const msg = error.message?.toLowerCase() ?? '';
  if (msg.includes('invalid login') || msg.includes('invalid credentials'))
    return 'Incorrect email or password.';
  if (msg.includes('email not confirmed'))
    return 'Please verify your email before signing in.';
  if (msg.includes('user already registered'))
    return 'An account with this email already exists.';
  if (msg.includes('password should be'))
    return 'Password must be at least 6 characters.';
  if (msg.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.';
  return error.message || 'Something went wrong. Please try again.';
}

/**
 * Extract a normalised user object from a Supabase Session.
 */
export function sessionToUser(session) {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id:    user.id,
    email: user.email,
    role:  user.user_metadata?.role ?? user.app_metadata?.role ?? 'user',
    name:  user.user_metadata?.name  ?? user.email?.split('@')[0] ?? '',
  };
}

// ---------------------------------------------------------------------------
// Retained for backward-compatibility while orders still read localStorage
// ---------------------------------------------------------------------------
export function getOrders() {
  try { return JSON.parse(localStorage.getItem('nplawn_orders') || '[]'); }
  catch { return []; }
}
