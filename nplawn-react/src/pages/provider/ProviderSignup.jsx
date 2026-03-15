import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpUser, authErrorMessage } from '../../utils/auth';
import { supabase } from '../../lib/supabase'; // used for provider_profiles table only

const SERVICES = [
  'Lawn Mowing', 'Tree Trimming', 'Tree & Shrub Care', 'Aeration & Seeding',
  'Landscape Design', 'Fertilization', 'Weed Control', 'Leaf Removal',
  'Snow Removal', 'Irrigation', 'Mulching', 'Hardscaping',
];

const IL_ZIPS = ['60540', '60563', '60564', '60565', '60515', '60517', '60521', '60523', '60527', '60559'];

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STR_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STR_COLORS = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'];

async function saveProviderProfile(profile) {
  await supabase.from('provider_profiles').upsert({
    email:             profile.email,
    business_name:     profile.businessName,
    description:       profile.description,
    phone:             profile.phone,
    address:           profile.address,
    years_in_business: profile.yearsInBusiness ? parseInt(profile.yearsInBusiness) : null,
    team_size:         profile.teamSize ? parseInt(profile.teamSize) : null,
    equipment:         profile.equipment,
    license_number:    profile.licenseNumber,
    services_offered:  profile.servicesOffered || [],
    service_areas:     profile.serviceAreas || [],
    portfolio:         [],
    total_jobs:        0,
  });
}

export default function ProviderSignup() {
  const [step, setStep] = useState(1); // 1: account, 2: business, 3: done
  const navigate = useNavigate();

  // Step 1 fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Step 2 fields
  const [bizName, setBizName]           = useState('');
  const [bizDesc, setBizDesc]           = useState('');
  const [phone, setPhone]               = useState('');
  const [address, setAddress]           = useState('');
  const [yearsInBiz, setYearsInBiz]     = useState('');
  const [teamSize, setTeamSize]         = useState('');
  const [equipment, setEquipment]       = useState('');
  const [licenseNum, setLicenseNum]     = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedZips, setSelectedZips]         = useState([]);
  const [bizError, setBizError]         = useState('');

  const strength = pwStrength(password);

  const toggleService = (s) =>
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleZip = (z) =>
    setSelectedZips(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error: err } = await signUpUser({ email, password, role: 'provider' });
    setLoading(false);
    if (err) { setError(authErrorMessage(err)); return; }
    setStep(2);
  };

  const handleBizSubmit = async (e) => {
    e.preventDefault();
    setBizError('');
    if (!bizName.trim()) { setBizError('Business name is required.'); return; }
    if (selectedServices.length === 0) { setBizError('Select at least one service.'); return; }
    if (selectedZips.length === 0) { setBizError('Select at least one service area.'); return; }
    setLoading(true);
    try {
      await saveProviderProfile({
        email: email.toLowerCase().trim(),
        businessName: bizName.trim(),
        description: bizDesc.trim(),
        phone: phone.trim(),
        address: address.trim(),
        yearsInBusiness: yearsInBiz,
        teamSize: teamSize,
        equipment: equipment.trim(),
        licenseNumber: licenseNum.trim(),
        servicesOffered: selectedServices,
        serviceAreas: selectedZips,
      });
      setStep(3);
    } catch {
      setBizError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-np-surface flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-np overflow-hidden">

        {/* Header */}
        <div className="bg-np-dark px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 20V10C12 6 9 3 5 4c1 4 4 7 7 7" stroke="#74c69d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20V12C12 8 15 5 19 6c-1 4-4 7-7 7" stroke="#74c69d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="4" y1="20" x2="20" y2="20" stroke="#74c69d" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span className="text-white font-extrabold text-lg tracking-tight">
              NP<em className="text-np-lite not-italic">Lawn</em> LLC
            </span>
          </div>
          <p className="text-white/70 text-sm mt-1">Register as a Service Provider</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > n ? 'bg-np-lite text-np-dark' :
                  step === n ? 'bg-np-accent text-np-dark' : 'bg-white/20 text-white/50'
                }`}>{step > n ? '✓' : n}</div>
                {n < 2 && <div className={`w-8 h-0.5 ${step > n ? 'bg-np-lite' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-1.5">
            <span className={`text-xs ${step >= 1 ? 'text-np-lite' : 'text-white/40'}`}>Account</span>
            <span className={`text-xs ${step >= 2 ? 'text-np-lite' : 'text-white/40'}`}>Business</span>
          </div>
        </div>

        <div className="px-8 py-7">
          {step === 1 && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <h2 className="text-base font-bold text-np-text mb-3">Create your account</h2>
              <Field label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="business@example.com" />
              <div>
                <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: strength >= i ? STR_COLORS[strength] : '#e5e7eb' }} />
                      ))}
                    </div>
                    <span className="text-xs font-medium" style={{ color: STR_COLORS[strength] }}>{STR_LABELS[strength]}</span>
                  </div>
                )}
              </div>
              <Field label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-np-green hover:bg-np-mid disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm mt-1">
                {loading ? 'Creating account…' : 'Continue to Business Profile'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-np-green font-medium hover:underline">Sign in</Link>
              </p>
              <p className="text-center text-sm text-gray-500">
                <Link to="/" className="text-np-green font-medium hover:underline">← Back to Home</Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleBizSubmit} className="space-y-5">
              <h2 className="text-base font-bold text-np-text">Business Profile</h2>

              <Field label="Business Name *" type="text" value={bizName} onChange={e => setBizName(e.target.value)} placeholder="Green Thumb Landscaping" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                <textarea value={bizDesc} onChange={e => setBizDesc(e.target.value)}
                  rows={3} placeholder="Describe your business, specialties, and what sets you apart…"
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 resize-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(630) 555-0100" />
                <Field label="Years in Business" type="number" value={yearsInBiz} onChange={e => setYearsInBiz(e.target.value)} placeholder="5" />
              </div>
              <Field label="Business Address" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Naperville, IL" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Team Size" type="number" value={teamSize} onChange={e => setTeamSize(e.target.value)} placeholder="3" />
                <Field label="License Number" type="text" value={licenseNum} onChange={e => setLicenseNum(e.target.value)} placeholder="Optional" />
              </div>
              <Field label="Equipment / Fleet" type="text" value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="e.g. 2 riding mowers, 1 chipper" />

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered *</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map(s => (
                    <button key={s} type="button" onClick={() => toggleService(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedServices.includes(s)
                          ? 'bg-np-green text-white border-np-green'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-np-green'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas (ZIP Codes) *</label>
                <div className="flex flex-wrap gap-2">
                  {IL_ZIPS.map(z => (
                    <button key={z} type="button" onClick={() => toggleZip(z)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedZips.includes(z)
                          ? 'bg-np-accent text-np-dark border-np-accent'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-np-accent'
                      }`}>{z}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Select all ZIP codes you serve in Chicagoland</p>
              </div>

              {bizError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">{bizError}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button type="submit"
                  className="flex-2 flex-grow py-2.5 bg-np-green hover:bg-np-mid text-white font-semibold rounded-lg text-sm transition-colors">
                  Complete Registration
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-np-surface flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-np-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-np-text">You're registered!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your provider account is active. Log in to access your Provider Dashboard and start receiving quote requests.
              </p>
              <button onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-np-green hover:bg-np-mid text-white font-semibold rounded-lg text-sm transition-colors">
                Go to Login
              </button>
              <Link to="/" className="block text-sm text-np-green font-medium hover:underline">← Back to Home</Link>
            </div>
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 transition-all" />
    </div>
  );
}
