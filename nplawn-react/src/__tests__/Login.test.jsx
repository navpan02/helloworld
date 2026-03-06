import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

// Mock findUser so we control auth responses without needing real crypto hashes
vi.mock('../utils/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    findUser: vi.fn(),
  };
});

import { findUser } from '../utils/auth';

function renderLogin(route = '/login') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields with a sign-in button', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to the signup page', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument();
  });

  it('shows an error when credentials are invalid', async () => {
    findUser.mockResolvedValueOnce(null);
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'badpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    });
  });

  it('shows an error when the account is unverified', async () => {
    findUser.mockResolvedValueOnce({ error: 'unverified' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Please verify your email before logging in.')).toBeInTheDocument();
    });
  });

  it('shows a generic error when findUser throws', async () => {
    findUser.mockRejectedValueOnce(new Error('network error'));
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables the button and shows "Signing in…" while loading', async () => {
    // Delay resolution so we can catch the loading state
    findUser.mockImplementationOnce(() => new Promise(() => {}));
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /signing in/i });
      expect(btn).toBeDisabled();
    });
  });

  it('shows a success toast when redirected after registration', () => {
    renderLogin('/login?registered=1');
    expect(screen.getByText('Account verified! You can now log in.')).toBeInTheDocument();
  });

  it('saves session and renders the app after a successful regular-user login', async () => {
    findUser.mockResolvedValueOnce({ email: 'user@example.com', role: 'user', name: 'user' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const session = JSON.parse(sessionStorage.getItem('nplawn_session'));
      expect(session).not.toBeNull();
      expect(session.email).toBe('user@example.com');
    });
  });
});
