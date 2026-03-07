import { Link } from 'react-router-dom';
import heroImg from '../assets/mylawn.jpeg';

const SERVICES = [
  {
    to: '/mowing',
    title: 'Lawn Mowing',
    desc: 'Weekly or bi-weekly cuts, edging, and cleanup. Every visit leaves your lawn looking sharp.',
    icon: <path d="M3 17h18M3 12h18M3 7h18"/>,
  },
  {
    to: '/tree-trimming',
    title: 'Tree Trimming',
    desc: 'Crown shaping, deadwood removal, and hazard pruning by trained arborists.',
    icon: <><path d="M6 3v18M6 3l6 6M6 3l-3 6"/><path d="M18 6v15M18 6l3 6M18 6l-3 6"/></>,
  },
  {
    to: '/lawn-care',
    title: 'Lawn Care Plans',
    desc: 'Seasonal fertilization, weed control, and soil health treatments — GrassBasic, GrassPro, or GrassNatural.',
    icon: <><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>,
  },
  {
    to: '/tree-shrubs',
    title: 'Tree & Shrubs',
    desc: 'Plant health care, shrub shaping, deep root feeding, and new plant installation.',
    icon: <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>,
  },
  {
    to: '/aeration-seeding',
    title: 'Aeration & Seeding',
    desc: 'Core aeration breaks compaction. Overseeding fills in thin areas. Done together, they transform tired lawns.',
    icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
  },
  {
    to: '/landscape-design',
    title: 'Landscape Design',
    desc: 'From concept to installation — native plantings, hardscaping, and full-yard transformations.',
    icon: <><circle cx="12" cy="8" r="5"/><path d="M12 13v9M9 22h6"/></>,
  },
];

const TESTIMONIALS = [
  { text: "NPLawn has transformed our yard. The crew is professional, on time, and the results speak for themselves. Neighbors keep asking who does our lawn!", author: "Sarah M.", location: "Naperville, IL" },
  { text: "We switched from a national company and the difference is night and day. Local team that actually knows our grass type and soil. Highly recommend.", author: "James T.", location: "Plainfield, IL" },
  { text: "The GrassNatural program is phenomenal. Our lawn has never looked better and we feel good about what we're putting on it around our kids and dogs.", author: "Priya K.", location: "Bolingbrook, IL" },
];

const STEPS = [
  { n: '1', title: 'Get a Quote',    desc: 'Fill out our quick online form and get a custom quote for your property within 24 hours.' },
  { n: '2', title: 'Choose a Plan',  desc: 'Pick the service or plan that fits your lawn\'s needs and your budget. No long-term contracts required.' },
  { n: '3', title: 'We Handle It',   desc: 'Our certified crew shows up on schedule, does the work, and sends a detailed service report.' },
  { n: '4', title: 'Enjoy the View', desc: 'Watch your lawn thrive season after season while we handle all the work.' },
];

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="min-h-[88vh] flex flex-col items-start justify-center px-[8%] py-20"
        style={{
          background: `linear-gradient(160deg, rgba(27,46,36,0.82) 0%, rgba(45,106,79,0.65) 60%, transparent 100%), url("${heroImg}") center/cover no-repeat`,
        }}>
        <div className="inline-block bg-np-accent/20 border border-np-accent/50 text-np-lite text-xs font-bold tracking-[1.5px] uppercase px-4 py-1.5 rounded-full mb-5">
          Locally Owned Since 2017
        </div>
        <h1 className="text-white font-black leading-[1.1] tracking-tight max-w-2xl"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}>
          Your Lawn, <span className="text-np-lite">Our Expertise</span>.<br/>
          Every Single Cut.
        </h1>
        <p className="text-white/72 text-lg max-w-[520px] mt-4">
          Professional lawn care, tree trimming, and landscape design — serving Naperville and surrounding Chicagoland communities.
        </p>
        <div className="flex gap-3.5 flex-wrap mt-9">
          <Link to="/order"
            className="bg-np-accent text-np-dark font-extrabold text-base px-8 py-3.5 rounded-full no-underline shadow-[0_6px_20px_rgba(82,183,136,0.45)] hover:bg-np-lite hover:-translate-y-0.5 transition-all">
            Get a Free Quote
          </Link>
          <Link to="/lawn-care"
            className="border-2 border-white/50 text-white font-bold text-base px-7 py-3.5 rounded-full no-underline hover:border-white hover:bg-white/10 transition-all">
            View Services
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-12 flex-wrap">
          {[
            { val: '500+', label: 'Properties Served' },
            { val: '8 yrs', label: 'In Business' },
            { val: '4.9★', label: 'Average Rating' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-white/55 text-xs font-medium tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="px-[8%] py-20 bg-np-surface">
        <p className="pg-label">What We Do</p>
        <h2 className="pg-title">Complete Lawn & Landscape Services</h2>
        <p className="pg-sub mb-12">Everything your property needs, handled by a team that treats your yard like their own.</p>
        <div className="service-grid">
          {SERVICES.map(s => (
            <Link key={s.to} to={s.to} className="service-card no-underline">
              <div className="service-icon">
                <svg viewBox="0 0 24 24">{s.icon}</svg>
              </div>
              <h3 className="text-np-dark font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed mb-4">{s.desc}</p>
              <span className="text-np-accent text-sm font-semibold">Learn more &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-[8%] py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="pg-label">Simple Process</p>
          <h2 className="pg-title">How It Works</h2>
          <p className="pg-sub mb-12">Getting started is easy. We handle the complexity so you don't have to.</p>
          <div className="grid md:grid-cols-2 gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-4">
                <div className="step-number">{s.n}</div>
                <div>
                  <h3 className="font-bold text-np-dark text-lg mb-1">{s.title}</h3>
                  <p className="text-np-muted text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-[8%] py-20 bg-np-dark">
        <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-2">What Clients Say</p>
        <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-12">Trusted by Hundreds of Homeowners</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-np-lite text-xl mb-3">★★★★★</div>
              <p className="text-white/80 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="font-semibold text-white">{t.author}</div>
              <div className="text-white/40 text-xs">{t.location}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready for a Lawn You're Proud Of?</h2>
        <p>Get your free custom quote today. Our team will assess your property and recommend the right service for your needs and budget.</p>
        <Link to="/order" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
