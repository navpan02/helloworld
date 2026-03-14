import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpUser, verifyEmailOtp, resendConfirmation, authErrorMessage, signInWithGoogle, signInWithFacebook } from '../utils/auth';

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
  const [step, setStep]         = useState('register');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [otp, setOtp]           = useState(['','','','','','']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const strength = pwStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    const { data, error: err } = await signUpUser({ email, password, role: 'user' });
    setLoading(false);

    if (err) { setError(authErrorMessage(err)); return; }

    // Skip email verification — redirect directly to login
    navigate('/login?registered=1');
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const t = setInterval(() => {
      setResendTimer(v => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; });
    }, 1000);
  };

  const handleOtpChange = (i, val) => {
    val = val.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp([...pasted.padEnd(6, '').split('').slice(0, 6)]);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setOtpError('');
    const token = otp.join('');
    if (token.length < 6) { setOtpError('Enter the full 6-digit code.'); return; }
    setLoading(true);
    const { error: err } = await verifyEmailOtp({ email, token });
    setLoading(false);
    if (err) { setOtpError('Incorrect or expired code. Please try again.'); return; }
    navigate('/login?registered=1');
  };

  const handleResend = async () => {
    const { error: err } = await resendConfirmation(email);
    if (!err) startResendTimer();
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
          <p className="text-white/60 text-sm">
            {step === 'register' ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        <div className="px-8 py-7">
          {step === 'register' ? (
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

              {/* Social login */}
              <div>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or sign up with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-2 mt-2">
                  <button type="button" onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" onClick={signInWithFacebook}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>

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
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                A 6-digit code was sent to <strong className="text-gray-800">{email}</strong>.
                Enter it below to activate your account.
              </p>

              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                    ref={el => otpRefs.current[i] = el}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-2xl font-bold rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-gray-800"
                  />
                ))}
              </div>

              {otpError && (
                <div className="text-sm py-2 px-3 rounded-lg text-center bg-red-50 border border-red-200 text-red-600">
                  {otpError}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors duration-150 text-sm"
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Verifying…' : 'Verify & Activate'}
              </button>

              <p className="text-center text-sm text-gray-500">
                {resendTimer > 0
                  ? `Resend available in ${resendTimer}s`
                  : <button type="button" onClick={handleResend}
                      className="text-green-600 hover:text-green-700 font-medium">
                      Resend code
                    </button>}
              </p>

              <p className="text-center text-sm text-gray-500">
                <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
                  ← Back to Home
                </Link>
              </p>
            </form>
          )}
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
