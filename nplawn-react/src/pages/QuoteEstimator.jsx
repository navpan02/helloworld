import { useState } from 'react';
import { Link } from 'react-router-dom';

const PLANS = {
  Basic: {
    label: 'GrassBasic',
    desc: 'Essential seasonal care — fertilization, weed control, and spot treatments.',
    rounds: 6,
    badge: 'Essential',
    badgeColor: 'bg-np-lite/30 text-np-green',
    tiers: [
      { max: 1000, rate: 0.10 },
      { max: 5000, rate: 0.09 },
      { max: Infinity, rate: 0.08 },
    ],
    includes: ['6 applications/year', 'Fertilization', 'Broadleaf weed control', 'Spot treatments'],
  },
  Standard: {
    label: 'GrassPro',
    desc: 'Complete year-round care with enhanced weed, grub, and disease management.',
    rounds: 7,
    badge: 'Most Popular',
    badgeColor: 'bg-np-accent text-np-dark',
    tiers: [
      { max: 1000, rate: 0.20 },
      { max: 5000, rate: 0.18 },
      { max: Infinity, rate: 0.16 },
    ],
    includes: ['7 applications/year', 'All GrassBasic features', 'Grub prevention', 'Disease management', 'Crabgrass pre-emergent'],
  },
  Premium: {
    label: 'GrassNatural',
    desc: '100% organic treatments — safe for kids, pets, and pollinators.',
    rounds: 6,
    badge: 'Organic',
    badgeColor: 'bg-green-100 text-green-700',
    tiers: [
      { max: 1000, rate: 0.30 },
      { max: 5000, rate: 0.27 },
      { max: Infinity, rate: 0.25 },
    ],
    includes: ['6 applications/year', 'Zero synthetic chemicals', 'Organic fertilizers', 'Natural weed suppression', 'Safe for kids & pets'],
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

const PRESETS = [
  { label: 'Small yard', sqft: 2500 },
  { label: 'Average yard', sqft: 5000 },
  { label: 'Large yard', sqft: 10000 },
  { label: 'Estate', sqft: 20000 },
];

export default function QuoteEstimator() {
  const [plan, setPlan] = useState('Standard');
  const [sqft, setSqft] = useState('');

  const sqftNum = Number(sqft);
  const total = calcTotal(plan, sqftNum);
  const planObj = PLANS[plan];
  const avgPerApp = total && planObj.rounds ? Math.round(total / planObj.rounds) : 0;
  const perMonth = total ? Math.round(total / 12) : 0;

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-icon mx-auto mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 stroke-np-lite fill-none stroke-[1.5]" viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div className="page-hero-badge">Instant Pricing</div>
        <h1>Quote Estimator</h1>
        <p>Get an instant price estimate for your property. No form submission, no sales call — just real numbers.</p>
      </section>

      <section className="pg-section white">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: inputs */}
            <div>
              <p className="pg-label">Step 1</p>
              <h2 className="text-np-dark text-2xl font-bold mb-6">Choose a Plan</h2>

              <div className="space-y-3 mb-8">
                {Object.entries(PLANS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setPlan(key)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                      plan === key
                        ? 'border-np-accent bg-np-lite/5'
                        : 'border-np-border hover:border-np-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-np-dark">{p.label}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                    </div>
                    <p className="text-np-muted text-sm">{p.desc}</p>
                    <ul className="mt-2 space-y-0.5">
                      {p.includes.map(item => (
                        <li key={item} className="text-xs text-np-muted flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 fill-np-accent flex-shrink-0" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"/>
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <p className="pg-label">Step 2</p>
              <h2 className="text-np-dark text-2xl font-bold mb-4">Enter Your Lawn Size</h2>

              <div className="flex gap-2 flex-wrap mb-4">
                {PRESETS.map(p => (
                  <button
                    key={p.sqft}
                    onClick={() => setSqft(String(p.sqft))}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      sqft === String(p.sqft)
                        ? 'bg-np-accent text-np-dark border-np-accent'
                        : 'border-np-border text-np-muted hover:border-np-accent'
                    }`}
                  >
                    {p.label} (~{p.sqft.toLocaleString()} sq ft)
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Exact Lawn Size (sq ft)</label>
                <input
                  type="number"
                  className="form-input text-lg"
                  value={sqft}
                  onChange={e => setSqft(e.target.value)}
                  min={500}
                  max={99999}
                  placeholder="e.g. 4500"
                />
                <p className="text-np-muted text-xs mt-1.5">Not sure? Use Google Maps satellite view to estimate, or we can measure during our free assessment.</p>
              </div>
            </div>

            {/* Right: results */}
            <div className="lg:sticky lg:top-24">
              {total > 0 ? (
                <div className="bg-np-dark rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-5 border-b border-white/10">
                    <div className="text-np-lite text-xs font-bold tracking-widest uppercase mb-1">Your Estimate</div>
                    <div className="text-white text-4xl font-black">${total.toLocaleString()}</div>
                    <div className="text-white/50 text-sm">per year · {planObj.rounds} applications</div>
                  </div>

                  <div className="px-6 py-5 space-y-3 border-b border-white/10">
                    {[
                      ['Plan', planObj.label],
                      ['Property Size', `${sqftNum.toLocaleString()} sq ft`],
                      ['Applications / Year', planObj.rounds],
                      ['Avg per Application', `$${avgPerApp}`],
                      ['Monthly Equivalent', `$${perMonth}/mo`],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-white/50">{label}</span>
                        <span className="text-white font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-5 space-y-3">
                    <Link
                      to={`/order`}
                      className="btn-primary w-full text-center block text-base py-3"
                    >
                      Order This Plan &rarr;
                    </Link>
                    <Link to="/contact" className="block text-center text-np-lite/70 text-sm hover:text-np-lite transition-colors">
                      Have questions first? Contact us
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-np-surface rounded-2xl border border-np-border p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-np-border/50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 stroke-np-muted fill-none stroke-[1.5]" viewBox="0 0 24 24">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-np-dark mb-2">Enter your lawn size</h3>
                  <p className="text-np-muted text-sm">Select a plan and enter your square footage above to see your instant price estimate.</p>
                </div>
              )}

              <div className="mt-4 bg-np-lite/10 border border-np-lite/30 rounded-xl p-4">
                <p className="text-np-green text-xs font-semibold mb-1">No contracts · No surprises</p>
                <p className="text-np-muted text-xs">This is your exact annual price. We don't add fees at billing. Cancel before renewal with no penalty.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pg-section" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="pg-label">How Pricing Works</p>
          <h2 className="pg-title">Tiered Rates by Property Size</h2>
          <p className="pg-sub mb-10">Larger properties get a lower rate per square foot. Here's how each plan breaks down.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-np-dark text-white">
                  <th className="px-4 py-3 text-left rounded-tl-xl">Property Size</th>
                  {Object.values(PLANS).map(p => (
                    <th key={p.label} className="px-4 py-3 text-center last:rounded-tr-xl">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { range: 'Up to 1,000 sq ft', rates: ['$0.10/sqft', '$0.20/sqft', '$0.30/sqft'] },
                  { range: '1,001–5,000 sq ft', rates: ['$0.09/sqft', '$0.18/sqft', '$0.27/sqft'] },
                  { range: '5,001+ sq ft', rates: ['$0.08/sqft', '$0.16/sqft', '$0.25/sqft'] },
                ].map((row, i) => (
                  <tr key={row.range} className={i % 2 === 0 ? 'bg-white' : 'bg-np-surface'}>
                    <td className="px-4 py-3 font-medium text-np-dark">{row.range}</td>
                    {row.rates.map(r => (
                      <td key={r} className="px-4 py-3 text-center text-np-muted">{r}</td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-np-lite/10">
                  <td className="px-4 py-3 font-semibold text-np-dark rounded-bl-xl">Applications / Year</td>
                  {Object.values(PLANS).map(p => (
                    <td key={p.label} className="px-4 py-3 text-center font-semibold text-np-dark last:rounded-br-xl">{p.rounds}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Place your order online in minutes. Our team will confirm your schedule within 1 business day.</p>
        <Link to="/order" className="btn-primary text-base px-8 py-4">Order Now &rarr;</Link>
      </section>
    </>
  );
}
