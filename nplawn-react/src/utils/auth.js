// SHA-256 via Web Crypto API
export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hardcoded accounts (password hashes, no plaintext)
const SEED_USERS = [
  { email: 'navpan@gmail.com', hash: 'ac3dcbcd3e71bbb60120cd8ad9a72d296b1b1286588d6a99f80c62e6cd7904f3', role: 'user',  verified: true },
  { email: 'admin@admin.com',  hash: 'e3e31c95446c914fe21f4d653ccfdd47a0da5d466075869ac48555ded43e59a8', role: 'admin', verified: true },
];

// Reserved emails (can't be re-registered)
export const RESERVED_EMAILS = SEED_USERS.map(u => u.email.toLowerCase());

export function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('nplawn_users') || '[]');
  } catch { return []; }
}

export function saveRegisteredUsers(users) {
  localStorage.setItem('nplawn_users', JSON.stringify(users));
}

export async function findUser(email, password) {
  const lc = email.toLowerCase().trim();
  const inputHash = await sha256(password);

  // Check seed users first
  const seed = SEED_USERS.find(u => u.email === lc && u.hash === inputHash);
  if (seed) return { ...seed, name: lc.split('@')[0] };

  // Check localStorage users
  const registered = getRegisteredUsers();
  const found = registered.find(u => u.email === lc && u.hash === inputHash);
  if (found) {
    if (!found.verified) return { error: 'unverified' };
    return { ...found, role: 'user' };
  }
  return null;
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem('nplawn_session') || 'null');
  } catch { return null; }
}

export function saveSession(user) {
  sessionStorage.setItem('nplawn_session', JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem('nplawn_session');
}

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('nplawn_orders') || '[]');
  } catch { return []; }
}
