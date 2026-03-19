import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const STATUS_CONFIG = {
  paid:    { label: 'Paid',    color: 'bg-green-100 text-green-700' },
  unpaid:  { label: 'Unpaid',  color: 'bg-yellow-100 text-yellow-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-600' },
};

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [paying, setPaying]     = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('invoices')
      .select('*')
      .eq('homeowner_id', user.id)
      .order('service_date', { ascending: false })
      .then(({ data }) => { setInvoices(data ?? []); setLoading(false); });
  }, [user?.id]);

  const markPaid = async (inv) => {
    setPaying(inv.id);
    await supabase.from('invoices').update({ status: 'paid' }).eq('id', inv.id);
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' } : i));
    setPaying(null);
  };

  const visible = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);
  const totalUnpaid = invoices
    .filter(i => i.status !== 'paid')
    .reduce((s, i) => s + parseFloat(i.amount) + parseFloat(i.tax ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Billing & Invoices</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Billing & Invoices</h1>
        <p className="text-sm text-gray-500 mb-6">View, download, and pay your service invoices.</p>

        {/* Outstanding balance banner */}
        {totalUnpaid > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div>
              <div className="font-semibold text-yellow-800 text-sm">Outstanding Balance</div>
              <div className="text-2xl font-bold text-yellow-700">${totalUnpaid.toFixed(2)}</div>
            </div>
            <Link to="/CleanLawn/homeowner/payments"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg transition-colors">
              Pay Now
            </Link>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {['all', 'unpaid', 'overdue', 'paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
              }`}>
              {f === 'all' ? `All (${invoices.length})` : f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm py-10 text-center">Loading invoices…</p>
        ) : visible.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} invoices found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(inv => {
              const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.unpaid;
              const total = (parseFloat(inv.amount) + parseFloat(inv.tax ?? 0)).toFixed(2);
              return (
                <div key={inv.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-800">{inv.invoice_number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <div className="text-sm text-gray-600">{inv.service_type}</div>
                      {inv.provider_name && (
                        <div className="text-xs text-gray-400 mt-0.5">{inv.provider_name}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">${total}</div>
                      {inv.service_date && (
                        <div className="text-xs text-gray-400">
                          {new Date(inv.service_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {inv.status !== 'paid' && inv.due_date && (
                        <span>Due: {new Date(inv.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                      {inv.status === 'paid' && <span className="text-green-600">✓ Payment received</span>}
                    </div>
                    <div className="flex gap-3 items-center">
                      {inv.pdf_url && (
                        <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </a>
                      )}
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => markPaid(inv)}
                          disabled={paying === inv.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
                          {paying === inv.id ? 'Processing…' : 'Pay Now'}
                        </button>
                      )}
                    </div>
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
