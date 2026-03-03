import { Link } from 'react-router-dom';

const SERVICES = [
  { to: '/mowing',          label: 'Lawn Mowing' },
  { to: '/tree-trimming',   label: 'Tree Trimming' },
  { to: '/lawn-care',       label: 'Lawn Care Plans' },
  { to: '/tree-shrubs',     label: 'Tree & Shrubs' },
  { to: '/aeration-seeding',label: 'Aeration & Seeding' },
  { to: '/landscape-design',label: 'Landscape Design' },
];

const COMPANY = [
  { to: '/about',          label: 'About Us' },
  { to: '/blog',           label: 'Blog' },
  { to: '/contact',        label: 'Contact' },
  { to: '/lawn-care#plans',label: 'View Plans' },
  { to: '/order',          label: 'Order Online' },
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
          <Link to="/contact" className="footer-cta-link">Get a Free Quote &rarr;</Link>
        </div>

        {/* Services */}
        <div>
          <h4 className="footer-heading">Services</h4>
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
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 <strong className="text-white/60">NPLawn LLC</strong>. All rights reserved. &nbsp;&bull;&nbsp; Proudly serving our community.</p>
      </div>
    </footer>
  );
}
