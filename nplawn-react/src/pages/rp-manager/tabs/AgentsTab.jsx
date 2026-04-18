import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const EMPTY = { name: '', email: '', phone: '', start_address: '' };

export default function AgentsTab({ session }) {
  const [agents, setAgents] = useState([]);
  const [form, setForm]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    supabase.from('agents').select('*').eq('branch_id', session.branchId).order('name')
      .then(({ data }) => setAgents(data ?? []));
  }, [session.branchId]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const { id, ...fields } = form;
    const payload = { ...fields, branch_id: session.branchId };
    const op = id
      ? supabase.from('agents').update(payload).eq('id', id).select().single()
      : supabase.from('agents').insert(payload).select().single();
    const { data, error: err } = await op;
    setSaving(false);
    if (err) { setError(err.message); return; }
    setAgents(prev => id ? prev.map(a => a.id === id ? data : a) : [...prev, data]);
    setForm(null);
  };

  const toggle = async (agent) => {
    await supabase.from('agents').update({ active: !agent.active }).eq('id', agent.id);
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">My Agents</h2>
        <button
          onClick={() => setForm({ ...EMPTY })}
          className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          + Add Agent
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No agents yet. Add one above.</td></tr>
            )}
            {agents.map(agent => (
              <tr key={agent.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{agent.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{agent.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${agent.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {agent.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setForm({ ...agent })} className="text-xs text-blue-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => toggle(agent)} className="text-xs text-gray-500 hover:underline">
                    {agent.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">{form.id ? 'Edit Agent' : 'Add Agent'}</h3>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              {[
                { key: 'name', label: 'Name', required: true },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'start_address', label: 'Start Address' },
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}{required && ' *'}</label>
                  <input
                    type="text" required={required}
                    value={form[key] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setForm(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-green-700 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-800 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
