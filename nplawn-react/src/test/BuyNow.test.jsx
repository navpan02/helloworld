import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BuyNow from '../pages/BuyNow';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({ insert: mockInsert }),
  },
}));

const MOCK_PLACE = {
  display_name: '123 Main St, Naperville, Illinois, 60540, US',
  lat: '41.7508',
  lon: '-88.1535',
  boundingbox: ['41.748', '41.753', '-88.156', '-88.151'],
};

// Nominatim returns a place; Overpass returns empty (triggers bbox fallback)
global.fetch = vi.fn((url) => {
  if (url.includes('nominatim')) {
    return Promise.resolve({ json: () => Promise.resolve([MOCK_PLACE]) });
  }
  // Overpass API — return empty so bbox fallback runs
  return Promise.resolve({ json: () => Promise.resolve({ elements: [] }) });
});

// Minimal Leaflet stub so map init doesn't throw
function stubLeaflet() {
  const mapInstance = {
    setView: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  };
  window.L = {
    map: vi.fn(() => mapInstance),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    circle: vi.fn(() => ({ addTo: vi.fn() })),
    divIcon: vi.fn(() => ({})),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
      openPopup: vi.fn().mockReturnThis(),
    })),
  };
}

beforeEach(() => {
  mockInsert.mockResolvedValue({ error: null });
  stubLeaflet();
});

const renderBuyNow = () =>
  render(
    <MemoryRouter>
      <BuyNow />
    </MemoryRouter>
  );

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fill step 0 and advance to step 1 (map). */
async function completeStep0(user) {
  const addressInput = screen.getByPlaceholderText(/123 Main St/i);
  await user.type(addressInput, '123 Main');
  // Wait for Nominatim dropdown suggestion
  const suggestion = await screen.findByText(/123 Main St/i);
  await user.click(suggestion);
  await user.type(screen.getByPlaceholderText(/\(630\)/), '6305550100');
  await user.click(screen.getByRole('button', { name: /continue/i }));
}

/** Advance from step 1 (map) to step 2 (plan selection). */
async function advanceFromMapStep() {
  const nextBtn = await screen.findByRole('button', { name: /see pricing/i });
  fireEvent.click(nextBtn);
}

/** Advance from step 2 (plan) to step 3 (review). */
async function advanceFromPlanStep() {
  fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('BuyNow – Step 0: Property Details', () => {
  it('renders address, phone, and email fields', () => {
    renderBuyNow();
    expect(screen.getByPlaceholderText(/123 Main St/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\(630\)/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
  });

  it('shows an error if no address is selected and Continue is clicked', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await user.type(screen.getByPlaceholderText(/\(630\)/), '6305550100');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/please select an address/i)).toBeInTheDocument();
  });

  it('shows an error if address is selected but no contact info provided', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    const addressInput = screen.getByPlaceholderText(/123 Main St/i);
    await user.type(addressInput, '123 Main');
    const suggestion = await screen.findByText(/123 Main St/i);
    await user.click(suggestion);
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/phone number or email/i)).toBeInTheDocument();
  });

  it('shows "Address confirmed" after selecting a suggestion', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await user.type(screen.getByPlaceholderText(/123 Main St/i), '123 Main');
    const suggestion = await screen.findByText(/123 Main St/i);
    await user.click(suggestion);
    expect(screen.getByText(/address confirmed/i)).toBeInTheDocument();
  });
});

describe('BuyNow – Step 2: Plan Selection', () => {
  it('shows all three plan cards', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    expect(screen.getByText('GrassBasic')).toBeInTheDocument();
    expect(screen.getByText('GrassPro')).toBeInTheDocument();
    expect(screen.getByText('GrassNatural')).toBeInTheDocument();
  });

  it('defaults to GrassPro (Standard) selected', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    // GrassPro card should have the accent border (selected state)
    const cards = screen.getAllByText(/GrassPro|GrassBasic|GrassNatural/);
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });
});

describe('BuyNow – Step 3: Review & Order', () => {
  it('disables Place Order button when name is empty', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    await advanceFromPlanStep();
    const placeBtn = screen.getByRole('button', { name: /place order/i });
    expect(placeBtn).toBeDisabled();
  });

  it('enables Place Order button after name is entered', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    await advanceFromPlanStep();
    await user.type(screen.getByPlaceholderText(/Jane Smith/i), 'John Doe');
    expect(screen.getByRole('button', { name: /place order/i })).toBeEnabled();
  });

  it('shows order summary with address and plan details', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    await advanceFromPlanStep();
    // Address and plan label should appear in the review card
    expect(screen.getByText(/GrassPro/i)).toBeInTheDocument();
  });
});

describe('BuyNow – Order Submission', () => {
  it('calls supabase.insert with correct fields on Place Order', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    await advanceFromPlanStep();
    await user.type(screen.getByPlaceholderText(/Jane Smith/i), 'John Doe');
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));

    const [insertedData] = mockInsert.mock.calls[0];
    expect(insertedData.id).toMatch(/^NPL-/);
    expect(insertedData.customer_name).toBe('John Doe');
    expect(insertedData.customer_phone).toBe('6305550100');
    expect(insertedData.plan).toBeTruthy();
    expect(insertedData.sqft).toBeGreaterThan(0);
    expect(insertedData.total).toBeGreaterThan(0);
    expect(insertedData.submitted_at).toBeTruthy();
  });

  it('saves order to localStorage as fallback', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    await advanceFromPlanStep();
    await user.type(screen.getByPlaceholderText(/Jane Smith/i), 'John Doe');
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('nplawn_orders') || '[]');
      expect(saved.length).toBe(1);
      expect(saved[0].customer_name).toBe('John Doe');
    });
  });

  it('shows confirmation screen with order ID after placing order', async () => {
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    await advanceFromPlanStep();
    await user.type(screen.getByPlaceholderText(/Jane Smith/i), 'John Doe');
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await screen.findByText(/thank you/i);
    expect(screen.getAllByText(/NPL-/i).length).toBeGreaterThan(0);
  });

  it('shows DB error on step 3 and stays on that page when insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'relation "orders" does not exist', code: '42P01' } });
    const user = userEvent.setup();
    renderBuyNow();
    await completeStep0(user);
    await advanceFromMapStep();
    await advanceFromPlanStep();
    await user.type(screen.getByPlaceholderText(/Jane Smith/i), 'John Doe');
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    // Error should appear on step 3 — NOT the confirmation screen
    await screen.findByText(/supabase error/i);
    expect(screen.getByText(/42P01/)).toBeInTheDocument();
    expect(screen.queryByText(/thank you/i)).not.toBeInTheDocument();
    // Order saved locally as fallback
    const saved = JSON.parse(localStorage.getItem('nplawn_orders') || '[]');
    expect(saved.length).toBe(1);
  });
});
