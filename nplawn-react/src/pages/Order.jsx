import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { validateName, validateEmail, validatePhone } from '../utils/validate';

const PLANS = {
  Basic: {
    label: 'GrassBasic',
    desc: 'Essential seasonal care',
    rounds: 6,
    badge: 'Essential',
    badgeColor: 'bg-np-lite/30 text-np-green',
    tiers: [
      { max: 1000, rate: 0.11 },
      { max: 5000, rate: 0.099 },
      { max: Infinity, rate: 0.088 },
    ],
  },
  Standard: {
    label: 'GrassPro',
    desc: 'Complete year-round care',
    rounds: 7,
    badge: 'Popular',
    badgeColor: 'bg-np-accent text-np-dark',
    tiers: [
      { max: 1000, rate: 0.22 },
      { max: 5000, rate: 0.198 },
      { max: Infinity, rate: 0.176 },
    ],
  },
  Premium: {
    label: 'GrassNatural',
    desc: '100% organic treatments',
    rounds: 6,
    badge: 'Organic',
    badgeColor: 'bg-green-100 text-green-700',
    tiers: [
      { max: 1000, rate: 0.30 },
      { max: 5000, rate: 0.27 },
      { max: Infinity, rate: 0.25 },
    ],
  },
};

function calcTotal(planKey, sqft) {
  if (!sqft || sqft <= 0) return 0;
  const plan = PLANS[planKey];
  let total = 0;
  let remaining = sqft;
  let prev = 0;
  for (const tier of plan.tiers) {
    const chunk = Math.min(remaining, tier.max - prev);
    if (chunk <= 0) break;
    total += chunk * tier.rate;
    remaining -= chunk;
    prev = tier.max;
    if (remaining <= 0) break;
  }
  return Math.round(total);
}

const STEPS = ['Plan', 'Details', 'Review', 'Confirm'];

export default function Order() {
  const [step, setStep]         = useState(0);
  const [plan, setPlan]         = useState('Standard');
  const [sqft, setSqft]         = useState('');
  const [form, setForm]         = useState({ name: '', email: '', phone: '', address: '', city: '', zip: '', notes: '' });
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', phone: '' });
  const [orderId, setOrderId]   = useState('');
  const { user }                = useAuth();

  useEffect(() => {
    if (user && !form.email) {
      setForm(f => ({ ...f, email: user.email || '' }));
    }
  }, [user]);

  const total    = calcTotal(plan, Number(sqft));
  const avgPerApp = total && PLANS[plan].rounds ? Math.round(total / PLANS[plan].rounds) : 0;
  const planObj  = PLANS[plan];

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFieldErrors(e => ({ ...e, [k]: '' })); };
  const blurField = (k, v) => {
    const validators = { name: validateName, email: validateEmail, phone: validatePhone };
    if (validators[k]) setFieldErrors(e => ({ ...e, [k]: validators[k](v) }));
  };
  const validateStep1 = () => {
    const errs = { name: validateName(form.name), email: validateEmail(form.email), phone: validatePhone(form.phone) };
    setFieldErrors(errs);
    return !errs.name && !errs.email && !errs.phone;
  };

  const submitOrder = async () => {
    const id = 'NPL-' + Date.now().toString().slice(-6);
    setOrderId(id);
    const orderData = {
      id,
      plan: planObj.label,
      sqft: Number(sqft),
      total,
      avg_per_app: avgPerApp,
      rounds: planObj.rounds,
      customer_name: form.name,
      customer_email: form.email || null,
      customer_phone: form.phone || null,
      customer_address: form.address,
      customer_city: form.city,
      customer_zip: form.zip,
      customer_notes: form.notes || null,
      submitted_at: new Date().toISOString(),
      submittedAt: Date.now(),
      customer: {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address,
        city: form.city,
        zip: form.zip,
      },
    };

    // Save to localStorage immediately and advance to confirmation
    const orders = JSON.parse(localStorage.getItem('nplawn_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('nplawn_orders', JSON.stringify(orders));
    setStep(3);

    // Fire-and-forget Supabase insert
    if (supabase) {
      supabase.from('orders').insert(orderData)
        .then(({ error }) => { if (error) console.error('Supabase insert error:', error.message); })
        .catch(err => console.error('Supabase insert error:', err));
    }
  };

  return (
    <div className="min-h-screen bg-np-surface">
      {/* Header */}
      <div className="bg-np-dark text-white px-[5%] py-10 text-center">
        <div className="page-hero-badge">Get a Quote</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Choose Your Lawn Care Plan</h1>
        <p className="text-white/60">Annual pricing based on your property size. No contracts required.</p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mt-8 max-w-md mx-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                i <= step ? 'bg-np-accent text-np-dark' : 'bg-white/20 text-white/50'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ml-1 hidden sm:block ${i <= step ? 'text-np-lite' : 'text-white/40'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-2 ${i < step ? 'bg-np-accent' : 'bg-white/20'}`}/>}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-[5%] py-10">
        {/* STEP 0: PLAN SELECTION */}
        {step === 0 && (
          <div>
            <h2 className="text-np-dark text-2xl font-bold mb-6">Choose a Plan</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {Object.entries(PLANS).map(([key, p]) => (
                <div key={key}
                  onClick={() => setPlan(key)}
                  className={`plan-card cursor-pointer ${plan === key ? 'selected' : ''}`}>
                  <div className={`plan-badge text-xs font-bold tracking-wide ${p.badgeColor}`}>{p.badge}</div>
                  <h3 className="text-np-dark text-xl font-extrabold mb-1">{p.label}</h3>
                  <p className="text-np-muted text-sm mb-4">{p.desc}</p>
                  <div className="text-xs text-np-muted/70 mb-4">{p.rounds} applications / year</div>

                  {/* Sqft input on this card */}
                  {plan === key && (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-np-dark mb-1">Lawn Size (sq ft)</label>
                      <input type="number" value={sqft} onChange={e => setSqft(e.target.value)}
                        min={500} max={99999} placeholder="e.g. 4000"
                        className="form-input text-sm"
                        onClick={e => e.stopPropagation()} />
                      {total > 0 && (
                        <div className="mt-3 bg-np-surface rounded-xl p-4 border border-np-border">
                          <div className="flex justify-between items-center">
                            <span className="text-np-muted text-sm">Annual Total</span>
                            <span className="text-np-dark font-extrabold text-xl">${total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-np-muted text-xs">Avg per application</span>
                            <span className="text-np-accent font-semibold text-sm">${avgPerApp}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button disabled={!sqft || total === 0}
                onClick={() => setStep(1)}
                className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: CUSTOMER DETAILS */}
        {step === 1 && (
          <div>
            <h2 className="text-np-dark text-2xl font-bold mb-6">Your Information</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className={`form-input ${fieldErrors.name ? 'border-red-400' : ''}`} type="text" value={form.name}
                  onChange={e => set('name', e.target.value)} onBlur={e => blurField('name', e.target.value)}
                  placeholder="Jane Smith" maxLength={50} />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                <p className="mt-1 text-xs text-np-muted text-right">{form.name.length}/50</p>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className={`form-input ${fieldErrors.email ? 'border-red-400' : ''}`} type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} onBlur={e => blurField('email', e.target.value)}
                  placeholder="jane@example.com" />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className={`form-input ${fieldErrors.phone ? 'border-red-400' : ''}`} type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)} onBlur={e => blurField('phone', e.target.value)}
                  placeholder="(630) 555-0100" />
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input className="form-input" type="text" required value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" type="text" required value={form.city} onChange={e => set('city', e.target.value)} placeholder="Naperville" />
              </div>
              <div className="form-group">
                <label className="form-label">ZIP Code *</label>
                <input className="form-input" type="text" required value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="60540" />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Gate code, special instructions, current lawn concerns…" />
              </div>
            </div>
            <div className="flex justify-between mt-8 max-w-2xl">
              <button onClick={() => setStep(0)} className="btn-outline px-6 py-2.5">← Back</button>
              <button
                disabled={!form.address || !form.city || !form.zip}
                onClick={() => { if (validateStep1()) setStep(2); }}
                className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW */}
        {step === 2 && (
          <div className="max-w-xl">
            <h2 className="text-np-dark text-2xl font-bold mb-6">Review Your Order</h2>
            <div className="bg-white rounded-2xl border border-np-border shadow-np overflow-hidden">
              <div className="bg-np-dark text-white px-6 py-4">
                <div className="text-xs tracking-widest uppercase text-np-lite/70 mb-1">Selected Plan</div>
                <div className="text-2xl font-extrabold">{planObj.label}</div>
                <div className="text-white/60 text-sm">{planObj.desc}</div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Property Size', `${Number(sqft).toLocaleString()} sq ft`],
                  ['Applications/Year', planObj.rounds.toString()],
                  ['Avg per Application', `$${avgPerApp}`],
                  ['Customer', form.name],
                  ['Email', form.email],
                  ['Phone', form.phone],
                  ['Address', `${form.address}, ${form.city} ${form.zip}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-np-muted">{label}</span>
                    <span className="font-medium text-np-dark">{val}</span>
                  </div>
                ))}
                <div className="border-t border-np-border pt-3 flex justify-between">
                  <span className="font-bold text-np-dark">Annual Price</span>
                  <span className="font-extrabold text-np-dark text-xl">${total.toLocaleString()} <span className="text-sm font-normal text-np-muted">/yr</span></span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-outline px-6 py-2.5">← Back</button>
              <button onClick={submitOrder} className="btn-primary px-8 py-3 text-base">Confirm Order →</button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 3 && (
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="w-20 h-20 rounded-full bg-np-accent/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 stroke-np-accent fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-np-dark text-3xl font-extrabold mb-2">Order Received!</h2>
            <p className="text-np-muted mb-6">Your order <strong className="text-np-dark">{orderId}</strong> has been submitted. We'll contact you within 1 business day to confirm scheduling.</p>

            <div className="bg-white rounded-2xl border border-np-border shadow-np p-6 text-left mb-8">
              <div className="text-xs font-bold tracking-widest uppercase text-np-accent mb-4">Order Summary</div>
              {[
                ['Plan', planObj.label],
                ['Property Size', `${Number(sqft).toLocaleString()} sq ft`],
                ['Applications/Year', planObj.rounds.toString()],
                ['Avg per Application', `$${avgPerApp}`],
                ['Annual Price', `$${total.toLocaleString()} /yr`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm py-1.5 border-b border-np-border last:border-0">
                  <span className="text-np-muted">{l}</span>
                  <span className="font-semibold text-np-dark">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/" className="btn-primary px-6 py-3">Back to Home</Link>
              <Link to="/contact" className="btn-outline px-6 py-3">Contact Us</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
