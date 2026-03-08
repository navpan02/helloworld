import { useState } from 'react';
import { supabase } from '../lib/supabase';

const SERVICES_LIST = [
  'Lawn Mowing', 'Tree Trimming', 'Lawn Care Plan (GrassBasic)',
  'Lawn Care Plan (GrassPro)', 'Lawn Care Plan (GrassNatural)',
  'Tree & Shrub Care', 'Aeration & Seeding', 'Landscape Design', 'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');

  const set = (k, v) => {
    setContactError('');
    setForm(f => ({ ...f, [k]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) {
      setContactError('Please provide at least an email address or a phone number.');
      return;
    }
    const lead = { ...form, submitted_at: new Date().toISOString() };

    // Save to Supabase
    const { error } = await supabase.from('leads').insert([{
      name:         lead.name,
      email:        lead.email,
      phone:        lead.phone,
      service:      lead.service,
      message:      lead.message,
      source:       'contact_form',
      submitted_at: lead.submitted_at,
    }]);
    if (error) console.error('Supabase lead insert error:', error.message);

    // Always keep localStorage copy as fallback
    const leads = JSON.parse(localStorage.getItem('nplawn_leads') || '[]');
    leads.push({ ...form, submittedAt: Date.now() });
    localStorage.setItem('nplawn_leads', JSON.stringify(leads));

    setSubmitted(true);
  };

  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="page-hero-badge">Get in Touch</div>
        <h1>Let's Talk About<br/>Your Lawn</h1>
        <p>Fill out the form below and we'll get back to you within one business day. No sales pressure — just honest advice.</p>
      </section>

      {/* CONTACT SECTION */}
      <section className="pg-section white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12">

          {/* Info Column */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="pg-label">Direct Contact</p>
              <h2 className="text-np-dark text-2xl font-bold mb-6">We'd Love to Hear From You</h2>
            </div>

            {[
              { icon: <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z"/>, label: 'Phone', value: '(630) 555-0198' },
              { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, label: 'Email', value: 'hello@nplawn.com' },
              { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>, label: 'Service Area', value: 'Naperville & Chicagoland suburbs' },
            ].map(c => (
              <div key={c.label} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-np-lite/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 stroke-np-green fill-none stroke-2" viewBox="0 0 24 24">{c.icon}</svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-np-accent tracking-widest uppercase">{c.label}</div>
                  <div className="text-np-dark font-medium">{c.value}</div>
                </div>
              </div>
            ))}

            <div className="bg-np-surface rounded-2xl p-5 border border-np-border">
              <div className="font-bold text-np-dark mb-1">Office Hours</div>
              <div className="text-np-muted text-sm space-y-1">
                <p>Mon – Fri: 7:00 AM – 6:00 PM</p>
                <p>Saturday: 8:00 AM – 3:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-np-surface rounded-2xl border border-np-border">
                <div className="w-16 h-16 rounded-full bg-np-accent/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 stroke-np-accent fill-none stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 className="text-np-dark text-2xl font-bold mb-2">Message Received!</h3>
                <p className="text-np-muted">We'll be in touch within one business day. Thanks for reaching out!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" type="text" required value={form.name}
                      onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email}
                      onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={form.phone}
                      onChange={e => set('phone', e.target.value)} placeholder="(630) 555-0100" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Interested In</label>
                    <select className="form-input" value={form.service} onChange={e => set('service', e.target.value)}>
                      <option value="">Select a service…</option>
                      {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-textarea" rows={5} required value={form.message}
                    onChange={e => set('message', e.target.value)}
                    placeholder="Tell us about your lawn — size, current issues, or what you're looking to achieve." />
                </div>
                {contactError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {contactError}
                  </p>
                )}
                <button type="submit" className="btn-primary w-full text-center py-3 text-base">
                  Send Message
                </button>
                <p className="text-np-muted/70 text-xs text-center">
                  We typically respond within 1 business day. Your information is never shared.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
