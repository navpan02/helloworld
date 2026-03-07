import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}));

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

describe('Navbar – background & brand colors', () => {
  it('nav has solid bg-np-dark class (not the broken /96 opacity variant)', () => {
    const { container } = renderNavbar();
    const nav = container.querySelector('nav');
    expect(nav.className).toContain('bg-np-dark');
    expect(nav.className).not.toContain('bg-np-dark/96');
  });

  it('brand text wrapper uses text-white', () => {
    const { container } = renderNavbar();
    const brandSpan = container.querySelector('a span');
    expect(brandSpan.className).toContain('text-white');
  });

  it('"Lawn" accent uses text-np-lite', () => {
    const { container } = renderNavbar();
    const lawnEm = container.querySelector('a span em');
    expect(lawnEm.className).toContain('text-np-lite');
  });

  it('logo icon square uses gradient from np-lite to np-accent', () => {
    const { container } = renderNavbar();
    const iconBox = container.querySelector('a div');
    expect(iconBox.className).toContain('from-np-lite');
    expect(iconBox.className).toContain('to-np-accent');
  });

  it('logo SVG icon uses fill-np-dark (dark leaf on light background)', () => {
    const { container } = renderNavbar();
    const svg = container.querySelector('a div svg');
    expect(svg.className.baseVal).toContain('fill-np-dark');
  });
});
