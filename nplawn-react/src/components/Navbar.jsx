import { useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Lawn Care',
    links: [
      { to: '/lawn-care',       label: 'Lawn Care' },
      { to: '/tree-trimming',   label: 'Tree Trimming' },
      { to: '/tree-shrubs',     label: 'Tree & Shrubs' },
      { to: '/landscape-design',label: 'Landscape Design' },
    ],
  },
  {
    label: 'Lawn Maintenance',
    links: [
      { to: '/mowing',          label: 'Mowing' },
      { to: '/aeration-seeding',label: 'Aeration & Seeding' },
    ],
  },
  {
    label: 'Learn',
    links: [
      { to: '/grass-guide',     label: 'Grass Guide' },
      { to: '/blog',            label: 'Blog' },
      { to: '/faq',             label: 'FAQ' },
    ],
  },
  {
    label: 'About',
    links: [
      { to: '/about',           label: 'About Us' },
    ],
  },
];

function DropdownGroup({ group }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef(null);

  const show = () => { clearTimeout(timeout.current); setOpen(true); };
  const hide = () => { timeout.current = setTimeout(() => setOpen(false), 120); };

  const isGroupActive = group.links.some(l =>
    window.location.pathname === l.to || window.location.pathname.startsWith(l.to + '/')
  );

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className={`text-sm font-medium transition-colors flex items-center gap-1 ${
          isGroupActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'
        }`}
      >
        {group.label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-np-dark border border-white/10 rounded-xl shadow-xl py-1 min-w-[160px] z-50">
          {group.links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onMouseEnter={show}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition-colors ${isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-np-dark backdrop-blur-md px-[5%] flex items-center justify-between h-16 shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-np-lite to-np-accent flex items-center justify-center">
          <svg className="w-5 h-5 fill-np-dark" viewBox="0 0 24 24">
            <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
          </svg>
        </div>
        <span className="text-white font-extrabold text-lg tracking-tight">
          NP<em className="text-np-lite not-italic">Lawn</em> LLC
        </span>
      </Link>

      {/* Desktop grouped nav */}
      <div className="hidden lg:flex items-center gap-6">
        {NAV_GROUPS.map(group => (
          <DropdownGroup key={group.label} group={group} />
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/account" className="hidden md:block text-white/60 text-sm hover:text-np-lite transition-colors">{user.email}</Link>
            <Link to="/account" className="hidden md:inline text-np-lite text-sm font-semibold hover:text-white transition-colors">My Orders</Link>
            <button onClick={handleLogout}
              className="text-white/50 text-sm font-semibold hover:text-white transition-colors">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-np-lite text-sm font-semibold hover:text-white transition-colors">
            Login
          </Link>
        )}
        <Link to="/order" className="btn-primary text-sm px-4 py-2 hidden md:inline-block">
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
        <div className="absolute top-16 left-0 right-0 bg-np-dark border-t border-white/10 p-4 flex flex-col gap-1 lg:hidden">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                className="w-full flex items-center justify-between py-2 text-sm font-semibold text-white/50 uppercase tracking-widest text-xs"
              >
                {group.label}
                <svg className={`w-3 h-3 transition-transform ${expandedGroup === group.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedGroup === group.label && (
                <div className="flex flex-col gap-1 pl-3 border-l border-white/10 mb-2">
                  {group.links.map(l => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `text-sm font-medium py-1.5 transition-colors ${isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'}`
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          {user && (
            <Link to="/account" onClick={() => setOpen(false)} className="text-sm font-medium py-1 text-np-lite hover:text-white transition-colors">
              My Orders
            </Link>
          )}
          <Link to="/order" onClick={() => setOpen(false)} className="btn-primary text-center mt-2">
            Get a Quote
          </Link>
        </div>
      )}
    </nav>
  );
}
