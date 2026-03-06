import { describe, it, expect, beforeEach } from 'vitest';
import {
  sha256,
  getRegisteredUsers,
  saveRegisteredUsers,
  findUser,
  getSession,
  saveSession,
  clearSession,
  getOrders,
  RESERVED_EMAILS,
} from '../utils/auth';

describe('sha256', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await sha256('hello');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('produces a deterministic output for the same input', async () => {
    const h1 = await sha256('password123');
    const h2 = await sha256('password123');
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different inputs', async () => {
    const h1 = await sha256('password123');
    const h2 = await sha256('PASSWORD123');
    expect(h1).not.toBe(h2);
  });
});

describe('RESERVED_EMAILS', () => {
  it('includes the seed admin email', () => {
    expect(RESERVED_EMAILS).toContain('admin@admin.com');
  });

  it('includes the seed user email', () => {
    expect(RESERVED_EMAILS).toContain('navpan@gmail.com');
  });
});

describe('getRegisteredUsers / saveRegisteredUsers', () => {
  beforeEach(() => localStorage.clear());

  it('returns an empty array when localStorage is empty', () => {
    expect(getRegisteredUsers()).toEqual([]);
  });

  it('returns previously saved users', () => {
    const users = [{ email: 'a@b.com', hash: 'abc', verified: true }];
    saveRegisteredUsers(users);
    expect(getRegisteredUsers()).toEqual(users);
  });

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('nplawn_users', 'not-json');
    expect(getRegisteredUsers()).toEqual([]);
  });
});

describe('findUser', () => {
  beforeEach(() => localStorage.clear());

  it('returns null for an unknown email/password combination', async () => {
    const result = await findUser('nobody@example.com', 'wrongpass');
    expect(result).toBeNull();
  });

  it('returns { error: "unverified" } for a registered but unverified user', async () => {
    const hash = await sha256('mypassword');
    saveRegisteredUsers([{ email: 'pending@example.com', hash, verified: false }]);
    const result = await findUser('pending@example.com', 'mypassword');
    expect(result).toEqual({ error: 'unverified' });
  });

  it('returns the user object for a verified localStorage user', async () => {
    const hash = await sha256('mypassword');
    saveRegisteredUsers([{ email: 'verified@example.com', hash, verified: true, name: 'Verified' }]);
    const result = await findUser('verified@example.com', 'mypassword');
    expect(result).not.toBeNull();
    expect(result.email).toBe('verified@example.com');
    expect(result.role).toBe('user');
  });

  it('is case-insensitive for the email lookup', async () => {
    const hash = await sha256('mypassword');
    saveRegisteredUsers([{ email: 'verified@example.com', hash, verified: true }]);
    const result = await findUser('VERIFIED@EXAMPLE.COM', 'mypassword');
    expect(result).not.toBeNull();
  });

  it('returns null when password is wrong for a known user', async () => {
    const hash = await sha256('correctpassword');
    saveRegisteredUsers([{ email: 'user@example.com', hash, verified: true }]);
    const result = await findUser('user@example.com', 'wrongpassword');
    expect(result).toBeNull();
  });
});

describe('Session management', () => {
  beforeEach(() => sessionStorage.clear());

  it('getSession returns null when nothing is stored', () => {
    expect(getSession()).toBeNull();
  });

  it('saveSession persists the user and getSession retrieves it', () => {
    const user = { email: 'a@b.com', role: 'user' };
    saveSession(user);
    expect(getSession()).toEqual(user);
  });

  it('clearSession removes the stored session', () => {
    saveSession({ email: 'a@b.com' });
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('getSession returns null on invalid JSON in sessionStorage', () => {
    sessionStorage.setItem('nplawn_session', 'bad-json');
    expect(getSession()).toBeNull();
  });
});

describe('getOrders', () => {
  beforeEach(() => localStorage.clear());

  it('returns an empty array when no orders exist', () => {
    expect(getOrders()).toEqual([]);
  });

  it('returns saved orders from localStorage', () => {
    const orders = [{ id: 'NPL-001', plan: 'GrassPro', total: 740 }];
    localStorage.setItem('nplawn_orders', JSON.stringify(orders));
    expect(getOrders()).toEqual(orders);
  });
});
