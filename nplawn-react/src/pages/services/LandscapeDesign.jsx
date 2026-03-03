import { Link } from 'react-router-dom';

const PROCESS = [
  { step: 'Site Assessment', desc: 'We evaluate sun exposure, soil type, drainage, existing plants, and your lifestyle to understand what the space needs.' },
  { step: 'Concept Design', desc: 'A detailed plan showing plant selections, hardscape layout, sight lines, and seasonal interest — reviewed with you before anything is installed.' },
  { step: 'Plant Sourcing', desc: 'We source quality plants from trusted local growers, with an emphasis on natives and species proven in our climate.' },
  { step: 'Installation', desc: 'Our crew installs everything per the plan — plants, edging, mulch, hardscape, and irrigation if needed.' },
  { step: 'Establishment', desc: 'We walk you through post-planting care and schedule follow-up visits to ensure everything takes hold and thrives.' },
];

const PRINCIPLES = [
  { title: 'Right Plant, Right Place', desc: 'We match plants to their ideal sun, moisture, and soil conditions — so they thrive without constant intervention.' },
  { title: 'Native First', desc: 'Native plants evolved in your climate, support local wildlife, and need minimal care once established.' },
  { title: 'Four-Season Interest', desc: 'We plan for spring blooms, summer color, fall foliage, and winter structure — so your yard looks great year-round.' },
  { title: 'Low-Maintenance by Design', desc: 'The goal is a beautiful yard that doesn\'t demand your weekends. Smart plant choices and smart layout make the difference.' },
];

export default function LandscapeDesign() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Landscape Design</div>
        <h1>Landscape Design<br/>From Concept to Completion</h1>
        <p>Native plant selection, custom layouts, and full installation — designed around your property, your goals, and your lifestyle.</p>
      </section>

      <section className="pg-section white">
        <p className="pg-label">Our Approach</p>
        <h2 className="pg-title">Design Principles We Follow</h2>
        <div className="service-grid mt-8">
          {PRINCIPLES.map(p => (
            <div key={p.title} className="bg-np-surface rounded-2xl p-6 border border-np-border">
              <h3 className="text-np-dark font-bold text-lg mb-2">{p.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">The Process</p>
        <h2 className="pg-title">From First Conversation to Finished Yard</h2>
        <div className="max-w-2xl mt-8 space-y-6">
          {PROCESS.map((p, i) => (
            <div key={i} className="flex gap-5">
              <div className="step-number flex-shrink-0">{i + 1}</div>
              <div>
                <h3 className="font-bold text-np-dark text-lg mb-1">{p.step}</h3>
                <p className="text-np-muted text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Transform Your Outdoor Space?</h2>
        <p>Our design team will assess your property and build a plan that fits your goals and lifestyle.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Start a Consultation</Link>
      </section>
    </>
  );
}
