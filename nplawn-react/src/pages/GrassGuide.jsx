import { useState } from 'react';
import { Link } from 'react-router-dom';

const COOL_SEASON = [
  {
    name: 'Kentucky Bluegrass',
    latin: 'Poa pratensis',
    zone: 'Cool-Season',
    maintenance: 'Medium-High',
    maintenanceLevel: 4,
    color: 'Dark blue-green',
    texture: 'Fine',
    shade: 'Partial shade tolerant',
    drought: 'Moderate',
    midwest: true,
    common: true,
    description: 'The most popular lawn grass in the Midwest. Dense, lush, and beautiful when well-maintained. It spreads via underground stems (rhizomes), allowing it to self-repair bare patches. Thrives in full sun but tolerates light shade. Goes dormant and turns straw-colored in severe drought.',
    identifies: ['Boat-shaped leaf tip (like the prow of a boat)', 'Distinctive V-shaped midrib on each blade', 'Dark blue-green color', 'Very fine texture — blades feel soft'],
    bestFor: ['Full-sun lawns', 'High-visibility front yards', 'Areas with moderate foot traffic', 'Chicagoland climate zones 5b–6a'],
    icon: (
      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
        <path d="M24 44 C24 44 8 28 8 16 C8 9 14 4 24 4 C34 4 40 9 40 16 C40 28 24 44 24 44Z" strokeLinejoin="round"/>
        <path d="M24 44 L24 20"/>
        <path d="M24 30 C20 26 16 22 14 18"/>
        <path d="M24 30 C28 26 32 22 34 18"/>
      </svg>
    ),
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'Tall Fescue',
    latin: 'Festuca arundinacea',
    zone: 'Cool-Season',
    maintenance: 'Low-Medium',
    maintenanceLevel: 2,
    color: 'Medium green',
    texture: 'Coarse',
    shade: 'Good shade tolerance',
    drought: 'Good',
    midwest: true,
    common: true,
    description: 'The workhorse of Midwest lawns. Tall Fescue is tough, low-maintenance, and handles heat and drought better than other cool-season grasses. It forms clumps (bunch-type grass) rather than spreading, so bare patches require reseeding. Excellent for yards with kids, pets, and heavy foot traffic.',
    identifies: ['Wide, coarse blades — noticeably wider than bluegrass', 'Medium-green color (not as blue as KBG)', 'Grows in bunches or clumps', 'Ribbed upper leaf surface; smooth underside'],
    bestFor: ['High-traffic areas', 'Shaded yards', 'Low-maintenance homeowners', 'Areas with poor or clay soil'],
    icon: (
      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
        <path d="M18 44 C16 36 14 24 14 12 C14 8 16 5 18 4"/>
        <path d="M24 44 C24 34 24 22 24 10 C24 6 24 4 24 4"/>
        <path d="M30 44 C32 36 34 24 34 12 C34 8 32 5 30 4"/>
        <path d="M14 20 C16 18 20 18 24 20 C28 22 32 22 34 20"/>
        <path d="M14 30 C16 28 20 28 24 30 C28 32 32 32 34 30"/>
      </svg>
    ),
    badgeColor: 'bg-green-100 text-green-800',
  },
  {
    name: 'Fine Fescue',
    latin: 'Festuca spp.',
    zone: 'Cool-Season',
    maintenance: 'Very Low',
    maintenanceLevel: 1,
    color: 'Fine blue-green',
    texture: 'Very Fine',
    shade: 'Excellent shade tolerance',
    drought: 'Good',
    midwest: true,
    common: false,
    description: 'A family of fine-bladed fescues (Creeping Red, Chewings, Hard, Sheep) often blended with Kentucky Bluegrass. The champion of shade tolerance among cool-season grasses. Requires the least fertilizer and mowing of any common lawn grass. Ideal under trees or on slopes.',
    identifies: ['Needle-like, very thin blades — thinnest of all common grasses', 'Blue-green to grayish-green tint', 'Low growth habit; rarely looks unkempt', 'Often found in mixed seed blends'],
    bestFor: ['Dense shade', 'Low-input/low-mow lawns', 'Slopes and erosion control', 'Naturalizing areas'],
    icon: (
      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
        <path d="M24 44 C22 38 20 30 18 20 C16 12 16 6 20 4"/>
        <path d="M24 44 C24 38 24 28 24 18 C24 10 24 5 24 4"/>
        <path d="M24 44 C26 38 28 30 30 20 C32 12 32 6 28 4"/>
        <path d="M20 24 C22 22 24 22 28 24"/>
      </svg>
    ),
    badgeColor: 'bg-teal-100 text-teal-800',
  },
  {
    name: 'Perennial Ryegrass',
    latin: 'Lolium perenne',
    zone: 'Cool-Season',
    maintenance: 'Medium',
    maintenanceLevel: 3,
    color: 'Dark glossy green',
    texture: 'Fine-Medium',
    shade: 'Moderate shade tolerance',
    drought: 'Poor',
    midwest: true,
    common: true,
    description: 'Fast-germinating, fine-textured, and glossy green. Often used in seed mixes alongside Kentucky Bluegrass to fill in quickly while slower-germinating varieties establish. Germinates in as few as 5–7 days — one of the fastest lawn grasses. Susceptible to summer heat and drought.',
    identifies: ['Shiny, glossy underside of blade (distinctive characteristic)', 'Pointed leaf tip', 'Dark, rich green color', 'Often has a reddish tint at the base'],
    bestFor: ['Overseeding bare patches quickly', 'Athletic fields', 'Mix with Kentucky Bluegrass', 'Quick winter color in dormant areas'],
    icon: (
      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
        <path d="M20 44 C18 36 16 26 16 16 C16 9 18 5 22 4"/>
        <path d="M28 44 C30 36 32 26 32 16 C32 9 30 5 26 4"/>
        <path d="M16 22 C18 20 22 20 24 22"/>
        <path d="M32 22 C30 20 26 20 24 22"/>
        <path d="M16 32 C20 30 24 30 28 32 C32 34 34 32 32 30"/>
      </svg>
    ),
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
];

const WARM_SEASON = [
  {
    name: 'Bermudagrass',
    latin: 'Cynodon dactylon',
    zone: 'Warm-Season',
    maintenance: 'High',
    maintenanceLevel: 4,
    color: 'Gray-green to dark green',
    texture: 'Fine-Medium',
    shade: 'Poor — needs full sun',
    drought: 'Excellent',
    midwest: false,
    common: false,
    description: 'The most common warm-season turfgrass in the South. Extremely heat and drought tolerant. Goes completely dormant and turns brown in winter — a major drawback in the Midwest. Aggressive spreader via stolons and rhizomes; forms a dense, resilient turf. Needs full sun.',
    identifies: ['Gray-green color with a slightly silvery look', 'Very short, fine blades', 'Visible stolons running across soil surface', 'Turns completely tan/brown in fall'],
    bestFor: ['Deep South and Southwest (zones 7–10)', 'Golf courses and sports fields', 'Not recommended for Chicagoland zones 5b–6a'],
    icon: (
      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
        <path d="M8 36 C14 28 22 26 24 24 C26 22 34 20 40 12"/>
        <path d="M8 28 C14 24 20 22 24 20"/>
        <path d="M24 20 C28 16 34 14 40 8"/>
        <circle cx="12" cy="32" r="2" fill="currentColor" stroke="none"/>
        <circle cx="28" cy="18" r="2" fill="currentColor" stroke="none"/>
      </svg>
    ),
    badgeColor: 'bg-orange-100 text-orange-800',
  },
  {
    name: 'Zoysiagrass',
    latin: 'Zoysia spp.',
    zone: 'Warm-Season',
    maintenance: 'Medium',
    maintenanceLevel: 3,
    color: 'Medium to dark green',
    texture: 'Fine-Medium',
    shade: 'Moderate shade tolerance',
    drought: 'Very Good',
    midwest: false,
    common: false,
    description: 'Slower growing but more cold-tolerant than Bermuda — Zoysia can survive in the transition zone (parts of southern Illinois, Indiana, Ohio). Forms a dense, carpet-like lawn that crowds out weeds. Still goes dormant in Midwest winters. Slow to establish from seed.',
    identifies: ['Stiff, sharp-feeling blades', 'Dense, carpet-like growth', 'Slow lateral spread', 'Yellow-brown dormancy color in winter'],
    bestFor: ['Transition zone (Zone 6b–7)', 'Southern Illinois yards', 'Low-weed-pressure goals', 'NOT recommended for Naperville (Zone 5b)'],
    icon: (
      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
        <rect x="6" y="28" width="36" height="6" rx="2"/>
        <path d="M10 28 C10 20 12 12 14 8"/>
        <path d="M18 28 C18 22 20 14 22 10"/>
        <path d="M26 28 C26 22 28 14 30 10"/>
        <path d="M38 28 C36 20 34 12 32 8"/>
      </svg>
    ),
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  {
    name: 'St. Augustinegrass',
    latin: 'Stenotaphrum secundatum',
    zone: 'Warm-Season',
    maintenance: 'Medium-High',
    maintenanceLevel: 4,
    color: 'Coarse blue-green',
    texture: 'Very Coarse',
    shade: 'Good shade tolerance',
    drought: 'Moderate',
    midwest: false,
    common: false,
    description: 'The dominant lawn grass in Florida and the Gulf Coast. Very coarse, paddle-shaped leaves. Does not survive Midwest winters — not suitable for Illinois or Indiana. Spreads aggressively via stolons. Best shade tolerance of warm-season grasses.',
    identifies: ['Very wide, paddle-shaped, rounded leaf tips', 'Coarse, flat blades — noticeably thick', 'Blue-green color', 'Stolons visible at soil surface'],
    bestFor: ['Florida, Gulf Coast, Hawaii (Zones 8–11)', 'NOT suitable for Chicagoland — will not survive winter'],
    icon: (
      <svg className="w-12 h-12 stroke-current fill-none stroke-[1.5]" viewBox="0 0 48 48">
        <path d="M12 36 C12 36 16 24 24 18 C32 12 40 14 40 14" strokeLinecap="round"/>
        <path d="M8 32 C8 32 12 24 20 20 C28 16 36 18 40 20" strokeLinecap="round"/>
        <ellipse cx="24" cy="14" rx="8" ry="4" transform="rotate(-20 24 14)"/>
      </svg>
    ),
    badgeColor: 'bg-red-100 text-red-800',
  },
];

function MaintenanceDots({ level }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i <= level ? 'bg-np-accent' : 'bg-np-border'}`}/>
      ))}
    </div>
  );
}

function GrassCard({ grass }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
      grass.midwest ? 'border-np-accent/40' : 'border-np-border'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`text-np-accent ${grass.midwest ? '' : 'text-np-muted/60'}`}>
            {grass.icon}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${grass.badgeColor}`}>
              {grass.zone}
            </span>
            {grass.midwest && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-np-accent text-np-dark">
                Common in Chicagoland
              </span>
            )}
          </div>
        </div>

        <h3 className="text-np-dark text-xl font-extrabold mb-0.5">{grass.name}</h3>
        <p className="text-np-muted/70 text-xs italic mb-3">{grass.latin}</p>
        <p className="text-np-muted text-sm leading-relaxed mb-4">{grass.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ['Texture', grass.texture],
            ['Color', grass.color],
            ['Shade', grass.shade],
            ['Drought', `${grass.drought} tolerance`],
          ].map(([label, val]) => (
            <div key={label}>
              <div className="text-np-muted text-xs font-semibold uppercase tracking-wide mb-0.5">{label}</div>
              <div className="text-np-dark text-sm font-medium">{val}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-np-muted text-xs font-semibold uppercase tracking-wide">Maintenance</span>
          <MaintenanceDots level={grass.maintenanceLevel} />
          <span className="text-np-muted text-xs">({grass.maintenance})</span>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="text-np-accent text-sm font-semibold hover:text-np-green transition-colors flex items-center gap-1"
        >
          {open ? 'Show less' : 'How to identify & best uses'}
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {open && (
          <div className="mt-4 space-y-4 border-t border-np-border pt-4">
            <div>
              <h4 className="text-np-dark font-bold text-sm mb-2">How to Identify It</h4>
              <ul className="space-y-1">
                {grass.identifies.map(tip => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-np-muted">
                    <svg className="w-4 h-4 fill-np-accent flex-shrink-0 mt-0.5" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"/>
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-np-dark font-bold text-sm mb-2">Best For</h4>
              <ul className="space-y-1">
                {grass.bestFor.map(use => (
                  <li key={use} className="flex items-start gap-2 text-sm text-np-muted">
                    <svg className="w-4 h-4 stroke-np-accent fill-none flex-shrink-0 mt-0.5" strokeWidth={2} viewBox="0 0 24 24">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GrassGuide() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-icon mx-auto mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 stroke-np-lite fill-none stroke-[1.5]" viewBox="0 0 24 24">
            <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
          </svg>
        </div>
        <div className="page-hero-badge">Lawn Education</div>
        <h1>Grass Type Guide</h1>
        <p>Not sure what's growing in your yard? Use this visual guide to identify your grass type and learn how to care for it properly.</p>
      </section>

      {/* Midwest callout */}
      <div className="bg-np-accent/10 border-y border-np-accent/30 px-[8%] py-5">
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          <svg className="w-6 h-6 fill-np-accent flex-shrink-0 mt-0.5" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1 2 0v4a1 1 0 0 1-2 0V6zm1 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
          <p className="text-np-green text-sm">
            <strong>Naperville / Chicagoland note:</strong> Most lawns in our service area are cool-season grasses — primarily Kentucky Bluegrass, Tall Fescue, or a mix of the two. Warm-season grasses like Bermuda and St. Augustine cannot survive Illinois winters and are included here for reference only.
          </p>
        </div>
      </div>

      {/* Cool-season */}
      <section className="pg-section white">
        <div className="max-w-6xl mx-auto">
          <p className="pg-label">Zones 5–6 · Thrives in Illinois</p>
          <h2 className="pg-title">Cool-Season Grasses</h2>
          <p className="pg-sub mb-10">These grasses grow best in spring and fall (55–70°F) and are the correct choice for Chicagoland lawns. They may go semi-dormant in peak summer heat but bounce back in fall.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {COOL_SEASON.map(g => <GrassCard key={g.name} grass={g} />)}
          </div>
        </div>
      </section>

      {/* Warm-season */}
      <section className="pg-section" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="pg-label">Zones 7–11 · Southern US</p>
          <h2 className="pg-title">Warm-Season Grasses</h2>
          <p className="pg-sub mb-4">These are included for reference. Warm-season grasses thrive in the South and won't survive Midwest winters. If you're a transplant from a warmer state, this section explains what you left behind.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-10 flex items-start gap-3">
            <svg className="w-5 h-5 fill-yellow-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z"/>
            </svg>
            <p className="text-yellow-800 text-sm">These grasses are <strong>not suitable for Naperville or anywhere in Illinois</strong>. They will not survive winters in USDA Hardiness Zones 5b or 6a.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {WARM_SEASON.map(g => <GrassCard key={g.name} grass={g} />)}
          </div>
        </div>
      </section>

      {/* Quick ID tips */}
      <section className="pg-section white">
        <div className="max-w-3xl mx-auto">
          <p className="pg-label">Quick Reference</p>
          <h2 className="pg-title">3-Step Grass ID</h2>
          <p className="pg-sub mb-8">Follow these steps to narrow down your grass type in under 2 minutes.</p>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Check the color and texture',
                detail: 'Fine, blue-green blades → likely Kentucky Bluegrass. Wide, coarser blades → Tall Fescue. Needle-thin blades → Fine Fescue.',
              },
              {
                step: '2',
                title: 'Look at the leaf tip',
                detail: 'Boat-shaped (pointed like a canoe hull) = Kentucky Bluegrass. Pointed but flat = Ryegrass or Fescue. Very round, paddle-wide = St. Augustine (not a Midwest grass).',
              },
              {
                step: '3',
                title: 'Check how it spreads',
                detail: 'If it\'s spreading into bare areas on its own → it has rhizomes or stolons (Kentucky Bluegrass, Bermuda). If bare patches stay bare → it\'s a bunch-type grass (Tall Fescue, Ryegrass).',
              },
            ].map(s => (
              <div key={s.step} className="flex gap-5 bg-np-surface rounded-xl p-5 border border-np-border">
                <div className="step-number flex-shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-bold text-np-dark mb-1">{s.title}</h3>
                  <p className="text-np-muted text-sm leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-np-dark rounded-2xl p-6 text-center">
            <h3 className="text-white font-bold mb-2">Still not sure? Let us identify it.</h3>
            <p className="text-white/60 text-sm mb-5">Our team can identify your grass type during a free property assessment — and recommend the right plan for it.</p>
            <Link to="/contact" className="btn-primary px-6 py-2.5">Request an Assessment</Link>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Know Your Grass. Grow It Better.</h2>
        <p>Our lawn care plans are tailored to the cool-season grasses of Chicagoland — the right timing, the right inputs, every visit.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Quote</Link>
          <Link to="/blog" className="btn-outline text-base px-8 py-4 border-white/30 text-white hover:bg-white/10">Read the Blog</Link>
        </div>
      </section>
    </>
  );
}
