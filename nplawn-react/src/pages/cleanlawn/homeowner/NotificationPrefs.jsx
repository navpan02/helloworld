import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const PREFS = [
  {
    key: 'upcoming_reminder',
    label: 'Upcoming Service Reminder',
    desc: '24 hours before your scheduled service',
  },
  {
    key: 'service_complete',
    label: 'Service Completed',
    desc: 'When your provider marks a job as done',
  },
  {
    key: 'invoice_due',
    label: 'Invoice Due',
    desc: 'When an invoice is approaching its due date',
  },
  {
    key: 'new_quote',
    label: 'New Quote Received',
    desc: 'When a provider responds to your quote request',
  },
  {
    key: 'weather_delay',
    label: 'Weather Delay Alert',
    desc: 'When a service is rescheduled due to weather',
  },
];

const DEFAULT_PREFS = {
  email_upcoming_reminder: true,
  email_service_complete:  true,
  email_invoice_due:       true,
  email_new_quote:         true,
  email_weather_delay:     true,
  sms_upcoming_reminder:   true,
  sms_service_complete:    false,
  sms_invoice_due:         false,
  sms_weather_delay:       true,
};

function Toggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${value ? 'bg-green-500' : 'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function NotificationPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs]     = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [isNew, setIsNew]     = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('notification_preferences').select('*').eq('homeowner_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPrefs(data);
        } else {
          setIsNew(true);
        }
        setLoading(false);
      });
  }, [user?.id]);

  const toggle = (field) => {
    setPrefs(prev => ({ ...prev, [field]: !prev[field] }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...prefs, homeowner_id: user.id, updated_at: new Date().toISOString() };
    if (isNew) {
      await supabase.from('notification_preferences').insert(payload);
      setIsNew(false);
    } else {
      await supabase.from('notification_preferences').update(payload).eq('homeowner_id', user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Notification Preferences</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Choose how and when you'd like to be notified about your lawn care services.
        </p>

        {loading ? (
          <p className="text-gray-500 text-sm py-10 text-center">Loading preferences…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_80px_80px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div>Notification</div>
              <div className="text-center">Email</div>
              <div className="text-center">SMS</div>
            </div>

            <div className="divide-y divide-gray-50">
              {PREFS.map(pref => (
                <div key={pref.key} className="grid grid-cols-[1fr_80px_80px] gap-4 px-6 py-4 items-center">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{pref.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{pref.desc}</div>
                  </div>
                  <div className="flex justify-center">
                    <Toggle
                      value={prefs[`email_${pref.key}`] ?? false}
                      onChange={() => toggle(`email_${pref.key}`)} />
                  </div>
                  <div className="flex justify-center">
                    <Toggle
                      value={prefs[`sms_${pref.key}`] ?? false}
                      onChange={() => toggle(`sms_${pref.key}`)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400 space-y-1">
          <p>• Email notifications are sent to the address on your account.</p>
          <p>• SMS notifications are sent to your phone number on file. Standard message rates may apply.</p>
          <p>• You can update your contact info in <Link to="/CleanLawn/homeowner/profile" className="text-green-600 hover:underline">My Profile</Link>.</p>
        </div>
      </div>
    </div>
  );
}
