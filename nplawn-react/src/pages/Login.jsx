import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInUser, authErrorMessage } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

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
      setToast('Account created! You can now log in.');
      setTimeout(() => setToast(''), 4000);
    }
  }, [params]);

  // Navigate after login — honour ?next= param set by RequireAuth
  useEffect(() => {
    if (!user) return;
    const next = params.get('next');
    if (next) { navigate(decodeURIComponent(next), { replace: true }); return; }
    const isAdmin = user.role === 'admin' || user.email === 'admin@admin.com';
    if (isAdmin)                       navigate('/admin');
    else if (user.role === 'provider') navigate('/CleanLawn/provider');
    else                               navigate('/');
  }, [user, navigate, params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: err } = await signInUser({ email, password });
      if (err) setError(authErrorMessage(err));
      else     login(data.user);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-green-200 text-green-700 px-6 py-3 rounded-lg text-sm shadow-lg z-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          {toast}
        </div>
      )}

      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-md overflow-hidden">

        {/* Header */}
        <div className="bg-np-dark px-8 py-7 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-6 h-6 stroke-np-lite fill-none" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
            </svg>
            <span className="text-xl font-bold tracking-wide">
              <span className="text-white">NP</span>
              <em className="text-np-lite not-italic">Lawn</em>
              <span className="text-white"> LLC</span>
            </span>
          </div>
          <p className="text-white/60 text-sm">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

            {error && (
              <div className="text-sm py-2 px-3 rounded-lg text-center bg-red-50 border border-red-200 text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors duration-150 text-sm mt-1"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 hover:text-green-700 font-medium">
              Create one
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-1.5">Are you a lawn care professional?</p>
            <Link to="/CleanLawn/provider/signup"
              className="inline-block text-sm font-semibold text-np-green hover:text-np-mid transition-colors">
              Register as a Provider →
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
              ← Back to Home
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-gray-300 pb-4">© 2026 NPLawn LLC</div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
      />
    </div>
  );
}
