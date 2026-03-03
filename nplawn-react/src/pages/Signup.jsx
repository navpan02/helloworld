import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sha256, getRegisteredUsers, saveRegisteredUsers, RESERVED_EMAILS } from '../utils/auth';

const EMAILJS_PUBLIC_KEY  = '';
const EMAILJS_SERVICE_ID  = '';
const EMAILJS_TEMPLATE_ID = '';
const EMAIL_CONFIGURED = !!(EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function pwStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ff2d78', '#f5e642', '#74c69d', '#00ff9f'];

export default function SignupPage() {
  const [step, setStep]         = useState('register'); // 'register' | 'verify'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [otp, setOtp]           = useState(['','','','','','']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const strength = pwStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const lc = email.toLowerCase().trim();

    if (RESERVED_EMAILS.includes(lc)) {
      setError('This email is already in use. Please log in.');
      return;
    }
    const existing = getRegisteredUsers();
    if (existing.find(u => u.email === lc)) {
      setError('An account with this email already exists.');
      return;
    }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      const hash = await sha256(password);
      const code = generateCode();

      // Save user as unverified
      const users = getRegisteredUsers();
      const newUser = { email: lc, hash, verified: false, verifyCode: code, registeredAt: Date.now() };
      users.push(newUser);
      saveRegisteredUsers(users);

      // Try EmailJS
      let sent = false;
      if (EMAIL_CONFIGURED) {
        try {
          const emailjs = (await import('@emailjs/browser')).default;
          emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: lc,
            verification_code: code,
            user_name: lc.split('@')[0],
          });
          sent = true;
        } catch { /* fall through to demo */ }
      }

      if (!sent) setDemoCode(code);
      setStep('verify');
      startResendTimer();
    } finally {
      setLoading(false);
    }
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

  const handleVerify = (e) => {
    e.preventDefault();
    setOtpError('');
    const code = otp.join('');
    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.email === email.toLowerCase().trim());
    if (idx === -1 || users[idx].verifyCode !== code) {
      setOtpError('Incorrect code. Please try again.');
      return;
    }
    users[idx].verified = true;
    delete users[idx].verifyCode;
    saveRegisteredUsers(users);
    navigate('/login?registered=1');
  };

  const inputStyle = {
    background: 'rgba(0,255,159,0.05)',
    border: '1px solid rgba(0,255,159,0.2)',
    color: '#00ff9f',
    fontFamily: 'Share Tech Mono, monospace',
    letterSpacing: '0.5px',
  };

  const cardStyle = {
    background: '#0d0018',
    border: '1px solid rgba(0,255,159,0.35)',
    borderRadius: '4px',
    boxShadow: '0 0 0 1px rgba(0,255,159,0.08) inset, 0 0 40px rgba(0,255,159,0.08), 0 32px 64px rgba(0,0,0,0.7)',
  };

  const bgStyle = {
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,45,120,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,255,159,0.10) 0%, transparent 60%), #07000f',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={bgStyle} className="font-mono px-4">
      <div style={{ ...cardStyle, width: '100%', maxWidth: 460 }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(0,255,159,0.15)' }} className="px-10 pt-10 pb-7">
          <div style={{ fontFamily: 'VT323, monospace', fontSize: '1.5rem', color: '#00ff9f', letterSpacing: '2px' }}>
            NPLAWN LLC
          </div>
          <div className="text-[10px] tracking-[3px] mt-0.5" style={{ color: 'rgba(0,255,159,0.5)' }}>
            {step === 'register' ? 'CREATE NEW ACCOUNT' : 'VERIFY YOUR EMAIL'}
          </div>
        </div>

        <div className="px-10 pt-8 pb-8">
          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <CpLabel>IDENTIFIER (EMAIL)</CpLabel>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm rounded outline-none"
                style={inputStyle} />

              <CpLabel>PASSKEY</CpLabel>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 text-sm rounded outline-none"
                style={inputStyle} />

              {password && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: strength >= i ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <div className="text-[10px] tracking-wider" style={{ color: STRENGTH_COLORS[strength], fontFamily: 'Share Tech Mono, monospace' }}>
                    {STRENGTH_LABELS[strength]}
                  </div>
                </div>
              )}

              <CpLabel>CONFIRM PASSKEY</CpLabel>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                required placeholder="Repeat password"
                className="w-full px-4 py-2.5 text-sm rounded outline-none"
                style={inputStyle} />

              {error && (
                <div className="text-xs py-2 px-3 rounded text-center"
                  style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)', color: '#ff2d78', fontFamily: 'Share Tech Mono, monospace' }}>
                  ⚠ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 text-sm font-bold tracking-[2px] uppercase rounded mt-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,159,0.15), rgba(0,255,159,0.05))',
                  border: '1px solid rgba(0,255,159,0.5)',
                  color: '#00ff9f',
                  fontFamily: 'Share Tech Mono, monospace',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>

              <div className="text-xs text-center pt-1" style={{ color: 'rgba(0,255,159,0.4)', fontFamily: 'Share Tech Mono, monospace' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#00ff9f' }}>[ LOGIN ]</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,255,159,0.6)', fontFamily: 'Share Tech Mono, monospace' }}>
                A 6-digit verification code has been sent to <strong style={{ color: '#00ff9f' }}>{email}</strong>.
                Enter it below to activate your account.
              </p>

              {demoCode && (
                <div className="text-center py-3 rounded" style={{ background: 'rgba(245,230,66,0.08)', border: '1px solid rgba(245,230,66,0.3)' }}>
                  <div className="text-[9px] tracking-[2px] mb-1" style={{ color: '#f5e642', fontFamily: 'Share Tech Mono, monospace' }}>DEMO — EMAIL NOT CONFIGURED</div>
                  <div style={{ fontFamily: 'VT323, monospace', fontSize: '2.5rem', color: '#f5e642', letterSpacing: '8px' }}>{demoCode}</div>
                </div>
              )}

              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                    ref={el => otpRefs.current[i] = el}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl rounded outline-none"
                    style={{ ...inputStyle, letterSpacing: '0', fontFamily: 'VT323, monospace', fontSize: '2rem' }} />
                ))}
              </div>

              {otpError && (
                <div className="text-xs py-2 px-3 rounded text-center"
                  style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)', color: '#ff2d78', fontFamily: 'Share Tech Mono, monospace' }}>
                  ⚠ {otpError}
                </div>
              )}

              <button type="submit"
                className="w-full py-3 text-sm font-bold tracking-[2px] uppercase rounded"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,159,0.15), rgba(0,255,159,0.05))',
                  border: '1px solid rgba(0,255,159,0.5)',
                  color: '#00ff9f',
                  fontFamily: 'Share Tech Mono, monospace',
                  cursor: 'pointer',
                }}>
                VERIFY &amp; ACTIVATE
              </button>

              <div className="text-center text-xs" style={{ color: 'rgba(0,255,159,0.4)', fontFamily: 'Share Tech Mono, monospace' }}>
                {resendTimer > 0
                  ? `Resend available in ${resendTimer}s`
                  : <button type="button" onClick={() => { /* resend logic */ startResendTimer(); }}
                      style={{ color: '#00ff9f', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Share Tech Mono, monospace' }}>
                      [ RESEND CODE ]
                    </button>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function CpLabel({ children }) {
  return (
    <label className="block text-[10px] tracking-[2px]"
      style={{ color: 'rgba(0,255,159,0.5)', fontFamily: 'Share Tech Mono, monospace' }}>
      {children}
    </label>
  );
}
