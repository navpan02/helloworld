import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { validateName, validateEmail, validatePhone } from '../utils/validate';
import SeasonalBanner from '../components/SeasonalBanner';
import LawnDiagnosisWidget from '../components/LawnDiagnosisWidget';

// Map LawnCare plan keys → BuyNow plan keys
const PLAN_KEY_MAP = { basic: 'Basic', pro: 'Standard', natural: 'Premium' };

const PLANS = {
  Basic: {
    label: 'GrassBasic',
    desc: 'Essential seasonal care',
    rounds: 6,
    badge: 'Essential',
    badgeColor: 'bg-np-lite/30 text-np-green',
    benefits: [
      'Spring & fall fertilization',
      'Broadleaf weed control',
      'Pre-emergent crabgrass prevention',
      'Soil pH testing',
      'Grub prevention (optional add-on)',
    ],
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
    badge: 'Most Popular',
    badgeColor: 'bg-np-accent text-np-dark',
    benefits: [
      'Everything in GrassBasic',
      'Targeted spot weed treatments',
      'Insect surface control',
      'Lime application',
      'Priority scheduling',
      'Annual lawn health report',
    ],
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
    benefits: [
      'OMRI-certified inputs',
      'Compost top-dressing',
      'Seaweed & kelp micronutrients',
      'Mycorrhizal inoculants',
      'Safe for kids & pets',
      'Carbon-neutral service delivery',
    ],
    tiers: [
      { max: 1000, rate: 0.30 },
      { max: 5000, rate: 0.27 },
      { max: Infinity, rate: 0.25 },
    ],
  },
};

// GrassBasic rounds the user can select in Name Your Price mode
const BASIC_ROUNDS = [
  { id: 'spring_preemergent', label: 'Spring Pre-Emergent',     desc: 'Crabgrass prevention' },
  { id: 'spring_fert',        label: 'Spring Fertilization',    desc: 'Kickstart growth' },
  { id: 'summer_weed',        label: 'Summer Weed Control',     desc: 'Broadleaf + spot treatment' },
  { id: 'grub_prev',          label: 'Grub Prevention',         desc: 'Soil insect control' },
  { id: 'fall_fert',          label: 'Fall Fertilization',      desc: 'Root strengthening' },
  { id: 'late_fall_fert',     label: 'Late-Fall Fertilization', desc: 'Winter hardening' },
];

function calcTotal(planKey, sqft) {
  if (!sqft || sqft <= 0) return 0;
  const plan = PLANS[planKey];
  let total = 0, remaining = Number(sqft), prev = 0;
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

/**
 * Core Name Your Price algorithm.
 * Returns what a given budget buys for a given lawn size.
 */
function computeBudgetResult(budgetVal, sqftVal) {
  const b = Number(budgetVal);
  const s = Number(sqftVal);
  if (!b || b <= 0 || !s || s <= 0) return null;

  const naturalTotal = calcTotal('Premium', s);
  const proTotal     = calcTotal('Standard', s);
  const basicTotal   = calcTotal('Basic', s);

  if (b >= naturalTotal) return { type: 'full', planKey: 'Premium' };
  if (b >= proTotal)     return { type: 'full', planKey: 'Standard' };
  if (b >= basicTotal)   return { type: 'full', planKey: 'Basic' };

  const perRound       = basicTotal / PLANS.Basic.rounds;
  const affordableCount = Math.floor(b / perRound);
  const minimum        = Math.ceil(perRound * 2);

  if (affordableCount < 2) return { type: 'below_minimum', minimum, perRound };
  return { type: 'partial', affordableCount, perRound, basicTotal };
}

function loadLeaflet(cb) {
  if (window.L) { cb(); return; }
  if (!document.querySelector('#leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  if (!document.querySelector('#leaflet-js')) {
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = cb;
    document.head.appendChild(script);
  } else {
    // script tag exists but may still be loading
    const poll = setInterval(() => { if (window.L) { clearInterval(poll); cb(); } }, 100);
  }
}

function shoelaceAreaSqm(coords, centerLat) {
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    area += (coords[i].lon * coords[i + 1].lat) - (coords[i + 1].lon * coords[i].lat);
  }
  area = Math.abs(area) / 2;
  const metersPerDeg = 111320;
  return area * metersPerDeg * metersPerDeg * Math.cos(centerLat * Math.PI / 180);
}

const STEP_LABELS = ['Property Details', 'Map & Lawn Size', 'Select Plan', 'Review & Order'];

function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={`${className} fill-none stroke-current stroke-2`} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function BuyNow() {
  const [searchParams] = useSearchParams();
  const initialPlan = PLAN_KEY_MAP[searchParams.get('plan')] || 'Standard';

  // When returning from /lawn-diagnosis with ?plan=, restore sqft + address from
  // sessionStorage so the user lands on Step 2 (Select Plan) instead of Step 0.
  const _returningWithPlan = !!searchParams.get('plan');
  const _savedSqft    = _returningWithPlan ? sessionStorage.getItem('nplawn_buynow_sqft')    : null;
  const _savedAddress = _returningWithPlan ? sessionStorage.getItem('nplawn_buynow_address') : null;
  const _savedPlace   = _savedAddress ? (() => { try { return JSON.parse(_savedAddress); } catch { return null; } })() : null;

  const [step, setStep] = useState(_savedSqft ? 2 : 0);

  // Step 0
  const [addressInput, setAddressInput] = useState(_savedPlace?.display_name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(_savedPlace);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [fieldErrors0, setFieldErrors0] = useState({ phone: '', email: '' });

  // Step 1 — setSqft is wrapped to also persist to sessionStorage for diagnosis back-navigation
  const [sqft, _setSqft] = useState(_savedSqft || '');
  const [sqftSource, setSqftSource] = useState(_savedSqft ? 'Restored from previous session' : '');
  function setSqft(val) {
    _setSqft(val);
    sessionStorage.setItem('nplawn_buynow_sqft', val);
  }
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const mapDivRef = useRef(null);
  const leafletMapRef = useRef(null);

  // Step 2 — plan selection
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

  // Step 2 — Name Your Price mode
  const [planMode, setPlanMode]           = useState('choose'); // 'choose' | 'budget'
  const [budget, setBudget]               = useState('');
  const [checkedRounds, setCheckedRounds] = useState([]);       // selected BASIC_ROUNDS ids

  // Step 3 / Confirm
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [dbError, setDbError] = useState('');

  // Debounced Nominatim autocomplete
  useEffect(() => {
    if (selectedPlace || !addressInput || addressInput.length < 3) {
      if (!addressInput) setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressInput)}&format=json&addressdetails=1&limit=6&countrycodes=us`,
          { headers: { 'Accept-Language': 'en-US,en' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch { setSuggestions([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [addressInput, selectedPlace]);

  // Init Leaflet map when entering step 1
  useEffect(() => {
    if (step !== 1 || !selectedPlace) return;

    let cancelled = false;
    function initMap() {
      if (cancelled || !mapDivRef.current) return;
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
      const lat = parseFloat(selectedPlace.lat);
      const lon = parseFloat(selectedPlace.lon);
      const L = window.L;
      const map = L.map(mapDivRef.current, { zoomControl: true }).setView([lat, lon], 18);
      leafletMapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 20,
      }).addTo(map);
      L.circle([lat, lon], { color: '#52b788', fillColor: '#74c69d', fillOpacity: 0.25, radius: 22, weight: 2 }).addTo(map);
      const icon = L.divIcon({
        html: '<div style="background:#2d6a4f;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.45)"></div>',
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      });
      L.marker([lat, lon], { icon })
        .addTo(map)
        .bindPopup(`<b>${addressInput.split(',')[0]}</b><br/><small>${addressInput.split(',').slice(1, 3).join(',')}</small>`)
        .openPopup();
    }

    // Wait for DOM
    const waitForDom = setInterval(() => {
      if (mapDivRef.current) { clearInterval(waitForDom); loadLeaflet(initMap); }
    }, 80);

    return () => {
      cancelled = true;
      clearInterval(waitForDom);
      if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null; }
    };
  }, [step, selectedPlace]);

  async function estimateLawn(lat, lon) {
    setMapLoading(true);
    setMapError('');
    try {
      const query = `[out:json][timeout:15];(way["building"](around:80,${lat},${lon}););out geom;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
      const data = await res.json();
      if (data.elements?.length) {
        const el = data.elements[0];
        if (el.geometry?.length > 2) {
          const buildingSqm = shoelaceAreaSqm(el.geometry, lat);
          const lawnSqm = buildingSqm * 4.5 * 0.60;
          const raw = Math.round(lawnSqm * 10.7639);
          setSqft(String(Math.max(500, Math.min(raw, 25000))));
          setSqftSource('Estimated from building footprint data (OpenStreetMap)');
          return;
        }
      }
      // Fallback: bounding box
      const bbox = selectedPlace?.boundingbox;
      if (bbox) {
        const latD = Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[0]));
        const lonD = Math.abs(parseFloat(bbox[3]) - parseFloat(bbox[2]));
        const sqm = latD * lonD * 111320 * 111320 * Math.cos(lat * Math.PI / 180);
        const raw = Math.round(sqm * 10.7639 * 0.55);
        setSqft(String(Math.max(500, Math.min(raw, 20000))));
        setSqftSource('Estimated from parcel boundary data (OpenStreetMap)');
      } else {
        setSqft('3500');
        setSqftSource('Default estimate — adjust below if needed');
        setMapError('Could not auto-detect property size. Using a default — please adjust if needed.');
      }
    } catch {
      setSqft('3500');
      setSqftSource('Default estimate — adjust below if needed');
      setMapError('Auto-detection unavailable. Using a default estimate — please adjust if needed.');
    } finally {
      setMapLoading(false);
    }
  }

  function handleStep1Continue() {
    const errs = { phone: validatePhone(phone), email: validateEmail(email) };
    setFieldErrors0(errs);
    if (!selectedPlace) { setStep1Error('Please select an address from the suggestions.'); return; }
    if (!phone.trim() && !email.trim()) { setStep1Error('Please provide at least a phone number or email address.'); return; }
    if (errs.phone || errs.email) return;
    setStep1Error('');
    setStep(1);
    estimateLawn(parseFloat(selectedPlace.lat), parseFloat(selectedPlace.lon));
  }

  function selectSuggestion(place) {
    setAddressInput(place.display_name);
    setSelectedPlace(place);
    setSuggestions([]);
    setShowDropdown(false);
    // Persist address so diagnosis back-navigation can restore Step 2
    sessionStorage.setItem('nplawn_buynow_address', JSON.stringify(place));
    // Extract and persist zip code from Nominatim address details (Phase 1 — Seasonal Intelligence)
    const zip = place.address?.postcode?.split('-')[0];
    if (zip && /^\d{5}$/.test(zip)) {
      localStorage.setItem('nplawn_zip', zip);
    }
  }

  async function placeOrder() {
    const err = validateName(name);
    if (err) { setNameError(err); return; }
    const id = 'NPL-' + Date.now().toString().slice(-6);
    const isCustom   = selectedPlan === 'custom';
    const p          = isCustom ? PLANS.Basic : PLANS[selectedPlan];
    const orderTotal = isCustom ? (Number(budget) || 0) : calcTotal(selectedPlan, Number(sqft));
    const orderRounds = isCustom ? checkedRounds.length : p.rounds;
    const orderData = {
      id,
      plan:        isCustom ? 'custom' : p.label,
      ...(isCustom && {
        base_plan:       'GrassBasic',
        selected_rounds: checkedRounds.map(rid => BASIC_ROUNDS.find(r => r.id === rid)?.label).filter(Boolean),
      }),
      sqft:          Number(sqft),
      total:         orderTotal,
      avg_per_app:   Math.round(orderTotal / (orderRounds || 1)),
      rounds:        orderRounds,
      customer_name:    name,
      customer_email:   email || null,
      customer_phone:   phone || null,
      customer_address: addressInput,
      submitted_at:  new Date().toISOString(),
    };

    // Save to Supabase if configured
    if (supabase) {
      const { error } = await supabase.from('orders').insert(orderData);
      if (error) {
        console.error('Supabase insert error:', error);
        // Save locally so order isn't lost, then surface the error on this screen
        const orders = JSON.parse(localStorage.getItem('nplawn_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('nplawn_orders', JSON.stringify(orders));
        setDbError(`${error.message} (code: ${error.code})`);
        return; // stay on step 3 so user sees the error
      }
    }

    // Success — save locally and proceed
    const orders = JSON.parse(localStorage.getItem('nplawn_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('nplawn_orders', JSON.stringify(orders));

    setOrderId(id);
    setOrdered(true);
  }

  // ── CONFIRMATION SCREEN ────────────────────────────────────────────────────
  if (ordered) {
    const isCustom = selectedPlan === 'custom';
    const p = isCustom
      ? { ...PLANS.Basic, label: 'GrassBasic — Custom', rounds: checkedRounds.length }
      : PLANS[selectedPlan];
    const total  = isCustom ? (Number(budget) || 0) : calcTotal(selectedPlan, Number(sqft));
    const perApp = Math.round(total / (p.rounds || 1));
    const firstName = name.split(' ')[0];
    return (
      <div className="min-h-screen bg-np-surface flex flex-col items-center justify-center px-[5%] py-16">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-np-accent/20 border-2 border-np-accent/40 flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="w-12 h-12 stroke-np-accent" />
            </div>
            <h1 className="text-np-dark text-3xl md:text-4xl font-extrabold mb-3">
              Thank You{firstName ? `, ${firstName}` : ''}!
            </h1>
            <p className="text-np-muted text-base mb-2">
              Your order <strong className="text-np-dark font-bold">{orderId}</strong> has been received.
            </p>
            <p className="text-np-muted text-sm">
              You'll receive a confirmation {email ? 'email' : 'message'} within <strong className="text-np-dark">2 business hours</strong>.
              A lawn care specialist will visit your property within <strong className="text-np-dark">1–2 business days</strong> to do a complimentary assessment before your first service begins.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-np-border p-6 mb-6">
            <div className="text-xs font-bold tracking-widest uppercase text-np-accent mb-4">Order Summary</div>
            {[
              ['Order ID', orderId],
              ['Plan', p.label],
              ['Property Size', `~${Number(sqft).toLocaleString()} sq ft`],
              ['Applications / Year', String(p.rounds)],
              ['Per Application', `$${perApp}`],
              ['Annual Price', `$${total.toLocaleString()} / yr`],
              ['Billing', 'Invoice after each service'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm py-2 border-b border-np-border last:border-0">
                <span className="text-np-muted">{l}</span>
                <span className="font-semibold text-np-dark text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="bg-np-surface border border-np-border rounded-xl px-5 py-4 text-sm text-np-muted mb-8">
            <strong className="text-np-dark block mb-1">What happens next?</strong>
            A specialist from NPLawn will contact you at <strong className="text-np-dark">{email || phone}</strong> to confirm your schedule and answer any questions.
            No payment is needed today — you'll receive an invoice after each service visit.
          </div>

          {dbError && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-xs font-mono mb-6 break-all">
              <strong className="block mb-1">Supabase error (order saved locally only):</strong>
              {dbError}
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/" className="btn-primary px-6 py-3">Back to Home</Link>
            <Link to="/contact" className="btn-outline px-6 py-3">Contact Us</Link>
          </div>
        </div>
      </div>
    );
  }

  const isCustomPlan = selectedPlan === 'custom';
  const total = isCustomPlan ? (Number(budget) || 0) : calcTotal(selectedPlan, Number(sqft));
  const plan  = isCustomPlan
    ? { ...PLANS.Basic, label: 'GrassBasic — Custom', desc: `${checkedRounds.length} custom applications`, rounds: checkedRounds.length }
    : (PLANS[selectedPlan] || PLANS.Standard);

  // ── MAIN FLOW ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-np-surface">

      {/* Header */}
      <div className="bg-np-dark text-white px-[5%] py-10 text-center">
        <div className="page-hero-badge">Buy Now</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Get Started with NPLawn</h1>
        <p className="text-white/60">Sign up for a lawn care plan in just a few steps.</p>

        {/* Step indicator */}
        <div className="flex items-start justify-center mt-8 max-w-2xl mx-auto">
          {STEP_LABELS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  i < step ? 'bg-np-accent text-np-dark' :
                  i === step ? 'bg-np-accent text-np-dark ring-4 ring-np-accent/30' :
                  'bg-white/15 text-white/40'}`}>
                  {i < step ? <CheckIcon className="w-4 h-4 stroke-np-dark" /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block whitespace-nowrap ${i <= step ? 'text-np-lite' : 'text-white/30'}`}>{s}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-px flex-1 mx-2 mb-4 ${i < step ? 'bg-np-accent' : 'bg-white/15'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-[5%] py-10">

        {/* ── STEP 0: PROPERTY DETAILS ────────────────────────────────────── */}
        {step === 0 && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-np-dark text-2xl font-bold mb-2">Your Property Details</h2>
            <p className="text-np-muted text-sm mb-8">
              Enter your property address so we can calculate your lawn size and provide accurate pricing.
            </p>

            {/* Address with autocomplete */}
            <div className="form-group mb-5 relative">
              <label className="form-label">Property Address *</label>
              <input
                className="form-input"
                type="text"
                value={addressInput}
                onChange={e => { setAddressInput(e.target.value); setSelectedPlace(null); }}
                onFocus={() => suggestions.length && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                placeholder="123 Main St, Naperville, IL"
                autoComplete="off"
              />
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-np-border rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full text-left px-4 py-3 text-sm hover:bg-np-surface border-b border-np-border/50 last:border-0 transition-colors"
                      onMouseDown={() => selectSuggestion(s)}
                    >
                      <span className="font-medium text-np-dark block truncate">
                        {s.display_name.split(',').slice(0, 2).join(',')}
                      </span>
                      <span className="text-np-muted text-xs block truncate">
                        {s.display_name.split(',').slice(2, 5).join(',')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedPlace && (
                <div className="mt-1.5 flex items-center gap-1.5 text-np-accent text-xs font-medium">
                  <CheckIcon className="w-3.5 h-3.5 stroke-np-accent" />
                  Address confirmed
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="form-group mb-5">
              <label className="form-label">
                Phone Number
                <span className="text-np-muted font-normal ml-1">(required if no email)</span>
              </label>
              <input
                className={`form-input ${fieldErrors0.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setFieldErrors0(p => ({ ...p, phone: '' })); }}
                onBlur={e => setFieldErrors0(p => ({ ...p, phone: validatePhone(e.target.value) }))}
                placeholder="(630) 555-0100"
              />
              {fieldErrors0.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors0.phone}</p>}
            </div>

            {/* Email */}
            <div className="form-group mb-8">
              <label className="form-label">
                Email Address
                <span className="text-np-muted font-normal ml-1">(required if no phone)</span>
              </label>
              <input
                className={`form-input ${fieldErrors0.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors0(p => ({ ...p, email: '' })); }}
                onBlur={e => setFieldErrors0(p => ({ ...p, email: validateEmail(e.target.value) }))}
                placeholder="you@example.com"
              />
              {fieldErrors0.email && <p className="mt-1 text-xs text-red-600">{fieldErrors0.email}</p>}
            </div>

            {step1Error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
                {step1Error}
              </div>
            )}

            <button
              onClick={handleStep1Continue}
              className="btn-primary w-full py-4 text-base"
            >
              Continue — View Your Property on Map →
            </button>
          </div>
        )}

        {/* ── STEP 1: MAP & LAWN SIZE ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <SeasonalBanner nominatimAddress={selectedPlace?.address ?? null} />
            <h2 className="text-np-dark text-2xl font-bold mb-2">Your Property on the Map</h2>
            <p className="text-np-muted text-sm mb-6">
              We've located your property and estimated your lawn area using OpenStreetMap data. Adjust the size below if needed.
            </p>

            {/* Map container */}
            <div className="rounded-2xl overflow-hidden border border-np-border mb-6" style={{ height: 380 }}>
              {mapLoading && (
                <div className="h-full flex items-center justify-center bg-np-surface">
                  <div className="text-center">
                    <div className="w-10 h-10 border-[3px] border-np-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-np-muted text-sm">Loading map &amp; calculating lawn size…</p>
                  </div>
                </div>
              )}
              <div ref={mapDivRef} style={{ height: '100%', display: mapLoading ? 'none' : 'block' }} />
            </div>

            {mapError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm mb-5">
                {mapError}
              </div>
            )}

            {/* Sqft display + adjust */}
            <div className="bg-white border border-np-border rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-np-accent mb-1">Estimated Lawn Size</div>
                  <div className="text-5xl font-black text-np-dark leading-none">
                    {sqft ? Number(sqft).toLocaleString() : '—'}
                    <span className="text-base font-normal text-np-muted ml-2">sq ft</span>
                  </div>
                  {sqftSource && <p className="text-np-muted text-xs mt-2">{sqftSource}</p>}
                </div>
                <div>
                  <label className="form-label">Adjust if needed</label>
                  <input
                    className="form-input w-36 text-center text-lg font-bold"
                    type="number"
                    value={sqft}
                    onChange={e => setSqft(e.target.value)}
                    min={200}
                    max={99999}
                  />
                  <p className="text-np-muted text-xs mt-1 text-center">sq ft</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="btn-outline px-6 py-2.5">← Back</button>
              <button
                disabled={!sqft || Number(sqft) < 200}
                onClick={() => setStep(2)}
                className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                See Pricing Plans →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: PLAN SELECTION ──────────────────────────────────────── */}
        {step === 2 && (() => {
          const budgetResult = computeBudgetResult(budget, sqft);

          // Toggle a round in/out of the checked list (enforces affordableCount cap)
          function toggleRound(roundId) {
            setCheckedRounds(prev => {
              if (prev.includes(roundId)) return prev.filter(r => r !== roundId);
              if (budgetResult?.type === 'partial' && prev.length >= budgetResult.affordableCount) return prev;
              return [...prev, roundId];
            });
          }

          // Determine if Continue button should be enabled
          const canContinue = planMode === 'choose'
            || (budgetResult?.type === 'full')
            || (budgetResult?.type === 'partial' && checkedRounds.length >= 2);

          function handleContinue() {
            if (planMode === 'choose') { setStep(3); return; }
            if (budgetResult?.type === 'full') {
              setSelectedPlan(budgetResult.planKey);
              setStep(3);
            } else if (budgetResult?.type === 'partial' && checkedRounds.length >= 2) {
              setSelectedPlan('custom');
              setStep(3);
            }
          }

          return (
            <div>
              <h2 className="text-np-dark text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-np-muted text-sm mb-5">
                Pricing calculated for your <strong className="text-np-dark">{Number(sqft).toLocaleString()} sq ft</strong> lawn.
                Select the plan that fits your yard and budget.
              </p>

              {/* Mode tab toggle — sticky below navbar */}
              <div className="sticky top-16 z-40 -mx-[5%] px-[5%] pt-3 pb-3 bg-np-surface border-b border-np-border shadow-sm mb-5">
                <div className="flex gap-1 p-1 bg-white rounded-xl border border-np-border">
                  {[['choose', 'Choose a Plan'], ['budget', 'Name Your Price']].map(([mode, label]) => (
                    <button key={mode} type="button"
                      onClick={() => setPlanMode(mode)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        planMode === mode
                          ? 'bg-np-accent/15 text-np-dark shadow-sm border border-np-accent/30'
                          : 'text-np-muted hover:text-np-dark'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── CHOOSE A PLAN mode ── */}
              {planMode === 'choose' && (
                <>
                  <LawnDiagnosisWidget back="buynow" />
                  <SeasonalBanner nominatimAddress={selectedPlace?.address ?? null} />
                  <div className="grid lg:grid-cols-3 gap-5 mb-8">
                    {Object.entries(PLANS).map(([key, p]) => {
                      const planTotal = calcTotal(key, Number(sqft));
                      const perApp = Math.round(planTotal / p.rounds);
                      const isSelected = selectedPlan === key || (isCustomPlan && key === 'Basic');
                      return (
                        <div key={key} onClick={() => setSelectedPlan(key)}
                          className={`bg-white rounded-2xl border-2 cursor-pointer transition-all p-6 relative flex flex-col ${
                            isSelected ? 'border-np-accent shadow-[0_4px_24px_rgba(82,183,136,0.22)]' : 'border-np-border hover:border-np-accent/40'
                          }`}>
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-np-accent flex items-center justify-center">
                              <CheckIcon className="w-3.5 h-3.5 stroke-np-dark" />
                            </div>
                          )}
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 self-start ${p.badgeColor}`}>{p.badge}</span>
                          <h3 className="text-np-dark text-xl font-extrabold mb-1">{p.label}</h3>
                          <p className="text-np-muted text-sm mb-4">{p.desc}</p>
                          <div className="bg-np-surface rounded-xl p-4 mb-5">
                            <div className="text-3xl font-black text-np-dark">
                              ${planTotal.toLocaleString()}<span className="text-sm font-normal text-np-muted">/yr</span>
                            </div>
                            <div className="text-np-accent text-sm font-semibold mt-0.5">
                              ${perApp} per application × {p.rounds} visits
                            </div>
                          </div>
                          <ul className="space-y-2 mt-auto">
                            {p.benefits.map(b => (
                              <li key={b} className="flex items-start gap-2 text-sm text-np-muted">
                                <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0 stroke-np-accent" />{b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── NAME YOUR PRICE mode ── */}
              {planMode === 'budget' && (
                <div className="space-y-5 mb-8">

                  {/* Budget input + slider */}
                  <div className="bg-white rounded-2xl border border-np-border p-6">
                    <label className="block text-sm font-semibold text-np-dark mb-3">Your annual lawn care budget</label>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-np-muted font-bold text-lg">$</span>
                      <input
                        type="number"
                        min={0}
                        max={9999}
                        value={budget}
                        onChange={e => { setBudget(e.target.value); setCheckedRounds([]); }}
                        placeholder="e.g. 400"
                        className="w-36 px-3 py-2 text-lg font-bold text-np-dark border border-np-border rounded-lg outline-none focus:border-np-accent focus:ring-2 focus:ring-np-accent/20"
                      />
                      <span className="text-np-muted text-sm">/ year</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={calcTotal('Premium', Number(sqft)) + 100}
                      step={10}
                      value={Number(budget) || 0}
                      onChange={e => { setBudget(String(e.target.value)); setCheckedRounds([]); }}
                      className="w-full accent-np-accent"
                    />
                    <div className="flex justify-between text-xs text-np-muted mt-1">
                      <span>$0</span>
                      <span>GrassBasic ${calcTotal('Basic', Number(sqft)).toLocaleString()}</span>
                      <span>GrassNatural ${calcTotal('Premium', Number(sqft)).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* No budget entered yet */}
                  {!budget && (
                    <p className="text-center text-np-muted text-sm py-4">
                      Enter your budget above to see what your lawn care program includes.
                    </p>
                  )}

                  {/* Below minimum warning */}
                  {budget && budgetResult?.type === 'below_minimum' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex gap-3">
                      <svg className="w-5 h-5 flex-shrink-0 stroke-amber-600 fill-none stroke-2 mt-0.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Budget too low for a minimum program</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          A minimum of 2 applications is needed for results. Try <strong>${budgetResult.minimum.toLocaleString()}/yr</strong> to get started.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Full plan unlocked */}
                  {budget && budgetResult?.type === 'full' && (() => {
                    const p = PLANS[budgetResult.planKey];
                    const planTotal = calcTotal(budgetResult.planKey, Number(sqft));
                    const nextPlanKey = budgetResult.planKey === 'Basic' ? 'Standard' : budgetResult.planKey === 'Standard' ? 'Premium' : null;
                    const nextPlanTotal = nextPlanKey ? calcTotal(nextPlanKey, Number(sqft)) : null;
                    return (
                      <div>
                        <div className="bg-white rounded-2xl border-2 border-np-accent shadow-[0_4px_24px_rgba(82,183,136,0.22)] p-6 relative">
                          <div className="absolute top-4 right-4 bg-np-accent text-np-dark text-xs font-bold px-2.5 py-1 rounded-full">
                            Unlocked ✓
                          </div>
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 self-start ${p.badgeColor}`}>{p.badge}</span>
                          <h3 className="text-np-dark text-xl font-extrabold mb-1">{p.label}</h3>
                          <p className="text-np-muted text-sm mb-4">{p.desc}</p>
                          <div className="bg-np-surface rounded-xl p-4 mb-5">
                            <div className="text-3xl font-black text-np-dark">
                              ${planTotal.toLocaleString()}<span className="text-sm font-normal text-np-muted">/yr</span>
                            </div>
                            <div className="text-np-accent text-sm font-semibold mt-0.5">
                              ${Math.round(planTotal / p.rounds)} per application × {p.rounds} visits
                            </div>
                          </div>
                          <ul className="space-y-2">
                            {p.benefits.map(b => (
                              <li key={b} className="flex items-start gap-2 text-sm text-np-muted">
                                <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0 stroke-np-accent" />{b}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {nextPlanKey && (
                          <div className="mt-3 bg-np-surface border border-np-border rounded-xl px-4 py-3 text-sm text-np-muted">
                            <span className="font-semibold text-np-dark">Add ${(nextPlanTotal - Number(budget)).toLocaleString()}/yr</span>
                            {' '}to unlock <strong>{PLANS[nextPlanKey].label}</strong> — {PLANS[nextPlanKey].rounds} treatments/yr
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Partial plan — round picker */}
                  {budget && budgetResult?.type === 'partial' && (
                    <div>
                      <div className="bg-white rounded-2xl border border-np-border p-6">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-np-dark font-extrabold text-lg">GrassBasic — Partial</h3>
                          <span className="text-xs font-bold bg-np-surface border border-np-border text-np-muted px-2.5 py-1 rounded-full">
                            Custom
                          </span>
                        </div>
                        <p className="text-np-muted text-sm mb-4">
                          Your budget covers <strong className="text-np-dark">{budgetResult.affordableCount} of {BASIC_ROUNDS.length} applications</strong>.
                          Pick which {budgetResult.affordableCount} treatments to include.
                        </p>

                        <div className="space-y-2">
                          {BASIC_ROUNDS.map(round => {
                            const isChecked = checkedRounds.includes(round.id);
                            const atLimit   = !isChecked && checkedRounds.length >= budgetResult.affordableCount;
                            return (
                              <label key={round.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                  isChecked ? 'border-np-accent bg-np-accent/5' :
                                  atLimit   ? 'border-np-border bg-np-surface opacity-40 cursor-not-allowed' :
                                              'border-np-border hover:border-np-accent/40'
                                }`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={atLimit}
                                  onChange={() => toggleRound(round.id)}
                                  className="w-4 h-4 accent-np-accent flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-np-dark">{round.label}</p>
                                  <p className="text-xs text-np-muted">{round.desc}</p>
                                </div>
                                <span className="text-xs text-np-muted flex-shrink-0">
                                  ~${Math.round(budgetResult.perRound).toLocaleString()}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {checkedRounds.length < 2 && (
                          <p className="mt-3 text-xs text-amber-700 font-medium">
                            Select at least 2 treatments to continue.
                          </p>
                        )}
                      </div>

                      {/* Upgrade nudge */}
                      <div className="mt-3 bg-np-surface border border-np-border rounded-xl px-4 py-3 text-sm text-np-muted">
                        <span className="font-semibold text-np-dark">
                          Add ${(calcTotal('Basic', Number(sqft)) - Number(budget)).toLocaleString()}/yr
                        </span>
                        {' '}for the full <strong>GrassBasic</strong> program — {PLANS.Basic.rounds} treatments/yr
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-outline px-6 py-2.5">← Back</button>
                <button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Review →
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── STEP 3: REVIEW & PLACE ORDER ───────────────────────────────── */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-np-dark text-2xl font-bold mb-2">Review &amp; Place Your Order</h2>
            <p className="text-np-muted text-sm mb-8">
              Confirm your details below. Payment will be collected via invoice after each service visit — no payment required today.
            </p>

            {/* Name */}
            <div className="form-group mb-6">
              <label className="form-label">Your Full Name *</label>
              <input
                className={`form-input ${nameError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setNameError(''); }}
                onBlur={e => setNameError(validateName(e.target.value))}
                placeholder="Jane Smith"
                maxLength={50}
              />
              {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
              <p className="mt-1 text-xs text-np-muted text-right">{name.length}/50</p>
            </div>

            {/* Order summary card */}
            <div className="bg-white rounded-2xl border border-np-border overflow-hidden mb-6">
              <div className="bg-np-dark text-white px-6 py-4">
                <div className="text-xs tracking-widest uppercase text-np-lite/60 mb-0.5">Selected Plan</div>
                <div className="text-2xl font-extrabold">{plan.label}</div>
                <div className="text-white/50 text-sm">{plan.desc}</div>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Property Address', addressInput.split(',').slice(0, 3).join(',').trim()],
                  ['Estimated Lawn Size', `~${Number(sqft).toLocaleString()} sq ft`],
                  ['Applications / Year', String(plan.rounds)],
                  ['Per Application', `$${Math.round(total / (plan.rounds || 1))}`],
                  ...(email ? [['Email', email]] : []),
                  ...(phone ? [['Phone', phone]] : []),
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-np-muted flex-shrink-0">{l}</span>
                    <span className="font-medium text-np-dark text-right ml-4 max-w-[60%]">{v}</span>
                  </div>
                ))}
                {/* Show selected rounds for custom plan */}
                {isCustomPlan && checkedRounds.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-np-muted mb-2">Included treatments:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {checkedRounds.map(rid => {
                        const r = BASIC_ROUNDS.find(x => x.id === rid);
                        return r ? (
                          <span key={rid} className="text-xs bg-np-accent/15 text-np-dark font-medium px-2.5 py-1 rounded-full border border-np-accent/30">
                            {r.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <div className="border-t border-np-border pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-np-dark">Annual Total</span>
                  <span className="text-np-dark text-2xl font-extrabold">
                    ${total.toLocaleString()}
                    <span className="text-sm font-normal text-np-muted">/yr</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment notice */}
            <div className="bg-np-surface border border-np-border rounded-xl px-5 py-4 flex gap-3 mb-8">
              <svg className="w-5 h-5 flex-shrink-0 stroke-np-accent fill-none stroke-2 mt-0.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-np-muted">
                <strong className="text-np-dark">No payment today.</strong> You'll receive an invoice by email after each service visit.
                We accept credit card, ACH bank transfer, and check.
              </p>
            </div>

            {dbError && (
              <div className="bg-red-50 border-2 border-red-400 text-red-800 rounded-xl px-5 py-4 mb-6">
                <div className="font-bold text-sm mb-1">Supabase Error — order NOT saved to database:</div>
                <div className="font-mono text-xs break-all bg-red-100 rounded p-2 mb-3">{dbError}</div>
                <p className="text-xs text-red-700">Fix the error above (e.g. create the table in Supabase), then click <strong>Retry</strong>. Your order is saved locally in the meantime.</p>
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-outline px-6 py-2.5">← Back</button>
              <button
                onClick={() => { setDbError(''); placeOrder(); }}
                disabled={!name.trim()}
                className="btn-primary px-10 py-4 text-base font-extrabold shadow-[0_6px_20px_rgba(82,183,136,0.38)]"
              >
                {dbError ? 'Retry →' : 'Place Order →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
