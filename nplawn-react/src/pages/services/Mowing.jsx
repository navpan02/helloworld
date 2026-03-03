import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'The One-Third Rule', desc: 'We never cut more than one-third of the grass blade in a single visit. This prevents stress, root damage, and browning — and it\'s why our lawns stay green even in summer.' },
  { title: 'Sharp Blade Standard', desc: 'Dull blades tear grass and invite disease. We sharpen or replace blades regularly to ensure clean, precise cuts every time.' },
  { title: 'Edging & Cleanup Included', desc: 'Every visit includes edging along walkways, driveways, and beds, plus cleanup of clippings from hard surfaces. No extra charge.' },
  { title: 'Consistent Scheduling', desc: 'Weekly or bi-weekly service, with real-time notifications before we arrive. Same crew, same standards, every visit.' },
];

const PLANS = [
  { name: 'Weekly Mowing', price: 'From $45', desc: 'Ideal for fast-growing seasons or properties that need a consistently manicured look.' },
  { name: 'Bi-Weekly Mowing', price: 'From $65', desc: 'A cost-effective option for most residential properties during shoulder seasons.' },
  { name: 'Seasonal Package', price: 'Custom', desc: 'Pre-paid seasonal plan with priority scheduling and a locked-in rate.' },
];

export default function Mowing() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Mowing</div>
        <h1>Professional Lawn<br/>Mowing Services</h1>
        <p>Precise, consistent mowing that follows best-practice turf science. Every cut is clean, every edge is sharp, and your lawn looks great when we're done.</p>
      </section>

      <section className="pg-section white">
        <p className="pg-label">Our Standards</p>
        <h2 className="pg-title">What Makes Our Mowing Different</h2>
        <div className="service-grid mt-8">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-np-surface rounded-2xl p-6 border border-np-border">
              <h3 className="text-np-dark font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">Pricing</p>
        <h2 className="pg-title">Mowing Options</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {PLANS.map(p => (
            <div key={p.name} className="bg-white rounded-2xl p-6 border border-np-border shadow-np">
              <div className="text-np-accent font-bold text-2xl mb-1">{p.price}</div>
              <div className="font-bold text-np-dark text-lg mb-2">{p.name}</div>
              <p className="text-np-muted text-sm leading-relaxed mb-5">{p.desc}</p>
              <Link to="/order" className="btn-primary text-sm">Get a Quote</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready for a Perfectly Manicured Lawn?</h2>
        <p>Get a custom quote based on your property size and frequency preference.</p>
        <Link to="/order" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
