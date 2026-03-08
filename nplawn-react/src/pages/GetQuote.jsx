import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SERVICES = [
  'Lawn Care Plan (GrassBasic)',
  'Lawn Care Plan (GrassPro)',
  'Lawn Care Plan (GrassNatural)',
  'Lawn Mowing',
  'Tree Trimming',
  'Tree & Shrub Care',
  'Aeration & Seeding',
  'Landscape Design',
  'Not sure — need advice',
];

export default function GetQuote() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setError(''); setForm(f => ({ ...f, [k]: v })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError('Please provide your name and at least an email or phone number.');
      return;
    }
    setLoading(true);

    const lead = {
      name:         form.name.trim(),
      email:        form.email.trim() || null,
      phone:        form.phone.trim() || null,
      service:      form.service || null,
      message:      form.notes.trim() || null,
      source:       'get_quote',
      submitted_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabase.from('leads').insert([lead]);
    if (dbError) console.error('Supabase lead insert error:', dbError.message);

    const leads = JSON.parse(localStorage.getItem('nplawn_leads') || '[]');
    leads.push({ ...form, source: 'get_quote', submittedAt: Date.now() });
    localStorage.setItem('nplawn_leads', JSON.stringify(leads));

    setLoading(false);
    navigate('/quote/thanks', { state: { name: form.name } });
  };

  return (
    <div className="min-h-screen bg-np-surface">
      <div className="bg-np-dark text-white px-[5%] py-12 text-center">
        <div className="page-hero-badge">Free Quote</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Get Your Free Quote</h1>
        <p className="text-white/60 max-w-xl mx-auto">Fill in your details and we'll get back to you within 1 business day. No commitment required.</p>
      </div>

      <div className="max-w-xl mx-auto px-[5%] py-12">
        <div className="bg-white rounded-2xl border border-np-border shadow-np p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" type="text" required value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="(630) 555-0100" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Service Interested In</label>
              <select className="form-input" value={form.service} onChange={e => set('service', e.target.value)}>
                <option value="">Select a service…</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-textarea" rows={3} value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Describe your lawn, any current issues, preferred schedule…" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Sending…' : 'Request My Free Quote →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
