import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ConstraintPanel, { DEFAULT_CONSTRAINTS } from '../../../components/ConstraintPanel';

export default function ConstraintsTab({ session }) {
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  useEffect(() => {
    supabase
      .from('branches')
      .select('constraints')
      .eq('id', session.branchId)
      .single()
      .then(({ data }) => {
        if (data?.constraints && Object.keys(data.constraints).length) {
          setConstraints({ ...DEFAULT_CONSTRAINTS, ...data.constraints });
        }
        setLoading(false);
      });
  }, [session.branchId]);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    await supabase.from('branches').update({ constraints }).eq('id', session.branchId);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading constraints…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Branch Constraints</h2>
          <p className="text-xs text-gray-500 mt-0.5">These defaults apply to all new route runs for your branch.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ConstraintPanel constraints={constraints} onChange={setConstraints} />
      </div>
    </div>
  );
}
