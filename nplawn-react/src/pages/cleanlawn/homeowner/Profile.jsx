import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { validateName, validateEmail, validatePhone } from '../../../utils/validate';
import { Link } from 'react-router-dom';

export default function HomeownerProfile() {
  const { user } = useAuth();

  const [form, setForm]       = useState({ name: user?.name ?? '', phone: '', email: user?.email ?? '' });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    const n = validateName(form.name);   if (n) e.name  = n;
    const em = validateEmail(form.email); if (em) e.email = em;
    const ph = validatePhone(form.phone); if (ph) e.phone = ph;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSuccess('');
    setApiError('');

    const { error } = await supabase
      .from('profiles')
      .update({ name: form.name.trim(), phone: form.phone.trim() })
      .eq('id', user.id);

    setSaving(false);
    if (error) { setApiError(error.message); return; }
    setSuccess('Profile updated successfully!');
  };

  const Field = ({ label, id, type = 'text', ...rest }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={id} type={type}
        className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition-all
          ${errors[id] ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`}
        {...rest} />
      {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">My Profile</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-np-dark px-6 py-5">
            <h1 className="text-white text-xl font-bold">My Profile</h1>
            <p className="text-white/60 text-sm mt-0.5">Update your personal information</p>
          </div>

          {/* Avatar placeholder */}
          <div className="flex justify-center pt-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-600 border-4 border-white shadow">
              {(user?.name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
            </div>
          </div>

          <form onSubmit={handleSave} className="px-6 py-6 space-y-4">
            <Field label="Full Name" id="name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onBlur={() => { const e = validateName(form.name); setErrors(p => ({ ...p, name: e })); }}
              placeholder="Jane Smith" />

            <Field label="Email" id="email" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onBlur={() => { const e = validateEmail(form.email); setErrors(p => ({ ...p, email: e })); }}
              placeholder="you@example.com"
              disabled />
            <p className="text-xs text-gray-400 -mt-2">Email cannot be changed here.</p>

            <Field label="Phone Number" id="phone" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              onBlur={() => { const e = validatePhone(form.phone); setErrors(p => ({ ...p, phone: e })); }}
              placeholder="(555) 555-5555" />

            {apiError && (
              <div className="text-sm py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-red-600">{apiError}</div>
            )}
            {success && (
              <div className="text-sm py-2 px-3 rounded-lg bg-green-50 border border-green-200 text-green-700">{success}</div>
            )}

            <button type="submit" disabled={saving}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password change note */}
        <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
          <h2 className="font-semibold text-gray-700 mb-1">Password</h2>
          <p className="text-sm text-gray-500">To change your password, please contact support or create a new account.</p>
        </div>
      </div>
    </div>
  );
}
