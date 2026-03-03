import { Link } from 'react-router-dom';

const SIGNS = [
  'Water pools on the surface or runs off without soaking in',
  'Lawn feels spongy or soil is rock-hard when you push a screwdriver in',
  'Thatch layer exceeds ½ inch',
  'Heavy foot traffic — kids, pets, outdoor gatherings',
  'Grass is thin or patchy despite adequate water and fertilizer',
];

const AFTER = [
  { step: 'Overseed', desc: 'Seed falls directly into holes for maximum soil contact and germination.' },
  { step: 'Starter Fertilizer', desc: 'Nutrients reach root zones immediately for fast recovery.' },
  { step: 'Compost Top-Dress', desc: 'Improve soil structure and organic matter for long-term gains.' },
  { step: 'Consistent Watering', desc: 'Keep soil moist for 2–3 weeks if overseeding for best results.' },
];

export default function AerationSeeding() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Aeration & Seeding</div>
        <h1>Core Aeration &<br/>Overseeding</h1>
        <p>Break up compaction, fill in thin areas, and give your lawn the breathing room it needs. Aeration and overseeding together are the most effective single-day investment in your lawn's health.</p>
      </section>

      <section className="pg-section white">
        <div className="max-w-3xl">
          <p className="pg-label">Why Aerate</p>
          <h2 className="pg-title">What Compaction Does to Your Lawn</h2>
          <p className="text-np-muted leading-relaxed mb-6">Compacted soil is one of the top five reasons lawns underperform. No amount of fertilizer can fix a lawn that can't breathe. Core aeration uses a hollow-tine machine to pull plugs of soil 2–3 inches deep, relieving compaction and creating channels for air, water, and nutrients.</p>
          <div className="bg-np-surface rounded-2xl p-6 border border-np-border">
            <div className="font-bold text-np-dark mb-4">Signs Your Lawn Needs Aeration:</div>
            <ul className="space-y-3">
              {SIGNS.map((s, i) => (
                <li key={i} className="flex gap-3 text-np-text text-sm">
                  <svg className="w-4 h-4 stroke-np-accent fill-none stroke-2 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">Maximize Results</p>
        <h2 className="pg-title">What to Do Right After Aeration</h2>
        <p className="pg-sub mb-8">The window right after aeration is the best time to overseed and fertilize. Don't waste it.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AFTER.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-np-border shadow-np">
              <div className="step-number mb-3">{i + 1}</div>
              <h3 className="font-bold text-np-dark mb-2">{a.step}</h3>
              <p className="text-np-muted text-sm">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Aerate & Overseed?</h2>
        <p>Our crew handles everything — aeration, overseeding, and starter fertilizer in a single visit.</p>
        <Link to="/order" className="btn-primary text-base px-8 py-4">Schedule Service</Link>
      </section>
    </>
  );
}
