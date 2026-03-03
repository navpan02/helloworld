import { Link } from 'react-router-dom';

const SERVICES_LIST = [
  { title: 'Shrub Shaping & Pruning', desc: 'We shape your shrubs to their natural or designed form, removing dead wood and promoting healthy new growth.' },
  { title: 'Plant Health Care', desc: 'Nutrient programs, soil treatments, and pest management tailored to each species and site condition.' },
  { title: 'New Plant Installation', desc: 'We source, select, and install trees and shrubs matched to your site conditions and landscape goals.' },
  { title: 'Deep Root Fertilization', desc: 'Liquid fertilizer injected directly into the root zone for maximum uptake and impact on stressed or slow trees.' },
];

const SHRUBS = [
  { name: 'Serviceberry', season: 'Spring', desc: 'White flowers in April, edible berries in summer, brilliant fall color.' },
  { name: 'Winterberry Holly', season: 'Fall/Winter', desc: 'Blazing red berries after leaf drop — dramatic winter interest.' },
  { name: 'Native Viburnum', season: 'Multi-season', desc: 'Spring flowers, fall berries, and rich burgundy fall foliage.' },
  { name: 'Red Twig Dogwood', season: 'Winter', desc: 'Vivid red stems glow against snow for striking cold-season color.' },
];

export default function TreeShrubs() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Tree & Shrubs</div>
        <h1>Tree & Shrub Care<br/>That Lasts</h1>
        <p>Species-specific health programs, seasonal pruning, and new plant installation — handled by certified horticulturalists who understand Midwest plants.</p>
      </section>

      <section className="pg-section white">
        <p className="pg-label">Our Services</p>
        <h2 className="pg-title">Complete Plant Care Programs</h2>
        <div className="service-grid mt-8">
          {SERVICES_LIST.map(s => (
            <div key={s.title} className="bg-np-surface rounded-2xl p-6 border border-np-border">
              <h3 className="text-np-dark font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">Native Picks</p>
        <h2 className="pg-title">Best Shrubs for Midwest Properties</h2>
        <p className="pg-sub mb-8">Native plants mean lower maintenance, better wildlife support, and proven performance in our climate.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SHRUBS.map(s => (
            <div key={s.name} className="bg-white rounded-2xl p-6 border border-np-border shadow-np">
              <div className="text-xs font-bold text-np-accent tracking-widest uppercase mb-2">{s.season}</div>
              <h3 className="text-np-dark font-bold text-lg mb-1">{s.name}</h3>
              <p className="text-np-muted text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/blog/midwest-shrubs" className="btn-outline">Read Our Shrub Guide &rarr;</Link>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Improve Your Trees & Shrubs?</h2>
        <p>We'll assess your plants and recommend a care program tailored to your species and site.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Schedule a Consultation</Link>
      </section>
    </>
  );
}
