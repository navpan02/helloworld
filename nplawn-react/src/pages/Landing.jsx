import { Link } from 'react-router-dom';
import heroImg from '../assets/mylawn.jpeg';

const SERVICES = [
  {
    to: '/lawn-care',
    title: 'Lawn Care Plans',
    desc: 'Seasonal fertilization, weed control, and soil health treatments — GrassBasic, GrassPro, or GrassNatural.',
    icon: <><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>,
  },
  {
    to: '/tree-trimming',
    title: 'Tree Trimming',
    desc: 'Crown shaping, deadwood removal, and hazard pruning by trained arborists.',
    icon: <><path d="M6 3v18M6 3l6 6M6 3l-3 6"/><path d="M18 6v15M18 6l3 6M18 6l-3 6"/></>,
  },
  {
    to: '/tree-shrubs',
    title: 'Tree & Shrubs',
    desc: 'Plant health care, shrub shaping, deep root feeding, and new plant installation.',
    icon: <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>,
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
  { n: '2', title: 'Choose a Plan',  desc: "Pick the service or plan that fits your lawn's needs and your budget. No long-term contracts required." },
  { n: '3', title: 'We Handle It',   desc: 'Our certified crew shows up on schedule, does the work, and sends a detailed service report.' },
  { n: '4', title: 'Enjoy the View', desc: 'Watch your lawn thrive season after season while we handle all the work.' },
];

const WHY_US = [
  {
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    title: 'Locally Owned & Operated',
    desc: 'Based in Naperville since 2017. We know Chicagoland soil, weather, and grass — because we live here too.',
  },
  {
    icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    title: 'Certified Crew, Every Visit',
    desc: 'Our technicians are trained, background-checked, and carry full liability insurance — no day laborers.',
  },
  {
    icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
    title: 'No Contracts, No Surprises',
    desc: 'Transparent annual pricing, no hidden fees, and the freedom to cancel before your next season.',
  },
  {
    icon: <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>,
    title: 'Eco-Friendly Options',
    desc: 'Our GrassNatural program uses 100% organic inputs — safe for kids, pets, and the Midwest ecosystem.',
  },
  {
    icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    title: 'On-Time, Every Time',
    desc: 'Automated scheduling with text reminders. You\'ll always know when we\'re coming and what was done.',
  },
  {
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    title: 'Dedicated Account Team',
    desc: 'A real person knows your property, your preferences, and your history. Not a call center.',
  },
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
        <p className="text-white/90 text-lg max-w-[520px] mt-4">
          Professional lawn care, tree &amp; shrubs care, lawn maintenance, and landscape design — serving Naperville and surrounding Chicagoland communities.
        </p>
        <div className="flex gap-3.5 flex-wrap mt-9">
          <Link to="/buy-now"
            className="bg-white text-np-dark font-extrabold text-base px-8 py-3.5 rounded-full no-underline shadow-[0_6px_20px_rgba(255,255,255,0.25)] hover:bg-np-lite hover:-translate-y-0.5 transition-all">
            Buy Now
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
        <h2 className="pg-title">Complete Lawn Care &amp; Landscape Services</h2>
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

      {/* VALUE PROPOSITION — Why Choose NPLawn */}
      <section className="px-[8%] py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="pg-label">Why NPLawn</p>
          <h2 className="pg-title">The Local Difference You Can See</h2>
          <p className="pg-sub mb-12">
            National franchises send different crews every week. We build a relationship with your property — and it shows in the results.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map(w => (
              <div key={w.title} className="flex gap-4 p-5 rounded-2xl border border-np-border hover:border-np-accent/40 hover:shadow-np transition-all">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-np-surface flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-np-accent fill-none stroke-[1.8]" viewBox="0 0 24 24">{w.icon}</svg>
                </div>
                <div>
                  <h3 className="font-bold text-np-dark text-sm mb-1">{w.title}</h3>
                  <p className="text-np-muted text-xs leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/about" className="btn-outline px-7 py-3">Meet the Team &rarr;</Link>
          </div>
        </div>
      </section>

      {/* CLEANLAWN PROMO */}
      <section className="px-[8%] py-14 bg-np-dark text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-2">Marketplace</p>
            <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-2">
              Need Mowing or Aeration? Try <span className="text-np-lite">CleanLawn</span>.
            </h2>
            <p className="text-white/60 max-w-lg">
              Book on-demand lawn maintenance — mowing and aeration &amp; seeding — through our dedicated marketplace. Local providers, transparent pricing.
            </p>
          </div>
          <Link to="/CleanLawn"
            className="flex-shrink-0 bg-np-accent text-np-dark font-extrabold px-8 py-3.5 rounded-full no-underline hover:bg-np-lite transition-all whitespace-nowrap">
            Explore CleanLawn →
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-[8%] py-20 bg-np-surface">
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
          <div className="mt-10 text-center">
            <Link to="/how-it-works" className="text-np-accent font-semibold text-sm hover:underline">
              See the full process &rarr;
            </Link>
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
        <p>Get started in minutes. Enter your address and we'll calculate your lawn size and pricing instantly.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/buy-now" className="btn-primary text-base px-8 py-4">Buy Now</Link>
          <Link to="/quote" className="btn-outline text-base px-8 py-4">Get a Free Quote</Link>
        </div>
      </section>
    </>
  );
}
