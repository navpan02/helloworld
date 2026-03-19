import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}>
          <span className={(hovered || value) >= star ? 'text-yellow-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ job_id: '', rating: 0, comment: '' });

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from('service_feedback').select('*').eq('homeowner_id', user.id).order('created_at', { ascending: false }),
      supabase.from('jobs').select('*').eq('homeowner_id', user.id).eq('status', 'completed').order('scheduled_date', { ascending: false }),
    ]).then(([{ data: fb }, { data: j }]) => {
      setFeedbacks(fb ?? []);
      setJobs(j ?? []);
      setLoading(false);
    });
  }, [user?.id]);

  const ratedJobIds = new Set(feedbacks.map(f => f.job_id).filter(Boolean));
  const unratedJobs = jobs.filter(j => !ratedJobIds.has(j.id));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.rating) return;
    setSaving(true);
    const job = jobs.find(j => j.id === form.job_id);
    const payload = {
      homeowner_id: user.id,
      job_id: form.job_id || null,
      provider_name: job?.notes?.replace('Provider: ', '') ?? null,
      service_type: job?.service_type ?? null,
      service_date: job?.scheduled_date ?? null,
      rating: form.rating,
      comment: form.comment,
    };
    const { data } = await supabase.from('service_feedback').insert(payload).select().single();
    if (data) setFeedbacks(prev => [data, ...prev]);
    setForm({ job_id: '', rating: 0, comment: '' });
    setShowForm(false);
    setSaving(false);
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Ratings & Feedback</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Ratings & Feedback</h1>
          {unratedJobs.length > 0 && (
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
              + Rate a Service
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">Rate completed services and help others find great providers.</p>

        {/* Summary bar */}
        {avgRating && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{avgRating}</div>
              <div className="text-xs text-gray-500">avg rating</div>
            </div>
            <div className="flex-1 border-l border-gray-100 pl-4">
              <StarRating value={Math.round(parseFloat(avgRating))} readonly />
              <div className="text-xs text-gray-400 mt-1">{feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''} submitted</div>
            </div>
          </div>
        )}

        {/* Rate a service form */}
        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-xl border border-green-200 shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Rate a Completed Service</h3>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Select Service</label>
              <select value={form.job_id}
                onChange={e => setForm(p => ({ ...p, job_id: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">— Choose a completed job —</option>
                {unratedJobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.service_type} — {new Date(j.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">Rating</label>
              <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
              {!form.rating && <p className="text-xs text-red-500 mt-1">Please select a rating</p>}
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Comments (optional)</label>
              <textarea
                rows={3}
                placeholder="How was the service? Anything the provider did well or could improve?"
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving || !form.rating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                {saving ? 'Submitting…' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800">Cancel</button>
            </div>
          </form>
        )}

        {/* Pending reviews nudge */}
        {unratedJobs.length > 0 && !showForm && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm">
            <span className="font-medium text-green-800">You have {unratedJobs.length} service{unratedJobs.length > 1 ? 's' : ''} awaiting a review.</span>
            <button onClick={() => setShowForm(true)} className="ml-2 text-green-600 underline font-medium">Rate now</button>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm py-10 text-center">Loading…</p>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-gray-500 mb-1">No reviews yet.</p>
            <p className="text-sm text-gray-400">Complete a service and rate your provider.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map(fb => (
              <div key={fb.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-800">{fb.service_type ?? 'Service'}</div>
                    {fb.provider_name && <div className="text-xs text-gray-400">{fb.provider_name}</div>}
                  </div>
                  <div className="text-right">
                    <StarRating value={fb.rating} readonly />
                    {fb.service_date && (
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(fb.service_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
                {fb.comment && <p className="text-sm text-gray-600 mt-2 border-t border-gray-50 pt-2">"{fb.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
