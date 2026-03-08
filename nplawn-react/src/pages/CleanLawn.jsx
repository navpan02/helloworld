import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SERVICES = [
  {
    to: '/CleanLawn/mowing',
    title: 'Lawn Mowing',
    desc: 'Weekly or bi-weekly cuts, edging, and cleanup. Every visit leaves your lawn looking sharp.',
    icon: (
      <svg className="w-7 h-7 stroke-np-green fill-none stroke-2" viewBox="0 0 24 24">
        <path d="M3 17h18M3 12h18M3 7h18"/>
      </svg>
    ),
  },
  {
    to: '/CleanLawn/aeration-seeding',
    title: 'Aeration & Seeding',
    desc: 'Core aeration breaks compaction. Overseeding fills in thin areas. Done together, they transform tired lawns.',
    icon: (
      <svg className="w-7 h-7 stroke-np-green fill-none stroke-2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
];

const HOW_IT_WORKS = [
  { n: '1', title: 'Browse Services', desc: 'Pick from our lawn maintenance services. Transparent pricing, no hidden fees.' },
  { n: '2', title: 'Book Online',     desc: 'Select your preferred schedule and a local provider will confirm within hours.' },
  { n: '3', title: 'Sit Back',        desc: 'Our vetted professionals show up on time and send a report after every visit.' },
];

export default function CleanLawn() {
  const { user } = useAuth();

  return (
    <>
      {/* HERO */}
      <section className="bg-np-dark text-white px-[8%] py-24 text-center">
        <div className="inline-block bg-np-accent/20 border border-np-accent/50 text-np-lite text-xs font-bold tracking-[1.5px] uppercase px-4 py-1.5 rounded-full mb-5">
          Lawn Maintenance Marketplace
        </div>
        <h1 className="font-black leading-[1.1] tracking-tight max-w-3xl mx-auto"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          <span className="text-np-lite">CleanLawn</span> — Book Lawn Maintenance, On Demand.
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mt-5">
          Connect with local, vetted professionals for mowing and aeration. Easy booking, fair prices, great results.
        </p>
        <div className="flex gap-3.5 flex-wrap justify-center mt-9">
          <Link to="/CleanLawn/mowing"
            className="bg-np-accent text-np-dark font-extrabold text-base px-8 py-3.5 rounded-full no-underline hover:bg-np-lite transition-all">
            Book Mowing
          </Link>
          <Link to="/CleanLawn/aeration-seeding"
            className="border-2 border-white/50 text-white font-bold text-base px-7 py-3.5 rounded-full no-underline hover:border-np-lite hover:text-np-lite transition-all">
            Book Aeration & Seeding
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="px-[8%] py-20 bg-np-surface">
        <p className="pg-label">Our Services</p>
        <h2 className="pg-title">Lawn Maintenance Made Simple</h2>
        <p className="pg-sub mb-12">Professional service, booked in minutes.</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {SERVICES.map(s => (
            <Link key={s.to} to={s.to} className="service-card no-underline">
              <div className="service-icon">{s.icon}</div>
              <h3 className="text-np-dark font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed mb-4">{s.desc}</p>
              <span className="text-np-accent text-sm font-semibold">Learn more &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-[8%] py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="pg-label">Simple Process</p>
          <h2 className="pg-title">How CleanLawn Works</h2>
          <p className="pg-sub mb-12">From booking to a freshly cut lawn — it's that easy.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(s => (
              <div key={s.n} className="flex flex-col gap-3">
                <div className="step-number">{s.n}</div>
                <h3 className="font-bold text-np-dark text-lg">{s.title}</h3>
                <p className="text-np-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="bg-np-dark text-white px-[8%] py-20">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-2">For Professionals</p>
            <h2 className="text-white text-3xl font-extrabold mb-4">Grow Your Lawn Care Business</h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Join the CleanLawn provider network. Get matched with customers in your area, manage your schedule, and grow your revenue — all from one dashboard.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/CleanLawn/provider/signup"
                className="bg-np-accent text-np-dark font-extrabold px-7 py-3 rounded-full no-underline hover:bg-np-lite transition-all">
                Join as a Provider
              </Link>
              {user?.role === 'provider' && (
                <Link to="/CleanLawn/provider"
                  className="border-2 border-white/50 text-white font-bold px-6 py-3 rounded-full no-underline hover:border-np-lite hover:text-np-lite transition-all">
                  My Dashboard
                </Link>
              )}
              {!user && (
                <Link to="/CleanLawn/provider"
                  className="border-2 border-white/50 text-white font-bold px-6 py-3 rounded-full no-underline hover:border-np-lite hover:text-np-lite transition-all">
                  Provider Login
                </Link>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: '200+', label: 'Active Providers' },
              { val: '2,000+', label: 'Jobs Completed' },
              { val: '4.8★', label: 'Provider Rating' },
              { val: '10+', label: 'Service ZIP Codes' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <div className="text-2xl font-black text-np-lite">{s.val}</div>
                <div className="text-white/50 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="cta-section">
        <h2>Ready for a Cleaner Lawn?</h2>
        <p>Book a mowing or aeration visit today. Local professionals, transparent pricing.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/CleanLawn/mowing" className="btn-primary text-base px-8 py-4">Book Mowing</Link>
          <Link to="/CleanLawn/aeration-seeding" className="btn-outline text-base px-8 py-4">Book Aeration</Link>
        </div>
      </section>
    </>
  );
}
