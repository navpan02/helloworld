import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { validateName, validateEmail, validatePhone } from '../utils/validate';

const SERVICES = [
  'Lawn Mowing',
  'Tree Trimming & Pruning',
  'Hedge Trimming',
  'Leaf Removal & Yard Cleanup',
  'Sod Installation',
  'Mulching',
  'Brush Clearing',
  'Stump Grinding / Removal',
  'Snow Removal',
  'Aeration & Seeding',
  'Irrigation System',
  'Landscaping & Garden Design',
  'Lawn Care Plan',
  'Tree & Shrub Care',
  'Other',
];

const FREQUENCIES = [
  { value: 'one_time',   label: 'One-time' },
  { value: 'weekly',     label: 'Weekly' },
  { value: 'biweekly',   label: 'Bi-weekly' },
  { value: 'monthly',    label: 'Monthly' },
  { value: 'quarterly',  label: 'Quarterly' },
];

const SQFT_OPTIONS = [
  'Under 2,000 sq ft',
  '2,000 – 5,000 sq ft',
  '5,000 – 10,000 sq ft',
  '10,000 – 20,000 sq ft',
  '20,000 – 43,560 sq ft (up to 1 acre)',
  'Over 1 acre',
];

function Field({ label, id, required, errors = {}, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>
      <input id={id}
        className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition-all ${
          errors[id] ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
        }`}
        {...rest} />
      {errors[id] && <p className="mt-1 text-xs text-red-600">{errors[id]}</p>}
    </div>
  );
}

export default function GetQuote() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', state: 'IL', zip: '',
    sqft: '',
    services: [],
    frequency: '',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => { setError(''); setFieldErrors(e => ({ ...e, [k]: '' })); setForm(f => ({ ...f, [k]: v })); };

  const toggleService = (s) => setForm(f => ({
    ...f,
    services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
  }));

  /* Step 1 validation */
  const validateStep1 = () => {
    const errs = {};
    const n = validateName(form.name);    if (n) errs.name = n;
    if (!form.email.trim()) errs.email = 'Email is required.';
    else { const em = validateEmail(form.email); if (em) errs.email = em; }
    if (!form.phone.trim()) errs.phone = 'Phone is required.';
    else { const ph = validatePhone(form.phone); if (ph) errs.phone = ph; }
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.address.trim()) errs.address = 'Address is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* Step 2 validation */
  const validateStep2 = () => {
    const errs = {};
    if (form.services.length === 0) errs.services = 'Select at least one service.';
    if (!form.frequency) errs.frequency = 'Choose a frequency.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    setError('');

    const lead = {
      name:         form.name.trim(),
      email:        form.email.trim(),
      phone:        form.phone.trim(),
      address:      form.address.trim(),
      city:         form.city.trim() || null,
      state:        form.state.trim() || null,
      zip:          form.zip.trim() || null,
      sqft:         form.sqft || null,
      services:     form.services,
      frequency:    form.frequency,
      message:      form.notes.trim() || null,
      source:       'get_quote',
      submitted_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabase.from('leads').insert([lead]);
    if (dbError) console.error('Supabase lead insert error:', dbError.message);

    // localStorage fallback
    const leads = JSON.parse(localStorage.getItem('nplawn_leads') || '[]');
    leads.push({ ...lead, submittedAt: Date.now() });
    localStorage.setItem('nplawn_leads', JSON.stringify(leads));

    setLoading(false);
    setSubmitted(true);
    setStep(3);
  };

  const STEP_LABELS = ['Property & Contact', 'Services & Frequency', 'Confirmation'];

  /* ========== STEP 3: CONFIRMATION ========== */
  if (submitted) {
    return (
      <div className="min-h-screen bg-np-surface flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 stroke-green-600 fill-none stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-np-dark text-3xl font-extrabold mb-3">You're all set, {form.name.split(' ')[0]}!</h1>
          <p className="text-np-muted text-base mb-3 leading-relaxed">
            We've received your quote request and will get back to you within <strong className="text-np-dark">1 business day</strong>.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-left mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Request Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="text-gray-800 font-medium">{form.name}</dd></div>
              {form.email && <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="text-gray-800">{form.email}</dd></div>}
              {form.phone && <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd className="text-gray-800">{form.phone}</dd></div>}
              <div className="flex justify-between"><dt className="text-gray-500">Address</dt><dd className="text-gray-800">{form.address}{form.city ? `, ${form.city}` : ''}</dd></div>
              {form.sqft && <div className="flex justify-between"><dt className="text-gray-500">Lot Size</dt><dd className="text-gray-800">{form.sqft}</dd></div>}
              <div><dt className="text-gray-500 mb-1">Services</dt><dd className="flex flex-wrap gap-1">{form.services.map(s => <span key={s} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s}</span>)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Frequency</dt><dd className="text-gray-800 capitalize">{form.frequency.replace('_', '-')}</dd></div>
            </dl>
          </div>
          <Link to="/" className="btn-primary px-8 py-3 text-base">Back to Home</Link>
        </div>
      </div>
    );
  }

  /* ========== STEPS 1 & 2 ========== */
  return (
    <div className="min-h-screen bg-np-surface">
      {/* Header */}
      <div className="bg-np-dark text-white px-[5%] py-12 text-center">
        <div className="page-hero-badge">Free Quote</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Get Your Free Quote</h1>
        <p className="text-white/60 max-w-xl mx-auto">Tell us about your property and the services you need. No commitment required.</p>
      </div>

      <div className="max-w-xl mx-auto px-[5%] py-10">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEP_LABELS.map((l, i) => (
            <div key={l} className="flex-1">
              <div className={`h-1.5 rounded-full ${i + 1 <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
              <p className={`text-xs mt-1.5 ${i + 1 === step ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{l}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-np-border shadow-np p-8">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          {/* STEP 1: Property & Contact */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Your Details</h2>
              <p className="text-sm text-gray-500 mb-4">Tell us who you are and where the property is.</p>

              <Field label="Full Name" id="name" required type="text" value={form.name} errors={fieldErrors}
                onChange={e => set('name', e.target.value)}
                onBlur={e => setFieldErrors(p => ({ ...p, name: validateName(e.target.value) }))}
                placeholder="Jane Smith" maxLength={50} />

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email" id="email" required type="email" value={form.email} errors={fieldErrors}
                  onChange={e => set('email', e.target.value)}
                  onBlur={e => setFieldErrors(p => ({ ...p, email: validateEmail(e.target.value) }))}
                  placeholder="jane@example.com" />
                <Field label="Phone" id="phone" required type="tel" value={form.phone} errors={fieldErrors}
                  onChange={e => set('phone', e.target.value)}
                  onBlur={e => setFieldErrors(p => ({ ...p, phone: validatePhone(e.target.value) }))}
                  placeholder="(630) 555-0100" />
              </div>

              <Field label="Street Address" id="address" required type="text" value={form.address} errors={fieldErrors}
                onChange={e => set('address', e.target.value)} placeholder="123 Main St" />

              <div className="grid grid-cols-3 gap-3">
                <Field label="City" id="city" type="text" value={form.city} errors={fieldErrors}
                  onChange={e => set('city', e.target.value)} placeholder="Chicago" />
                <Field label="State" id="state" type="text" value={form.state} errors={fieldErrors}
                  onChange={e => set('state', e.target.value)} placeholder="IL" />
                <Field label="ZIP" id="zip" type="text" value={form.zip} errors={fieldErrors}
                  onChange={e => set('zip', e.target.value)} placeholder="60601" />
              </div>
            </div>
          )}

          {/* STEP 2: Services & Frequency */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Services & Frequency</h2>
              <p className="text-sm text-gray-500 mb-2">Select the services you need and how often.</p>

              {/* Lot size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Size (sq ft)</label>
                <select value={form.sqft} onChange={e => set('sqft', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 bg-white">
                  <option value="">— Select approximate size —</option>
                  {SQFT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Services multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services Needed *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map(s => (
                    <button key={s} type="button" onClick={() => toggleService(s)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        form.services.includes(s)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
                {fieldErrors.services && <p className="mt-1 text-xs text-red-600">{fieldErrors.services}</p>}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCIES.map(f => (
                    <button key={f.value} type="button" onClick={() => set('frequency', f.value)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        form.frequency === f.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                {fieldErrors.frequency && <p className="mt-1 text-xs text-red-600">{fieldErrors.frequency}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={3} placeholder="Describe any issues, preferences, or special instructions…"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none" />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => { setStep(s => s - 1); setFieldErrors({}); }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium">← Back</button>
            ) : <span />}

            {step < 2 ? (
              <button onClick={goNext}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                {loading ? 'Submitting…' : 'Submit Quote Request →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
