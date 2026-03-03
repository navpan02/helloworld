import { Link } from 'react-router-dom';

const PLANS = [
  {
    key: 'basic',
    name: 'GrassBasic',
    tagline: 'Essential seasonal care',
    color: 'bg-np-lite/30 border-np-border',
    accent: 'text-np-green',
    rounds: 6,
    features: [
      '6 applications per year',
      'Spring & fall fertilization',
      'Broadleaf weed control',
      'Pre-emergent crabgrass prevention',
      'Grub prevention (optional add-on)',
      'Soil pH testing annually',
    ],
    cta: 'Select GrassBasic',
  },
  {
    key: 'pro',
    name: 'GrassPro',
    tagline: 'Complete year-round care',
    color: 'bg-np-dark border-np-green',
    accent: 'text-np-lite',
    dark: true,
    badge: 'Most Popular',
    rounds: 7,
    features: [
      '7 applications per year',
      'Everything in GrassBasic',
      'Targeted spot weed treatments',
      'Insect surface control',
      'Lime application as needed',
      'Priority scheduling',
      'Annual lawn health report',
    ],
    cta: 'Select GrassPro',
  },
  {
    key: 'natural',
    name: 'GrassNatural',
    tagline: '100% organic treatments',
    color: 'bg-np-lite/30 border-np-border',
    accent: 'text-np-green',
    rounds: 6,
    features: [
      '6 organic applications per year',
      'OMRI-certified inputs only',
      'Compost top-dressing',
      'Seaweed & kelp micronutrients',
      'Mycorrhizal inoculants',
      'Safe for kids & pets immediately',
      'Soil biology report',
    ],
    cta: 'Select GrassNatural',
  },
];

const FAQ = [
  { q: 'Are there contracts?', a: 'No long-term contracts required. You can adjust or cancel your plan with 30 days notice.' },
  { q: 'When do applications happen?', a: 'Applications are scheduled seasonally based on soil temperature and growth stage — not calendar dates. We notify you 48 hours before each visit.' },
  { q: 'Is the GrassNatural program safe for pets?', a: 'Yes. OMRI-certified organic products are safe for children and pets within 2 hours of drying — typically same-day re-entry.' },
  { q: 'Can I switch plans?', a: 'Absolutely. You can upgrade or downgrade your plan at any time with 30 days notice before your next application cycle.' },
];

export default function LawnCare() {
  return (
    <>
      <section className="page-hero" id="plans">
        <div className="page-hero-badge">Lawn Care Plans</div>
        <h1>Science-Based Lawn Care<br/>in 3 Programs</h1>
        <p>GrassBasic, GrassPro, or GrassNatural — each designed for a different level of investment and environmental commitment. All backed by certified horticulturalists.</p>
      </section>

      {/* PLANS */}
      <section className="pg-section white">
        <p className="pg-label">Choose Your Program</p>
        <h2 className="pg-title">Lawn Care Plans</h2>
        <p className="pg-sub mb-10">All plans include a detailed service report after every visit. Pricing is annual based on your property size.</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.key}
              className={`rounded-2xl p-8 border-2 flex flex-col ${p.color} ${p.dark ? 'text-white' : ''}`}>
              {p.badge && (
                <div className="inline-block text-xs font-bold tracking-[1.5px] uppercase px-3 py-1 rounded-full bg-np-accent text-np-dark mb-3 self-start">
                  {p.badge}
                </div>
              )}
              <div className={`text-2xl font-extrabold mb-1 ${p.dark ? 'text-white' : 'text-np-dark'}`}>{p.name}</div>
              <div className={`text-sm mb-6 ${p.dark ? 'text-white/60' : 'text-np-muted'}`}>{p.tagline}</div>
              <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${p.dark ? 'text-white/40' : 'text-np-muted'}`}>
                {p.rounds} applications / year
              </div>
              <ul className="space-y-2.5 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex gap-2.5 text-sm">
                    <svg className={`w-4 h-4 fill-none stroke-2 flex-shrink-0 mt-0.5 ${p.dark ? 'stroke-np-lite' : 'stroke-np-accent'}`} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className={p.dark ? 'text-white/80' : 'text-np-text'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/order" className={`mt-8 text-center py-3 rounded-full font-bold text-sm transition-all ${
                p.dark
                  ? 'bg-np-accent text-np-dark hover:bg-np-lite'
                  : 'border-2 border-np-green text-np-green hover:bg-np-green hover:text-white'
              }`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">Common Questions</p>
        <h2 className="pg-title">Frequently Asked Questions</h2>
        <div className="max-w-2xl mt-8 space-y-5">
          {FAQ.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-np-border shadow-np">
              <div className="font-bold text-np-dark mb-2">{f.q}</div>
              <p className="text-np-muted text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Not Sure Which Plan Is Right for You?</h2>
        <p>We'll walk you through the options based on your soil, your yard, and your lifestyle.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Talk to Our Team</Link>
      </section>
    </>
  );
}
