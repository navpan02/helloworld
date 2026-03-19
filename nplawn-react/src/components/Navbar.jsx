import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Simple flat dropdown groups
const SIMPLE_GROUPS = [
  {
    label: 'Lawn Care',
    links: [
      { to: '/lawn-care',              label: 'Lawn Care Plans' },
      { to: '/tree-shrubs',            label: 'Tree & Shrub Plans' },
      { to: '/CleanLawn/aeration-seeding', label: 'Aeration & Seeding' },
    ],
  },
  {
    label: 'Learn',
    links: [
      { to: '/grass-guide', label: 'Grass Guide' },
      { to: '/blog',        label: 'Blog' },
      { to: '/faq',         label: 'FAQ' },
    ],
  },
  {
    label: 'About',
    links: [
      { to: '/about', label: 'About Us' },
    ],
  },
];

// CleanLawn mega-menu groups
const CLEANLAWN_GROUPS = [
  {
    label: 'Cuts & Trims',
    links: [
      { to: '/CleanLawn/mowing',        label: 'Lawn Mowing' },
      { to: '/CleanLawn/tree-trimming', label: 'Tree Trimming & Pruning' },
      { to: '/CleanLawn/hedge-trimming',label: 'Hedge Trimming' },
    ],
  },
  {
    label: 'Clean & Enrich',
    links: [
      { to: '/CleanLawn/leaf-removal',     label: 'Leaf Removal & Yard Cleanup' },
      { to: '/CleanLawn/sod-installation', label: 'Sod Installation' },
      { to: '/CleanLawn/mulching',         label: 'Mulching' },
      { to: '/CleanLawn/brush-clearing',   label: 'Brush Clearing' },
      { to: '/CleanLawn/stump-grinding',   label: 'Stump Grinding / Removal' },
      { to: '/CleanLawn/snow-removal',     label: 'Snow Removal' },
    ],
  },
  {
    label: 'Design & Installation',
    links: [
      { to: '/CleanLawn/irrigation',         label: 'Irrigation System Installation & Repair' },
      { to: '/CleanLawn/landscaping-design', label: 'Landscaping & Garden Design' },
    ],
  },
];

function SimpleDropdown({ group }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef(null);

  const show = () => { clearTimeout(timeout.current); setOpen(true); };
  const hide = () => { timeout.current = setTimeout(() => setOpen(false), 120); };

  const isActive = group.links.some(l =>
    window.location.pathname === l.to || window.location.pathname.startsWith(l.to + '/')
  );

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${
        isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'
      }`}>
        {group.label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-np-dark border border-white/10 rounded-xl shadow-xl py-1 min-w-[180px] z-50"
          onMouseEnter={show} onMouseLeave={hide}>
          {group.links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition-colors ${isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'}`
              }>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function CleanLawnDropdown() {
  const [open, setOpen] = useState(false);
  const timeout = useRef(null);

  const show = () => { clearTimeout(timeout.current); setOpen(true); };
  const hide = () => { timeout.current = setTimeout(() => setOpen(false), 120); };

  const isActive = window.location.pathname.startsWith('/CleanLawn');

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${
        isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'
      }`}>
        CleanLawn Marketplace
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-np-dark border border-white/10 rounded-2xl shadow-2xl z-50"
          style={{ width: '560px' }}
          onMouseEnter={show} onMouseLeave={hide}>

          {/* Top link to CleanLawn home */}
          <div className="px-5 pt-4 pb-3 border-b border-white/10">
            <Link to="/CleanLawn"
              className="text-np-lite font-bold text-sm hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              CleanLawn Marketplace Home
            </Link>
          </div>

          {/* 3-column category grid */}
          <div className="grid grid-cols-3 gap-0 p-4">
            {CLEANLAWN_GROUPS.map(g => (
              <div key={g.label} className="px-3">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">{g.label}</p>
                <div className="flex flex-col gap-0.5">
                  {g.links.map(l => (
                    <NavLink key={l.to} to={l.to}
                      className={({ isActive }) =>
                        `text-sm py-1.5 leading-tight transition-colors ${isActive ? 'text-np-lite font-semibold' : 'text-white/70 hover:text-np-lite'}`
                      }>
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Find Providers link */}
          <div className="px-5 pb-4 pt-2 border-t border-white/10">
            <Link to="/discover"
              className="text-np-lite font-bold text-sm hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Find & Browse Providers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen]           = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const { pathname }              = useLocation();

  useEffect(() => {
    setOpen(false);
    setExpandedGroup(null);
  }, [pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  // All groups for mobile — flatten CleanLawn into sections
  const mobileGroups = [
    SIMPLE_GROUPS[0], // Lawn Care
    {
      label: 'CleanLawn Marketplace',
      sections: CLEANLAWN_GROUPS,
    },
    ...SIMPLE_GROUPS.slice(1), // Learn, About
  ];

  return (
    <nav className="sticky top-0 z-50 bg-np-dark backdrop-blur-md px-[5%] flex items-center justify-between h-16 shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-np-lite to-np-accent flex items-center justify-center">
          <svg className="w-5 h-5 fill-np-dark" viewBox="0 0 24 24">
            <path d="M12 20V10C12 6 9 3 5 4c1 4 4 7 7 7" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 20V12C12 8 15 5 19 6c-1 4-4 7-7 7" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 20V14C9 11 7 9 4 9.5c.5 3 2.5 5.5 5 5.5" stroke="#1a2e1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="4" y1="20" x2="20" y2="20" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-white font-extrabold text-lg tracking-tight">
          NP<em className="text-np-lite not-italic">Lawn</em> LLC
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden lg:flex items-center gap-6">
        <SimpleDropdown group={SIMPLE_GROUPS[0]} />
        <CleanLawnDropdown />
        <SimpleDropdown group={SIMPLE_GROUPS[1]} />
        <SimpleDropdown group={SIMPLE_GROUPS[2]} />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/account" className="hidden md:block text-white/60 text-sm hover:text-np-lite transition-colors">{user.email}</Link>
            {user.role === 'provider' ? (
              <Link to="/CleanLawn/provider" className="hidden md:inline text-np-lite text-sm font-semibold hover:text-white transition-colors">Provider Portal</Link>
            ) : (
              <Link to="/account" className="hidden md:inline text-np-lite text-sm font-semibold hover:text-white transition-colors">My Orders</Link>
            )}
            <button onClick={handleLogout} className="text-white/50 text-sm font-semibold hover:text-white transition-colors">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-np-lite text-sm font-semibold hover:text-white transition-colors">
            Login
          </Link>
        )}
        <Link to="/quote" className="btn-primary text-sm px-4 py-2 hidden md:inline-block">
          Get a Quote
        </Link>
        {/* Mobile hamburger */}
        <button className="lg:hidden text-white p-1" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-np-dark border-t border-white/10 p-4 flex flex-col gap-1 lg:hidden max-h-[80vh] overflow-y-auto">
          {mobileGroups.map(group => (
            <div key={group.label}>
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold text-white/50 uppercase tracking-widest">
                {group.label}
                <svg className={`w-3 h-3 transition-transform ${expandedGroup === group.label ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedGroup === group.label && (
                <div className="flex flex-col gap-0.5 pl-3 border-l border-white/10 mb-2">
                  {/* CleanLawn has nested sections */}
                  {group.sections ? (
                    <>
                      <NavLink to="/CleanLawn" onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `text-sm font-medium py-1.5 transition-colors ${isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'}`
                        }>
                        CleanLawn Home
                      </NavLink>
                      <NavLink to="/discover" onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `text-sm font-medium py-1.5 transition-colors ${isActive ? 'text-np-lite' : 'text-np-lite/70 hover:text-np-lite'}`
                        }>
                        Find &amp; Browse Providers
                      </NavLink>
                      {group.sections.map(section => (
                        <div key={section.label} className="mt-2">
                          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">{section.label}</p>
                          {section.links.map(l => (
                            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                              className={({ isActive }) =>
                                `block text-sm py-1 pl-2 transition-colors ${isActive ? 'text-np-lite' : 'text-white/70 hover:text-np-lite'}`
                              }>
                              {l.label}
                            </NavLink>
                          ))}
                        </div>
                      ))}
                    </>
                  ) : (
                    group.links.map(l => (
                      <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `text-sm font-medium py-1.5 transition-colors ${isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'}`
                        }>
                        {l.label}
                      </NavLink>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          {user && (
            <Link to="/account" onClick={() => setOpen(false)}
              className="text-sm font-medium py-1 text-np-lite hover:text-white transition-colors">
              My Orders
            </Link>
          )}
          <Link to="/quote" onClick={() => setOpen(false)} className="btn-primary text-center mt-2">
            Get a Quote
          </Link>
        </div>
      )}
    </nav>
  );
}
