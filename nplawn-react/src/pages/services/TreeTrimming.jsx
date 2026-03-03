import { Link } from 'react-router-dom';

const SIGNS = [
  'Dead or hanging branches that could fall', 'Branches rubbing or crossing each other',
  'Limbs growing toward power lines or your home', 'Uneven or lopsided canopy affecting the tree\'s health',
  'Dense canopy blocking light and airflow', 'Storm damage requiring cleanup and corrective pruning',
];

const SERVICES_LIST = [
  { title: 'Crown Thinning', desc: 'Remove select interior branches to improve light penetration and airflow without changing the tree\'s natural shape.' },
  { title: 'Crown Raising', desc: 'Lift the lower canopy to provide clearance for buildings, traffic, or sightlines while preserving overall structure.' },
  { title: 'Deadwooding', desc: 'Remove dead, dying, or diseased branches that pose a safety risk or invite pests and decay.' },
  { title: 'Vista Pruning', desc: 'Strategic pruning to open up views or reduce shade in targeted areas while maintaining tree health.' },
];

export default function TreeTrimming() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Tree Trimming</div>
        <h1>Expert Tree Trimming<br/>& Pruning</h1>
        <p>ISA-certified arborist knowledge applied to every cut. We prune for health, safety, and beauty — not just aesthetics.</p>
      </section>

      <section className="pg-section white">
        <div className="max-w-3xl">
          <p className="pg-label">Warning Signs</p>
          <h2 className="pg-title">5 Signs Your Trees Need Professional Trimming</h2>
          <p className="pg-sub mb-8">Waiting too long can mean more expensive corrective work — or worse, a fallen limb.</p>
        </div>
        <ul className="grid md:grid-cols-2 gap-4 max-w-3xl">
          {SIGNS.map((s, i) => (
            <li key={i} className="flex gap-3 bg-np-surface rounded-xl p-4 border border-np-border">
              <span className="w-6 h-6 rounded-full bg-np-accent/20 text-np-accent flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">{i+1}</span>
              <span className="text-np-text text-sm leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">What We Offer</p>
        <h2 className="pg-title">Trimming & Pruning Services</h2>
        <div className="service-grid mt-8">
          {SERVICES_LIST.map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-6 border border-np-border shadow-np">
              <h3 className="text-np-dark font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Is It Time to Trim Your Trees?</h2>
        <p>Get a professional assessment and quote from our certified team.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Schedule a Consultation</Link>
      </section>
    </>
  );
}
