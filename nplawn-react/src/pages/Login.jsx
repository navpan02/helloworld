import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { findUser } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState('');
  const { user, login }         = useAuth();
  const navigate                = useNavigate();
  const [params]                = useSearchParams();

  useEffect(() => {
    if (params.get('registered') === '1') {
      setToast('Account verified! You can now log in.');
      setTimeout(() => setToast(''), 4000);
    }
  }, [params]);

  // If already logged in as admin, show dashboard
  if (user?.role === 'admin') return <AdminDashboard />;

  // If logged in as regular user, redirect
  if (user) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const found = await findUser(email, password);
      if (!found) {
        setError('Invalid email or password.');
      } else if (found.error === 'unverified') {
        setError('Please verify your email before logging in.');
      } else {
        login(found);
        navigate(found.role === 'admin' ? '/login' : '/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-mono"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,45,120,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,255,159,0.10) 0%, transparent 60%), #07000f',
        boxShadow: 'inset 0 0 120px rgba(0,0,0,0.7)',
      }}>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cp-card border border-cp-green/50 text-cp-green px-6 py-3 rounded text-sm shadow-cp-green z-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          {toast}
        </div>
      )}

      <div className="relative w-full max-w-[440px] mx-4"
        style={{
          background: '#0d0018',
          border: '1px solid rgba(0,255,159,0.35)',
          borderRadius: '4px',
          boxShadow: '0 0 0 1px rgba(0,255,159,0.08) inset, 0 0 40px rgba(0,255,159,0.08), 0 32px 64px rgba(0,0,0,0.7)',
        }}>

        {/* Card Header */}
        <div className="relative px-10 pt-10 pb-7 overflow-hidden"
          style={{ borderBottom: '1px solid rgba(0,255,159,0.15)' }}>
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,255,159,0.04) 3px, rgba(0,255,159,0.04) 4px)',
              animation: 'scanFlicker 0.08s steps(1) infinite',
            }} />

          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 rounded flex items-center justify-center"
              style={{ background: 'rgba(0,255,159,0.10)', border: '1px solid rgba(0,255,159,0.3)' }}>
              <svg className="w-5 h-5" style={{ stroke: '#00ff9f', fill: 'none', strokeWidth: 1.5 }} viewBox="0 0 24 24">
                <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'VT323, monospace', fontSize: '1.5rem', color: '#00ff9f', letterSpacing: '2px' }}>
                NPLAWN LLC
              </div>
              <div className="text-[10px] tracking-[3px]" style={{ color: 'rgba(0,255,159,0.5)' }}>
                SECURE PORTAL v2.1
              </div>
            </div>
          </div>

          <div className="h-px relative z-10" style={{ background: 'rgba(0,255,159,0.2)' }} />
          <div className="flex justify-between text-[9px] mt-1 relative z-10" style={{ color: 'rgba(0,255,159,0.35)', letterSpacing: '1.5px', fontFamily: 'Share Tech Mono, monospace' }}>
            <span>SYSTEM ONLINE</span>
            <span style={{ color: '#00ff9f' }}>◉ CONNECTED</span>
          </div>
        </div>

        {/* Form */}
        <div className="px-10 pt-8">
          <div className="mb-6 text-[10px] tracking-[2px]" style={{ color: 'rgba(0,255,159,0.5)', fontFamily: 'Share Tech Mono, monospace' }}>
            AUTHENTICATION REQUIRED
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CpField label="IDENTIFIER" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="user@domain.com" />
            <CpField label="PASSKEY" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

            {error && (
              <div className="text-xs py-2 px-3 rounded text-center"
                style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)', color: '#ff2d78', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.5px' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 text-sm font-bold tracking-[2px] uppercase rounded transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,159,0.15), rgba(0,255,159,0.05))',
                border: '1px solid rgba(0,255,159,0.5)',
                color: '#00ff9f',
                fontFamily: 'Share Tech Mono, monospace',
                boxShadow: '0 0 8px rgba(0,255,159,0.15)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
            </button>
          </form>

          <div className="flex justify-between text-xs mt-6 pb-8"
            style={{ color: 'rgba(0,255,159,0.4)', fontFamily: 'Share Tech Mono, monospace' }}>
            <Link to="/signup"
              className="transition-colors hover:text-cp-green"
              style={{ color: 'rgba(0,255,159,0.4)' }}>
              [ CREATE ACCOUNT ]
            </Link>
            <span style={{ color: 'rgba(0,255,159,0.25)' }}>NPLAWN © 2026</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanFlicker {
          0%  { opacity: 1; }
          25% { opacity: 0.85; }
          50% { opacity: 1; }
          75% { opacity: 0.9; }
          100%{ opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function CpField({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[2px] mb-1.5"
        style={{ color: 'rgba(0,255,159,0.5)', fontFamily: 'Share Tech Mono, monospace' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-4 py-2.5 text-sm rounded outline-none transition-all"
        style={{
          background: 'rgba(0,255,159,0.05)',
          border: '1px solid rgba(0,255,159,0.2)',
          color: '#00ff9f',
          fontFamily: 'Share Tech Mono, monospace',
          letterSpacing: '0.5px',
        }}
        onFocus={e => {
          e.target.style.border = '1px solid rgba(0,255,159,0.6)';
          e.target.style.boxShadow = '0 0 8px rgba(0,255,159,0.2)';
        }}
        onBlur={e => {
          e.target.style.border = '1px solid rgba(0,255,159,0.2)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
