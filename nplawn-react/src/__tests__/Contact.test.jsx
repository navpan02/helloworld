import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import Contact from '../pages/Contact';

function renderContact() {
  return render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>
  );
}

/** Fill the always-required fields (name + message) plus any contact info provided. */
function fillForm({ name = 'Jane Smith', email = '', phone = '', message = 'I need lawn help.' } = {}) {
  fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: name } });
  if (email) fireEvent.change(screen.getByPlaceholderText('jane@example.com'), { target: { value: email } });
  if (phone) fireEvent.change(screen.getByPlaceholderText('(630) 555-0100'), { target: { value: phone } });
  fireEvent.change(screen.getByPlaceholderText(/tell us about your lawn/i), { target: { value: message } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /send message/i }));
}

describe('Contact Page – Lead Submission', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the contact form with all key fields', () => {
    renderContact();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(630) 555-0100')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tell us about your lawn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('renders all available service options in the dropdown', () => {
    renderContact();
    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain('Lawn Mowing');
    expect(options).toContain('Tree Trimming');
    expect(options).toContain('Aeration & Seeding');
    expect(options).toContain('Landscape Design');
  });

  // ── Contact info validation (email OR phone) ──────────────────────────────

  it('shows an error and does not submit when neither email nor phone is provided', () => {
    renderContact();
    fillForm({ email: '', phone: '' });
    submit();

    expect(screen.getByText(/please provide at least an email address or a phone number/i)).toBeInTheDocument();
    expect(localStorage.getItem('nplawn_leads')).toBeNull();
  });

  it('submits successfully when only email is provided', () => {
    renderContact();
    fillForm({ email: 'jane@example.com', phone: '' });
    submit();

    expect(screen.queryByText(/please provide/i)).not.toBeInTheDocument();
    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads).toHaveLength(1);
    expect(leads[0].email).toBe('jane@example.com');
    expect(leads[0].phone).toBe('');
  });

  it('submits successfully when only phone is provided', () => {
    renderContact();
    fillForm({ email: '', phone: '6305550100' });
    submit();

    expect(screen.queryByText(/please provide/i)).not.toBeInTheDocument();
    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads).toHaveLength(1);
    expect(leads[0].phone).toBe('6305550100');
    expect(leads[0].email).toBe('');
  });

  it('submits successfully when both email and phone are provided', () => {
    renderContact();
    fillForm({ email: 'jane@example.com', phone: '6305550100' });
    submit();

    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads).toHaveLength(1);
    expect(leads[0].email).toBe('jane@example.com');
    expect(leads[0].phone).toBe('6305550100');
  });

  it('clears the contact error when the user starts typing in email or phone', () => {
    renderContact();
    fillForm({ email: '', phone: '' });
    submit();
    expect(screen.getByText(/please provide/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('jane@example.com'), { target: { value: 'j@e.com' } });
    expect(screen.queryByText(/please provide/i)).not.toBeInTheDocument();
  });

  // ── Saved lead content ────────────────────────────────────────────────────

  it('saves the lead with all form fields to localStorage', () => {
    renderContact();
    fillForm({ email: 'jane@example.com', phone: '6305550100' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Lawn Mowing' } });
    submit();

    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads[0].name).toBe('Jane Smith');
    expect(leads[0].message).toBe('I need lawn help.');
    expect(leads[0].service).toBe('Lawn Mowing');
    expect(leads[0].submittedAt).toBeDefined();
  });

  it('appends to existing leads rather than overwriting them', () => {
    localStorage.setItem('nplawn_leads', JSON.stringify([{ name: 'Existing Lead', email: 'old@example.com' }]));
    renderContact();
    fillForm({ email: 'new@example.com' });
    submit();

    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads).toHaveLength(2);
    expect(leads[0].name).toBe('Existing Lead');
    expect(leads[1].name).toBe('Jane Smith');
  });

  // ── Success screen ────────────────────────────────────────────────────────

  it('shows the success screen after a valid submission', () => {
    renderContact();
    fillForm({ email: 'jane@example.com' });
    submit();

    expect(screen.getByText('Message Received!')).toBeInTheDocument();
    expect(screen.getByText(/we'll be in touch within one business day/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send message/i })).not.toBeInTheDocument();
  });

  // ── Required attribute checks ─────────────────────────────────────────────

  it('marks name and message as required; email and phone are not individually required', () => {
    renderContact();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeRequired();
    expect(screen.getByPlaceholderText(/tell us about your lawn/i)).toBeRequired();
    // Contact info: neither is individually required — the JS validation enforces "at least one"
    expect(screen.getByPlaceholderText('jane@example.com')).not.toBeRequired();
    expect(screen.getByPlaceholderText('(630) 555-0100')).not.toBeRequired();
  });
});
