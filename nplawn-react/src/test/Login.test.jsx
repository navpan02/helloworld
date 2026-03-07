import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/Login';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, login: vi.fn() }),
}));

vi.mock('../utils/auth', () => ({
  findUser: vi.fn(),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('Login page – header colors', () => {
  it('header section has bg-np-dark background', () => {
    const { container } = renderLogin();
    const card = container.querySelector('.rounded-2xl');
    const header = card.firstElementChild;
    expect(header.className).toContain('bg-np-dark');
  });

  it('"NP" and "LLC" text spans use text-white', () => {
    const { container } = renderLogin();
    const card = container.querySelector('.rounded-2xl');
    const header = card.firstElementChild;
    const innerSpans = header.querySelectorAll('span > span');
    const whiteSpans = Array.from(innerSpans).filter(s =>
      s.className.includes('text-white')
    );
    expect(whiteSpans.length).toBeGreaterThanOrEqual(2);
  });

  it('"Lawn" uses text-np-lite', () => {
    const { container } = renderLogin();
    const card = container.querySelector('.rounded-2xl');
    const header = card.firstElementChild;
    const lawnEm = header.querySelector('em');
    expect(lawnEm.className).toContain('text-np-lite');
  });

  it('logo SVG uses stroke-np-lite (not text-green-200)', () => {
    const { container } = renderLogin();
    const card = container.querySelector('.rounded-2xl');
    const header = card.firstElementChild;
    const svg = header.querySelector('svg');
    expect(svg.className.baseVal).toContain('stroke-np-lite');
    expect(svg.className.baseVal).not.toContain('text-green-200');
  });

  it('subtitle uses text-white opacity class', () => {
    const { container } = renderLogin();
    const card = container.querySelector('.rounded-2xl');
    const header = card.firstElementChild;
    const subtitle = header.querySelector('p');
    expect(subtitle.className).toMatch(/text-white/);
  });
});
