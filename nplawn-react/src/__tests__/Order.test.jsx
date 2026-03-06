import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import Order from '../pages/Order';
import { AuthProvider } from '../context/AuthContext';

function renderOrder() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Order />
      </AuthProvider>
    </MemoryRouter>
  );
}

// Helpers for filling out each step
function selectPlanAndSqft(plan = 'GrassPro', sqft = '4000') {
  // GrassPro is selected by default; click a different plan card if needed
  if (plan !== 'GrassPro') {
    fireEvent.click(screen.getByText(plan));
  }
  const sqftInput = screen.getByPlaceholderText('e.g. 4000');
  fireEvent.change(sqftInput, { target: { value: sqft } });
}

function clickContinue() {
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
}

function fillDetailsForm({ name = 'Jane Smith', email = 'jane@example.com', phone = '6305550100',
                           address = '123 Main St', city = 'Naperville', zip = '60540' } = {}) {
  fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText('jane@example.com'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText('(630) 555-0100'), { target: { value: phone } });
  fireEvent.change(screen.getByPlaceholderText('123 Main St'), { target: { value: address } });
  fireEvent.change(screen.getByPlaceholderText('Naperville'), { target: { value: city } });
  fireEvent.change(screen.getByPlaceholderText('60540'), { target: { value: zip } });
}

// Helper to drive through all steps to confirmation
function completeOrder(sqft = '4000') {
  selectPlanAndSqft('GrassPro', sqft);
  clickContinue();
  fillDetailsForm();
  fireEvent.click(screen.getByRole('button', { name: /review order/i }));
  fireEvent.click(screen.getByRole('button', { name: /confirm order/i }));
}

describe('Order Page – Step 0: Plan Selection', () => {
  it('renders all three plan cards', () => {
    renderOrder();
    expect(screen.getByText('GrassBasic')).toBeInTheDocument();
    expect(screen.getByText('GrassPro')).toBeInTheDocument();
    expect(screen.getByText('GrassNatural')).toBeInTheDocument();
  });

  it('shows the sqft input on the currently selected plan card', () => {
    renderOrder(); // GrassPro is selected by default
    expect(screen.getByPlaceholderText('e.g. 4000')).toBeInTheDocument();
  });

  it('shows the sqft input on a newly selected plan card', () => {
    renderOrder();
    fireEvent.click(screen.getByText('GrassBasic'));
    expect(screen.getByPlaceholderText('e.g. 4000')).toBeInTheDocument();
  });

  it('Continue button is disabled when no sqft is entered', () => {
    renderOrder();
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('shows annual price after entering sqft (GrassPro, 4000 sqft → $740)', () => {
    renderOrder();
    selectPlanAndSqft('GrassPro', '4000');
    // GrassPro: first 1000 @ $0.20 = $200, next 3000 @ $0.18 = $540, total = $740
    expect(screen.getByText('$740')).toBeInTheDocument();
  });

  it('shows annual price for GrassBasic (1000 sqft → $100)', () => {
    renderOrder();
    fireEvent.click(screen.getByText('GrassBasic'));
    selectPlanAndSqft('GrassBasic', '1000');
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('shows annual price for GrassNatural (500 sqft → $150)', () => {
    renderOrder();
    fireEvent.click(screen.getByText('GrassNatural'));
    selectPlanAndSqft('GrassNatural', '500');
    expect(screen.getByText('$150')).toBeInTheDocument();
  });

  it('Continue button becomes enabled after entering sqft', () => {
    renderOrder();
    selectPlanAndSqft('GrassPro', '4000');
    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
  });

  it('advances to Step 1 when Continue is clicked', () => {
    renderOrder();
    selectPlanAndSqft('GrassPro', '4000');
    clickContinue();
    expect(screen.getByText('Your Information')).toBeInTheDocument();
  });
});

describe('Order Page – Step 1: Customer Details', () => {
  beforeEach(() => {
    renderOrder();
    selectPlanAndSqft('GrassPro', '4000');
    clickContinue();
  });

  it('renders all required customer detail fields', () => {
    expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(630) 555-0100')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Naperville')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('60540')).toBeInTheDocument();
  });

  it('Review Order button is disabled when fields are empty', () => {
    expect(screen.getByRole('button', { name: /review order/i })).toBeDisabled();
  });

  it('Review Order button enables after all required fields are filled', () => {
    fillDetailsForm();
    expect(screen.getByRole('button', { name: /review order/i })).not.toBeDisabled();
  });

  it('Back button returns to Step 0', () => {
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Choose a Plan')).toBeInTheDocument();
  });

  it('advances to Step 2 after filling all fields and clicking Review Order', () => {
    fillDetailsForm();
    fireEvent.click(screen.getByRole('button', { name: /review order/i }));
    expect(screen.getByText('Review Your Order')).toBeInTheDocument();
  });
});

describe('Order Page – Step 2: Review', () => {
  beforeEach(() => {
    renderOrder();
    selectPlanAndSqft('GrassPro', '4000');
    clickContinue();
    fillDetailsForm();
    fireEvent.click(screen.getByRole('button', { name: /review order/i }));
  });

  it('shows the selected plan name in the review summary', () => {
    expect(screen.getAllByText('GrassPro').length).toBeGreaterThan(0);
  });

  it('shows customer name and email in the review summary', () => {
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows the annual price in the review summary', () => {
    expect(screen.getByText(/\$740/)).toBeInTheDocument();
  });

  it('shows the property size in the review summary', () => {
    expect(screen.getByText('4,000 sq ft')).toBeInTheDocument();
  });

  it('Back button returns to Step 1', () => {
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Your Information')).toBeInTheDocument();
  });

  it('Confirm Order button is present', () => {
    expect(screen.getByRole('button', { name: /confirm order/i })).toBeInTheDocument();
  });
});

describe('Order Page – Step 3: Confirmation & localStorage', () => {
  beforeEach(() => {
    renderOrder();
    completeOrder('4000');
  });

  it('shows the Order Received! confirmation screen', () => {
    expect(screen.getByText('Order Received!')).toBeInTheDocument();
  });

  it('shows an order ID starting with NPL-', () => {
    expect(screen.getByText(/NPL-\d+/)).toBeInTheDocument();
  });

  it('saves the order to localStorage', () => {
    const orders = JSON.parse(localStorage.getItem('nplawn_orders'));
    expect(orders).toHaveLength(1);
  });

  it('saved order has correct plan, sqft, and total', () => {
    const [order] = JSON.parse(localStorage.getItem('nplawn_orders'));
    expect(order.plan).toBe('GrassPro');
    expect(order.sqft).toBe(4000);
    expect(order.total).toBe(740);
  });

  it('saved order has correct customer details', () => {
    const [order] = JSON.parse(localStorage.getItem('nplawn_orders'));
    expect(order.customer.name).toBe('Jane Smith');
    expect(order.customer.email).toBe('jane@example.com');
    expect(order.customer.city).toBe('Naperville');
  });

  it('saved order has a submittedAt timestamp', () => {
    const [order] = JSON.parse(localStorage.getItem('nplawn_orders'));
    expect(order.submittedAt).toBeGreaterThan(0);
  });

  it('appends to existing orders rather than overwriting them', () => {
    // Place a second order by re-rendering
    localStorage.setItem('nplawn_orders', JSON.stringify([{ id: 'NPL-000001', plan: 'GrassBasic' }]));
    renderOrder();
    completeOrder('2000');
    const orders = JSON.parse(localStorage.getItem('nplawn_orders'));
    expect(orders).toHaveLength(2);
    expect(orders[0].id).toBe('NPL-000001');
  });

  it('shows Back to Home and Contact Us links on the confirmation screen', () => {
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
  });
});
