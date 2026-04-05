import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  {
    id: 'cuts-trims',
    label: 'Cuts & Trims',
    tagline: 'Precision cutting services for a sharp, well-kept property.',
    icon: (
      <svg className="w-7 h-7 stroke-np-green fill-none stroke-2" viewBox="0 0 24 24">
        <path d="M6 9l6-6 6 6M6 15l6 6 6-6"/>
      </svg>
    ),
    services: [
      { to: '/CleanLawn/mowing',         title: 'Lawn Mowing',              desc: 'Weekly or bi-weekly cuts, edging, and cleanup. Every visit leaves your lawn looking sharp.' },
      { to: '/CleanLawn/tree-trimming',  title: 'Tree Trimming & Pruning',  desc: 'Crown shaping, deadwood removal, and hazard pruning by trained arborists.' },
      { to: '/CleanLawn/hedge-trimming', title: 'Hedge Trimming',           desc: 'Crisp shapes and clean lines for hedges, topiaries, and formal shrub borders.' },
    ],
  },
  {
    id: 'clean-enrich',
    label: 'Clean & Enrich',
    tagline: 'Clear, restore, and strengthen your outdoor spaces.',
    icon: (
      <svg className="w-7 h-7 stroke-np-green fill-none stroke-2" viewBox="0 0 24 24">
        <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
      </svg>
    ),
    services: [
      { to: '/CleanLawn/leaf-removal',     title: 'Leaf Removal & Yard Cleanup', desc: 'Complete leaf clearing, gutter cleaning, and seasonal yard cleanup with full haul-away.' },
      { to: '/CleanLawn/sod-installation', title: 'Sod Installation',             desc: 'Instant lawn from premium, locally grown sod — site-prepped, precisely laid, and ready to walk on.' },
      { to: '/CleanLawn/mulching',         title: 'Mulching',                     desc: 'Fresh mulch application that suppresses weeds, retains moisture, and defines your beds beautifully.' },
      { to: '/CleanLawn/brush-clearing',   title: 'Brush Clearing',               desc: 'Overgrowth removal, underbrush cutting, and lot reclamation with full debris disposal.' },
      { to: '/CleanLawn/stump-grinding',   title: 'Stump Grinding / Removal',     desc: 'Grind stumps below grade and level the area — ready for sod, seed, or new plantings.' },
      { to: '/CleanLawn/snow-removal',     title: 'Snow Removal',                 desc: 'Seasonal driveway plowing, walkway shoveling, and de-icing — auto-dispatch after every storm.' },
    ],
  },
  {
    id: 'design-installation',
    label: 'Design & Installation',
    tagline: 'Expert design and permanent improvements for your landscape.',
    icon: (
      <svg className="w-7 h-7 stroke-np-green fill-none stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="5"/><path d="M12 13v9M9 22h6"/>
      </svg>
    ),
    services: [
      { to: '/CleanLawn/irrigation',         title: 'Irrigation System Installation & Repair', desc: 'Custom zone design, professional installation, smart controllers, and full repair service.' },
      { to: '/CleanLawn/landscaping-design', title: 'Landscaping & Garden Design',             desc: 'Custom landscape plans, plant selection and installation, hardscaping, and ongoing care.' },
    ],
  },
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
          <span className="text-np-lite">CleanLawn</span> — Every Service Your Lawn Needs.
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mt-5">
          From routine mowing to full landscape transformations — browse our services, book online, and let local pros handle the rest.
        </p>
        <div className="flex gap-3.5 flex-wrap justify-center mt-9">
          <Link to="/quote"
            className="bg-np-accent text-np-dark font-extrabold text-base px-8 py-3.5 rounded-full no-underline hover:bg-np-lite transition-all">
            Get a Free Quote
          </Link>
          <a href="#cuts-trims"
            className="border-2 border-white/50 text-white font-bold text-base px-7 py-3.5 rounded-full no-underline hover:border-np-lite hover:text-np-lite transition-all">
            Browse Services
          </a>
          <Link to="/CleanLawn/provider/signup"
            className="border-2 border-white/50 text-white font-bold text-base px-7 py-3.5 rounded-full no-underline hover:border-np-lite hover:text-np-lite transition-all">
            Join as a Provider
          </Link>
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      {CATEGORIES.map((cat, i) => (
        <section
          key={cat.id}
          id={cat.id}
          className={`px-[8%] py-20 ${i % 2 === 0 ? 'bg-np-surface' : 'bg-white'}`}
        >
          {/* Category header */}
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-np-lite/30 flex items-center justify-center flex-shrink-0">
              {cat.icon}
            </div>
            <div>
              <p className="pg-label mb-0">{cat.label}</p>
              <p className="text-np-muted text-sm">{cat.tagline}</p>
            </div>
          </div>
          <h2 className="pg-title mb-10">{cat.label}</h2>

          {/* Service cards */}
          <div className="service-grid">
            {cat.services.map(s => (
              <Link key={s.to} to={s.to} className="service-card no-underline">
                <h3 className="text-np-dark font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-np-muted text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="text-np-accent text-sm font-semibold">Book now &rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* PROVIDER CTA */}
      <section className="bg-np-dark text-white px-[8%] py-20">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-2">For Professionals</p>
            <h2 className="text-white text-3xl font-extrabold mb-4">
              Grow Your Lawn Care Business
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Join the CleanLawn provider network. Get matched with customers in your area, manage your schedule, and grow your revenue — all from one dashboard.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/CleanLawn/provider/signup"
                className="bg-np-accent text-np-dark font-extrabold px-7 py-3 rounded-full no-underline hover:bg-np-lite transition-all">
                Join as a Provider
              </Link>
              {user?.role === 'provider' ? (
                <Link to="/CleanLawn/provider"
                  className="border-2 border-white/50 text-white font-bold px-6 py-3 rounded-full no-underline hover:border-np-lite hover:text-np-lite transition-all">
                  My Dashboard
                </Link>
              ) : (
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

      {/* HOMEOWNER FEATURES */}
      <section className="bg-np-surface px-[8%] py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="pg-label">Homeowner Portal</p>
            <h2 className="pg-title">Everything You Need to Manage Your Lawn Care</h2>
            <p className="text-np-muted max-w-xl mx-auto">
              Create a free account to unlock the full CleanLawn homeowner experience — from quote requests to recurring schedules to real-time messaging.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { icon: '📋', title: 'Quote Requests', desc: 'Get competitive bids from multiple local providers in minutes. Describe your project, upload photos, and compare offers.' },
              { icon: '🔍', title: 'Discover Providers', desc: 'Browse top-rated professionals by service type, location, and reviews. Filter by availability and specialty.' },
              { icon: '🗓️', title: 'Job Management', desc: 'Track upcoming, in-progress, and completed jobs all in one place. Cancel or reschedule with a click.' },
              { icon: '🔁', title: 'Recurring Scheduling', desc: 'Set up weekly, biweekly, or monthly service plans. Pause, resume, or cancel at any time.' },
              { icon: '✉️', title: 'In-app Messaging', desc: 'Chat directly with your provider before and after service. All messages are saved for your records.' },
              { icon: '⭐', title: 'Reviews & Ratings', desc: 'Leave honest reviews and see before/after photos. Your feedback helps the best pros rise to the top.' },
              { icon: '🏡', title: 'Property Profiles', desc: 'Save multiple properties with lot size, terrain notes, and access instructions for faster quoting.' },
              { icon: '👤', title: 'Account & Profile', desc: 'Manage your name, phone, email, and password. Sign up with email or use Google/Facebook login.' },
              { icon: '🔔', title: 'Notifications', desc: 'Get notified when a new quote arrives, your job is confirmed, or your provider is on the way.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-np-border p-5 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-np-dark mb-1.5">{f.title}</h3>
                <p className="text-np-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            {user ? (
              <Link to="/CleanLawn/homeowner"
                className="btn-primary text-base px-8 py-3.5 inline-block">
                Go to My Portal
              </Link>
            ) : (
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/signup" className="btn-primary text-base px-8 py-3.5">Create Free Account</Link>
                <Link to="/login" className="btn-outline text-base px-8 py-3.5">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="cta-section">
        <h2>Ready for a Cleaner, Healthier Lawn?</h2>
        <p>Browse our services and get a free quote from a local CleanLawn professional today.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
          <Link to="/CleanLawn/provider/signup" className="btn-outline text-base px-8 py-4">Join as a Provider</Link>
        </div>
      </section>
    </>
  );
}
