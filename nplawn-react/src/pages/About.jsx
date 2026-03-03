import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Nathan P.', role: 'Founder & Lead Horticulturalist', bio: 'Certified arborist and landscape designer with 15+ years in the industry. Started NPLawn in 2017 with a pickup truck and a passion for healthy turf.' },
  { name: 'Maria C.', role: 'Operations Manager', bio: 'Keeps the crew on schedule and clients informed. Knows every property by name and makes sure every detail is right before we leave.' },
  { name: 'Derek W.', role: 'Senior Technician', bio: 'Lawn care specialist with expertise in organic programs and soil health. He\'s the person behind our GrassNatural results.' },
];

const VALUES = [
  { title: 'Honesty First',       desc: 'We tell you what your lawn actually needs — not what generates the biggest invoice.' },
  { title: 'Local Expertise',     desc: 'We know Chicagoland soil, climate, and grass types better than any national chain.' },
  { title: 'Consistent Quality',  desc: 'Same standards, same crew leads on your property every visit. No surprises.' },
  { title: 'Environmental Care',  desc: 'We prioritize organic treatments, native plants, and practices that protect local ecosystems.' },
];

export default function About() {
  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="page-hero-icon mx-auto mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 stroke-np-lite fill-none stroke-[1.5]" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div className="page-hero-badge">Our Story</div>
        <h1>Lawn Care You Can<br/>Actually Trust</h1>
        <p>NPLawn LLC started as a one-person operation in 2017. Today we're a full-service team serving hundreds of properties across Naperville and surrounding communities.</p>
      </section>

      {/* STORY */}
      <section className="pg-section white">
        <div className="max-w-3xl mx-auto">
          <p className="pg-label">How We Got Here</p>
          <h2 className="pg-title">From One Truck to a Full Team</h2>
          <div className="space-y-4 text-np-muted leading-relaxed">
            <p>NPLawn started with a simple idea: homeowners deserve better than the national lawn care companies that show up with generic programs, treat every yard the same, and rotate technicians so often you never see the same face twice.</p>
            <p>Nathan P. founded NPLawn in 2017 after spending a decade as a certified arborist and landscape consultant. He saw too many lawns damaged by cookie-cutter approaches and too many homeowners paying for treatments their soil didn't need — or missing treatments it desperately did.</p>
            <p>Today, NPLawn serves over 500 residential and commercial properties with a team of certified horticulturalists, arborists, and lawn care specialists. We're still locally owned, still community-focused, and still committed to the same honest advice Nathan started with.</p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">What Drives Us</p>
        <h2 className="pg-title">Our Core Values</h2>
        <div className="service-grid mt-8">
          {VALUES.map(v => (
            <div key={v.title} className="bg-white rounded-2xl p-6 border border-np-border shadow-np">
              <div className="w-2 h-2 rounded-full bg-np-accent mb-4" />
              <h3 className="text-np-dark font-bold text-lg mb-2">{v.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="pg-section white">
        <p className="pg-label">The People</p>
        <h2 className="pg-title">Meet the Team</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {TEAM.map(m => (
            <div key={m.name} className="bg-np-surface rounded-2xl p-6 border border-np-border">
              <div className="w-16 h-16 rounded-full bg-np-dark flex items-center justify-center mb-4">
                <svg className="w-8 h-8 stroke-np-lite fill-none stroke-[1.5]" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div className="font-bold text-np-dark text-lg">{m.name}</div>
              <div className="text-np-accent text-xs font-semibold tracking-wide uppercase mb-3">{m.role}</div>
              <p className="text-np-muted text-sm leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Want to Work With Our Team?</h2>
        <p>Reach out for a free consultation. No pressure, no sales pitch — just honest lawn care advice.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Contact Us</Link>
      </section>
    </>
  );
}
