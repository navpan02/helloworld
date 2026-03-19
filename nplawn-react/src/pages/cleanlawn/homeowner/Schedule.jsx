import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const STATUS_CONFIG = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  paused:    { label: 'Paused',    color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_WINDOWS = [
  { value: 'morning',       label: 'Morning',        sub: '8 AM – 11 AM' },
  { value: 'afternoon',     label: 'Afternoon',      sub: '12 PM – 3 PM' },
  { value: 'late_afternoon', label: 'Late Afternoon', sub: '3 PM – 6 PM' },
];

const RESCHEDULE_REASONS = [
  'Weather concern',
  'Scheduling conflict',
  'Property access issue',
  'Contractor preference',
  'Other',
];

// Build next N selectable dates (skip today + next 2 days, Mon–Sat only)
function getSelectableDates(count = 30) {
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 3); // earliest is 3 days out
  while (dates.length < count) {
    const day = d.getDay();
    if (day !== 0) { // exclude Sunday
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function ReschedulePanel({ schedule, onClose, onSave }) {
  const dates = getSelectableDates(28);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeWindow, setTimeWindow]     = useState('');
  const [reason, setReason]             = useState('');
  const [note, setNote]                 = useState('');
  const [saving, setSaving]             = useState(false);
  const [done, setDone]                 = useState(false);

  const confirm = async () => {
    if (!selectedDate || !timeWindow) return;
    setSaving(true);
    const updates = { next_date: selectedDate, time_window: timeWindow };
    await supabase.from('recurring_schedules').update(updates).eq('id', schedule.id);
    onSave({ ...schedule, ...updates });
    setDone(true);
    setSaving(false);
    setTimeout(onClose, 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-np-dark text-white px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-np-lite text-xs font-medium mb-1">Reschedule Service</p>
              <h2 className="text-lg font-bold">{schedule.service_type}</h2>
              <p className="text-white/60 text-sm capitalize">
                Currently: {schedule.frequency}
                {schedule.day_of_week != null ? ` · ${DAYS[schedule.day_of_week]}s` : ''}
                {schedule.time_window ? ` · ${schedule.time_window}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none mt-1">✕</button>
          </div>
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Reschedule Confirmed!</h3>
            <p className="text-gray-500 text-sm">
              Next visit updated to{' '}
              <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
              {' · '}{TIME_WINDOWS.find(t => t.value === timeWindow)?.label}
            </p>
            <p className="text-xs text-gray-400 mt-3">You'll receive a confirmation email shortly.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Date picker */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Select New Date
              </label>
              <div className="grid grid-cols-4 gap-2">
                {dates.map(d => {
                  const iso = d.toISOString().slice(0, 10);
                  const isSelected = selectedDate === iso;
                  return (
                    <button key={iso} onClick={() => setSelectedDate(iso)}
                      className={`rounded-lg py-2 px-1 text-center transition-colors border ${
                        isSelected
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'
                      }`}>
                      <div className="text-xs text-current opacity-70">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-semibold">
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time window */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Time Window
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_WINDOWS.map(tw => (
                  <button key={tw.value} onClick={() => setTimeWindow(tw.value)}
                    className={`rounded-lg py-3 text-center transition-colors border ${
                      timeWindow === tw.value
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'
                    }`}>
                    <div className="text-sm font-semibold">{tw.label}</div>
                    <div className={`text-xs mt-0.5 ${timeWindow === tw.value ? 'text-white/70' : 'text-gray-400'}`}>{tw.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Reason <span className="text-gray-400 normal-case font-normal">(optional)</span>
              </label>
              <select value={reason} onChange={e => setReason(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                <option value="">— Select a reason —</option>
                {RESCHEDULE_REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Note to Provider <span className="text-gray-400 normal-case font-normal">(optional)</span>
              </label>
              <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Any special instructions for the rescheduled visit…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
            </div>
          </div>
        )}

        {/* Footer */}
        {!done && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white">
            <button
              onClick={confirm}
              disabled={!selectedDate || !timeWindow || saving}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Confirming…' : 'Confirm Reschedule'}
            </button>
            {(!selectedDate || !timeWindow) && (
              <p className="text-xs text-gray-400 text-center mt-2">Select a date and time window to continue</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function Schedule() {
  const { user } = useAuth();
  const [schedules, setSchedules]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [rescheduling, setRescheduling] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('recurring_schedules')
      .select('*')
      .eq('homeowner_id', user.id)
      .order('created_at', { ascending: false });
    setSchedules(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('recurring_schedules').update({ status }).eq('id', id);
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleRescheduleSave = (updated) => {
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">Recurring Plans</span>
        </div>

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Recurring Plans</h1>
          <Link to="/CleanLawn/homeowner/quote-request"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + New Plan
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : schedules.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🔁</div>
            <p className="text-gray-500 mb-4">No recurring plans yet.</p>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              When you accept a recurring quote, your plan will appear here. You can pause, resume, reschedule, or cancel any plan.
            </p>
            <Link to="/CleanLawn/homeowner/quote-request"
              className="inline-block mt-5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">
              Request Recurring Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map(s => {
              const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.active;
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-800">{s.service_type}</div>
                      <div className="text-sm text-gray-500 mt-0.5 capitalize">
                        {s.frequency}
                        {s.day_of_week != null ? ` · ${DAYS[s.day_of_week]}s` : ''}
                        {s.time_window ? ` · ${s.time_window}` : ''}
                      </div>
                      {s.next_date && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Next: {new Date(s.next_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {s.status !== 'cancelled' && (
                      <button onClick={() => setRescheduling(s)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium">
                        Reschedule
                      </button>
                    )}
                    {s.status === 'active' && (
                      <button onClick={() => updateStatus(s.id, 'paused')}
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">Pause</button>
                    )}
                    {s.status === 'paused' && (
                      <button onClick={() => updateStatus(s.id, 'active')}
                        className="text-sm text-green-600 hover:text-green-700 font-medium">Resume</button>
                    )}
                    {s.status !== 'cancelled' && (
                      <button onClick={() => { if (confirm('Cancel this recurring plan?')) updateStatus(s.id, 'cancelled'); }}
                        className="text-sm text-red-500 hover:text-red-600 font-medium">Cancel Plan</button>
                    )}
                    <Link to="/CleanLawn/homeowner/messages" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Message Provider
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule panel */}
      {rescheduling && (
        <ReschedulePanel
          schedule={rescheduling}
          onClose={() => setRescheduling(null)}
          onSave={handleRescheduleSave}
        />
      )}
    </div>
  );
}
