import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getRegisteredUsers } from '../utils/auth';
import { supabase } from '../lib/supabase';

function getLeads() {
  try { return JSON.parse(localStorage.getItem('nplawn_leads') || '[]'); } catch { return []; }
}

function getOrders() {
  try { return JSON.parse(localStorage.getItem('nplawn_orders') || '[]'); } catch { return []; }
}

export default function AdminDashboard() {
  const [tab, setTab]     = useState('orders');
  const [orders, setOrders]   = useState([]);
  const [leads, setLeads]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [dbStatus, setDbStatus] = useState(null); // null | 'ok' | string (error)
  const { user, logout }      = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    async function loadData() {
      // Fetch orders
      let remoteOrders = [];
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (ordersError) {
        setDbStatus(`${ordersError.message} (code: ${ordersError.code})`);
      } else {
        setDbStatus('ok');
        remoteOrders = ordersData;
      }
      const localOrders = getOrders();
      const remoteOrderIds = new Set(remoteOrders.map(o => o.id));
      setOrders([...remoteOrders, ...localOrders.filter(o => !remoteOrderIds.has(o.id))]);

      // Fetch leads
      let remoteLeads = [];
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (!leadsError) remoteLeads = leadsData;
      const localLeads = getLeads();
      const remoteLeadEmails = new Set(remoteLeads.map(l => l.email + l.submitted_at));
      const localOnlyLeads = localLeads.filter(l => !remoteLeadEmails.has(l.email + new Date(l.submittedAt).toISOString()));
      setLeads([...remoteLeads, ...localOnlyLeads]);

      setUsers(getRegisteredUsers());
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const handleLogout = () => { logout(); navigate('/login'); };

  const exportCSV = () => {
    const headers = ['Order ID', 'Plan', 'Sqft', 'Annual Total', 'Customer', 'Email', 'Phone', 'Address', 'Date'];
    const rows = orders.map(o => [
      o.id, o.plan, o.sqft, o.total,
      o.customer_name || o.customer?.name,
      o.customer_email || o.customer?.email,
      o.customer_phone || o.customer?.phone,
      o.customer_address
        ? `${o.customer_address} ${o.customer_city || ''} ${o.customer_zip || ''}`.trim()
        : `${o.customer?.address || ''} ${o.customer?.city || ''} ${o.customer?.zip || ''}`.trim(),
      new Date(o.submitted_at || o.submittedAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nplawn_orders.csv';
    a.click();
  };

  const TABS = [
    { key: 'orders', label: 'Orders', count: orders.length },
    { key: 'leads',  label: 'Leads',  count: leads.length },
    { key: 'users',  label: 'Users',  count: users.length },
  ];

  return (
    <div className="min-h-screen bg-np-surface">
      {/* Admin Header */}
      <div className="bg-np-dark text-white px-[5%] py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs tracking-[2px] uppercase text-np-lite/60 mb-1">Admin Portal</div>
          <h1 className="text-2xl font-extrabold">NPLawn Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden md:block">{user?.email}</span>
          <Link to="/"
            className="text-np-lite text-sm font-semibold hover:text-white transition-colors border border-np-lite/30 px-3 py-1.5 rounded-lg">
            Home
          </Link>
          <button onClick={handleLogout}
            className="text-np-lite text-sm font-semibold hover:text-white transition-colors border border-np-lite/30 px-3 py-1.5 rounded-lg">
            Logout
          </button>
        </div>
      </div>

      {/* DB Status Banner */}
      {dbStatus && dbStatus !== 'ok' && (
        <div className="bg-red-50 border-b border-red-200 px-[5%] py-3 text-red-700 text-sm font-mono">
          <strong>Supabase error:</strong> {dbStatus}
        </div>
      )}
      {dbStatus === 'ok' && (
        <div className="bg-green-50 border-b border-green-200 px-[5%] py-2 text-green-700 text-xs">
          Supabase connected
        </div>
      )}

      {/* Stats */}
      <div className="px-[5%] py-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {[
          { label: 'Total Orders',   value: orders.length },
          { label: 'Annual Revenue', value: `$${totalRevenue.toLocaleString()}` },
          { label: 'Leads',          value: leads.length },
          { label: 'Registered Users', value: users.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-np-border shadow-np">
            <div className="text-np-accent text-2xl font-extrabold">{s.value}</div>
            <div className="text-np-muted text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-[5%] max-w-6xl mx-auto">
        <div className="flex gap-1 bg-white rounded-xl border border-np-border p-1 w-fit mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-np-dark text-white' : 'text-np-muted hover:text-np-dark'}`}>
              {t.label}
              {t.count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-np-accent text-np-dark' : 'bg-np-surface text-np-muted'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-np-dark font-bold text-xl">Orders</h2>
              {orders.length > 0 && (
                <button onClick={exportCSV} className="btn-outline text-sm px-4 py-2">Export CSV</button>
              )}
            </div>
            {orders.length === 0 ? (
              <EmptyState message="No orders yet. They'll appear here when customers submit the order form." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-np-border bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-np-border text-np-muted text-xs uppercase tracking-wide">
                      {['Order ID', 'Plan', 'Sq Ft', 'Annual Total', 'Avg/App', 'Customer', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-np-border/50 hover:bg-np-surface/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-np-muted">{o.id}</td>
                        <td className="px-4 py-3 font-semibold text-np-dark">{o.plan}</td>
                        <td className="px-4 py-3">{o.sqft?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-np-dark">${o.total?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-np-accent">${o.avg_per_app ?? o.avgPerApp}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-np-dark">{o.customer_name || o.customer?.name}</div>
                          <div className="text-np-muted text-xs">{o.customer_email || o.customer?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-np-muted">{new Date(o.submitted_at || o.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {tab === 'leads' && (
          <div>
            <h2 className="text-np-dark font-bold text-xl mb-4">Leads</h2>
            {leads.length === 0 ? (
              <EmptyState message="No leads yet. Quote requests and contact form submissions will appear here." />
            ) : (
              <div className="space-y-4">
                {leads.map((l, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-np-border p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-np-dark">{l.name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            l.source === 'get_quote'
                              ? 'bg-np-accent/20 text-np-dark'
                              : 'bg-np-surface text-np-muted border border-np-border'}`}>
                            {l.source === 'get_quote' ? 'Quote Request' : 'Contact Form'}
                          </span>
                        </div>
                        <div className="text-np-muted text-sm">{l.email} · {l.phone}</div>
                      </div>
                      <div className="text-np-muted text-xs">{new Date(l.submitted_at || l.submittedAt).toLocaleDateString()}</div>
                    </div>
                    {l.service && <div className="text-xs font-semibold text-np-accent uppercase tracking-wide mb-2">{l.service}</div>}
                    <p className="text-np-text text-sm leading-relaxed whitespace-pre-line">{l.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <h2 className="text-np-dark font-bold text-xl mb-4">Registered Users</h2>
            {users.length === 0 ? (
              <EmptyState message="No registered users yet. Users who sign up will appear here." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-np-border bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-np-border text-np-muted text-xs uppercase tracking-wide">
                      {['Email', 'Status', 'Registered', 'Orders'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const userOrders = orders.filter(o => (o.customer_email || o.customer?.email) === u.email);
                      return (
                        <tr key={i} className="border-b border-np-border/50 hover:bg-np-surface/50">
                          <td className="px-4 py-3 font-medium text-np-dark">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                              u.verified ? 'bg-np-lite/30 text-np-green' : 'bg-yellow-100 text-yellow-700'}`}>
                              {u.verified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-np-muted">{u.registeredAt ? new Date(u.registeredAt).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3">
                            {userOrders.length > 0
                              ? <span className="font-semibold text-np-dark">{userOrders.length} · {userOrders[0]?.plan}</span>
                              : <span className="text-np-muted">0</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-16" />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-2xl border border-np-border p-12 text-center text-np-muted">
      <svg className="w-12 h-12 stroke-np-border fill-none stroke-[1.5] mx-auto mb-4" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 15h8M9 9h.01M15 9h.01"/>
      </svg>
      {message}
    </div>
  );
}
