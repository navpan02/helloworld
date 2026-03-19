import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const CATEGORY_CONFIG = {
  access:       { label: 'Access',       icon: '🔑', color: 'bg-blue-100 text-blue-700' },
  pets:         { label: 'Pets',         icon: '🐾', color: 'bg-orange-100 text-orange-700' },
  instructions: { label: 'Instructions', icon: '📋', color: 'bg-purple-100 text-purple-700' },
  general:      { label: 'General',      icon: '📝', color: 'bg-gray-100 text-gray-600' },
};

const EMPTY_FORM = { property_nickname: '', category: 'general', content: '' };

export default function ProviderNotes() {
  const { user } = useAuth();
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('provider_notes').select('*').eq('homeowner_id', user.id)
      .order('category').then(({ data }) => { setNotes(data ?? []); setLoading(false); });
  }, [user?.id]);

  const openEdit = (note) => {
    setEditing(note.id);
    setForm({ property_nickname: note.property_nickname ?? '', category: note.category, content: note.content });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);

    if (editing) {
      const { data } = await supabase.from('provider_notes')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editing).select().single();
      if (data) setNotes(prev => prev.map(n => n.id === editing ? data : n));
    } else {
      const { data } = await supabase.from('provider_notes')
        .insert({ homeowner_id: user.id, ...form }).select().single();
      if (data) setNotes(prev => [...prev, data]);
    }
    resetForm();
    setSaving(false);
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    await supabase.from('provider_notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const grouped = notes.reduce((acc, n) => {
    const cat = n.category ?? 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Provider Notes</span>
        </div>

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Provider Notes</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + Add Note
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Leave instructions for your service providers — gate codes, pets, property quirks, and more.
          Providers see these before each visit.
        </p>

        {/* Form */}
        {showForm && (
          <form onSubmit={saveNote} className="bg-white rounded-xl border border-green-200 shadow-sm p-5 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit Note' : 'Add Note'}</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Property (optional)</label>
                <input type="text" placeholder="e.g. Main House, Vacation Home"
                  value={form.property_nickname}
                  onChange={e => setForm(p => ({ ...p, property_nickname: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <select value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  {Object.entries(CATEGORY_CONFIG).map(([val, { label }]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Note</label>
              <textarea rows={3} required
                placeholder={
                  form.category === 'access'       ? 'e.g. Side gate code: 4829. Please latch after entering.' :
                  form.category === 'pets'         ? 'e.g. We have a golden retriever named Max. Please keep gate closed.' :
                  form.category === 'instructions' ? 'e.g. Do not mow the flower bed near the front porch.' :
                  'Any other notes for your provider…'
                }
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Update Note' : 'Save Note'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm py-10 text-center">Loading…</p>
        ) : notes.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 mb-1">No provider notes yet.</p>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Add notes so your provider knows about gate codes, pets, or special instructions before each visit.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
              const items = grouped[cat];
              if (!items?.length) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {items.map(note => (
                      <div key={note.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        {note.property_nickname && (
                          <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                            {note.property_nickname}
                          </div>
                        )}
                        <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                          <button onClick={() => openEdit(note)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                          <button onClick={() => deleteNote(note.id)}
                            className="text-sm text-red-500 hover:text-red-600 font-medium">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
