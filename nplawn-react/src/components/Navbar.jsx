import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',                label: 'Home' },
  { to: '/lawn-care',       label: 'Lawn Care' },
  { to: '/mowing',          label: 'Mowing' },
  { to: '/tree-trimming',   label: 'Tree Trimming' },
  { to: '/tree-shrubs',     label: 'Tree & Shrubs' },
  { to: '/aeration-seeding',label: 'Aeration' },
  { to: '/landscape-design',label: 'Design' },
  { to: '/blog',            label: 'Blog' },
  { to: '/about',           label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-np-dark/96 backdrop-blur-md px-[5%] flex items-center justify-between h-16 shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
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

      {/* Desktop links */}
      <div className="hidden lg:flex items-center gap-6">
        {NAV_LINKS.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden md:block text-white/60 text-sm">{user.email}</span>
            <button onClick={handleLogout}
              className="text-np-lite text-sm font-semibold hover:text-white transition-colors">
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
        <div className="absolute top-16 left-0 right-0 bg-np-dark border-t border-white/10 p-4 flex flex-col gap-3 lg:hidden">
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium py-1 transition-colors ${isActive ? 'text-np-lite' : 'text-white/80 hover:text-np-lite'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/order" onClick={() => setOpen(false)} className="btn-primary text-center mt-2">
            Get a Quote
          </Link>
        </div>
      )}
    </nav>
  );
}
