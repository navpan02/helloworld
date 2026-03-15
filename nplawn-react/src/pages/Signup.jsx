import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpUser, authErrorMessage } from '../utils/auth';

function pwStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'];

export default function SignupPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const strength = pwStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    const { error: err } = await signUpUser({ email, password, role: 'user' });
    setLoading(false);

    if (err) { setError(authErrorMessage(err)); return; }

    navigate('/login?registered=1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
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
          <p className="text-white/60 text-sm">Create your account</p>
        </div>

        <div className="px-8 py-7">
          <form onSubmit={handleRegister} className="space-y-4">
            <Field label="Email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

            <div>
              <Field label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: strength >= i ? STRENGTH_COLORS[strength] : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: STRENGTH_COLORS[strength] }}>
                    {STRENGTH_LABELS[strength]}
                  </span>
                </div>
              )}
            </div>

            <Field label="Confirm Password" type="password" value={confirm}
              onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />

            {error && (
              <div className="text-sm py-2 px-3 rounded-lg text-center bg-red-50 border border-red-200 text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors duration-150 text-sm mt-1"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-1">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                Sign in
              </Link>
            </p>

            <p className="text-center text-sm text-gray-500">
              <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
                ← Back to Home
              </Link>
            </p>
          </form>
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
