import { Link } from 'react-router-dom';

const SERVICES = [
  { to: '/lawn-care',                    label: 'Lawn Care Plans' },
  { to: '/tree-shrubs',                  label: 'Tree & Shrub Plans' },
  { to: '/CleanLawn/aeration-seeding',   label: 'Aeration & Seeding' },
];

const CLEANLAWN = [
  { to: '/CleanLawn',                       label: 'CleanLawn Home' },
  { to: '/discover',                        label: 'Find Providers' },
  { to: '/CleanLawn/mowing',                label: 'Lawn Mowing' },
  { to: '/CleanLawn/hedge-trimming',        label: 'Hedge Trimming' },
  { to: '/CleanLawn/leaf-removal',          label: 'Leaf Removal' },
  { to: '/CleanLawn/sod-installation',      label: 'Sod Installation' },
  { to: '/CleanLawn/mulching',              label: 'Mulching' },
  { to: '/CleanLawn/snow-removal',          label: 'Snow Removal' },
  { to: '/CleanLawn/irrigation',            label: 'Irrigation Systems' },
  { to: '/CleanLawn/landscaping-design',    label: 'Landscaping & Design' },
  { to: '/CleanLawn/provider/signup',       label: 'Join as a Provider' },
  { to: '/CleanLawn/provider',              label: 'Provider Portal' },
];

const COMPANY = [
  { to: '/about',            label: 'About Us' },
  { to: '/blog',             label: 'Blog' },
  { to: '/faq',              label: 'FAQ' },
  { to: '/grass-guide',      label: 'Grass Type Guide' },
  { to: '/contact',          label: 'Contact' },
  { to: '/support',          label: 'Customer Support' },
  { to: '/careers',          label: 'Careers' },
  { to: '/newsroom',         label: 'Newsroom' },
  { to: '/lawn-care#plans',  label: 'View Plans' },
  { to: '/order',            label: 'Order Online' },
  { to: '/route-planner',    label: 'Route Planner' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo-wrap">
            <div className="footer-logo-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
              </svg>
            </div>
            <span className="footer-logo-name">NP<em>Lawn</em> LLC</span>
          </Link>
          <p className="footer-tagline">
            Professional lawn care and landscaping — trusted by hundreds of homeowners.
            Locally owned and operated since 2017.
          </p>
          <Link to="/quote" className="footer-cta-link">Get a Free Quote &rarr;</Link>
        </div>

        {/* Services */}
        <div>
          <h4 className="footer-heading">Lawn Care</h4>
          <ul className="footer-links">
            {SERVICES.map(s => (
              <li key={s.to}><Link to={s.to}>{s.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            {COMPANY.map(c => (
              <li key={c.to}><Link to={c.to}>{c.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* CleanLawn */}
        <div>
          <h4 className="footer-heading">CleanLawn</h4>
          <ul className="footer-links">
            {CLEANLAWN.map(c => (
              <li key={c.to}><Link to={c.to}>{c.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 <strong className="text-white/60">NPLawn LLC</strong>. All rights reserved. &nbsp;&bull;&nbsp; Proudly serving our community.</p>
      </div>
    </footer>
  );
}
