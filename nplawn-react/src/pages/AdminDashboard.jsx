import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getLeads()  { try { return JSON.parse(localStorage.getItem('nplawn_leads')  || '[]'); } catch { return []; } }
function getOrders() { try { return JSON.parse(localStorage.getItem('nplawn_orders') || '[]'); } catch { return []; } }

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusPill({ status }) {
  const map = {
    open:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending:   'bg-yellow-50  text-yellow-700  border-yellow-200',
    accepted:  'bg-blue-50    text-blue-700    border-blue-200',
    completed: 'bg-np-surface text-np-muted    border-np-border',
    cancelled: 'bg-red-50     text-red-600     border-red-200',
  };
  return (
    <span className={`inline-block text-xs font-semibold border px-2.5 py-0.5 rounded-full capitalize ${map[status] || map.open}`}>
      {status || 'open'}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-2xl border border-np-border p-12 text-center text-np-muted">
      <svg className="w-12 h-12 stroke-np-border fill-none stroke-[1.5] mx-auto mb-4" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/>
      </svg>
      {message}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-np-border shadow-np">
      <div className={`text-2xl font-extrabold ${accent ? 'text-np-accent' : 'text-np-dark'}`}>{value}</div>
      <div className="text-np-muted text-sm mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab,           setTab]           = useState('orders');
  const [orders,        setOrders]        = useState([]);
  const [leads,         setLeads]         = useState([]);
  const [users,         setUsers]         = useState([]);
  const [providers,     setProviders]     = useState([]);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [expanded,      setExpanded]      = useState(null);
  const [dbStatus,      setDbStatus]      = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      // Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders').select('*').order('submitted_at', { ascending: false });
      if (ordersError) setDbStatus(`${ordersError.message} (code: ${ordersError.code})`);
      else setDbStatus('ok');
      const remoteOrders = ordersData ?? [];
      const localOrders  = getOrders();
      const remoteIds    = new Set(remoteOrders.map(o => o.id));
      setOrders([...remoteOrders, ...localOrders.filter(o => !remoteIds.has(o.id))]);

      // Leads
      const { data: leadsData } = await supabase
        .from('leads').select('*').order('submitted_at', { ascending: false });
      const remoteLeads    = leadsData ?? [];
      const localLeads     = getLeads();
      const remoteLeadKeys = new Set(remoteLeads.map(l => l.email + l.submitted_at));
      setLeads([...remoteLeads,
        ...localLeads.filter(l => !remoteLeadKeys.has(l.email + new Date(l.submittedAt).toISOString()))]);

      // Users
      const { data: profilesData } = await supabase
        .from('profiles').select('id, email, name, role, created_at');
      setUsers(profilesData ?? []);

      // Marketplace providers
      const { data: providerData } = await supabase.from('provider_profiles').select('*');
      setProviders(providerData ?? []);

      // Marketplace quote requests
      const { data: qrData } = await supabase
        .from('quote_requests').select('*').order('created_at', { ascending: false });
      setQuoteRequests(qrData ?? []);
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const openQuotes   = quoteRequests.filter(q => !q.status || q.status === 'open').length;

  const TABS = [
    { key: 'orders',     label: 'Orders',         count: orders.length },
    { key: 'leads',      label: 'Leads',          count: leads.length },
    { key: 'providers',  label: 'Providers',      count: providers.length },
    { key: 'mkt_quotes', label: 'Mkt Quotes',     count: quoteRequests.length },
    { key: 'users',      label: 'Users',          count: users.length },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const exportCSV = () => {
    const headers = ['Order ID','Plan','Sqft','Annual Total','Customer','Email','Phone','Date'];
    const rows = orders.map(o => [
      o.id, o.plan, o.sqft, o.total,
      o.customer_name || o.customer?.name,
      o.customer_email || o.customer?.email,
      o.customer_phone || o.customer?.phone,
      fmt(o.submitted_at || o.submittedAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'nplawn_orders.csv',
    });
    a.click();
  };

  return (
    <div className="min-h-screen bg-np-surface">

      {/* Header */}
      <div className="bg-np-dark text-white px-[5%] py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs tracking-[2px] uppercase text-np-lite/60 mb-1">Admin Portal</div>
          <h1 className="text-2xl font-extrabold">NPLawn Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden md:block">{user?.email}</span>
          <Link to="/route-planner" className="text-np-lite text-sm font-semibold hover:text-white bg-np-accent/20 border border-np-accent/40 px-3 py-1.5 rounded-lg transition-colors">Route Planner</Link>
          <Link to="/" className="text-np-lite text-sm font-semibold hover:text-white border border-np-lite/30 px-3 py-1.5 rounded-lg transition-colors">Home</Link>
          <button onClick={handleLogout} className="text-np-lite text-sm font-semibold hover:text-white border border-np-lite/30 px-3 py-1.5 rounded-lg transition-colors">Logout</button>
        </div>
      </div>

      {/* DB status banner */}
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
      <div className="px-[5%] py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
        <Stat label="Total Orders"          value={orders.length} />
        <Stat label="Annual Revenue"        value={`$${totalRevenue.toLocaleString()}`} accent />
        <Stat label="Leads"                 value={leads.length} />
        <Stat label="Registered Users"      value={users.length} />
        <Stat label="Marketplace Providers" value={providers.length} accent />
        <Stat label="Open Quote Requests"   value={openQuotes} />
      </div>

      {/* Tab bar */}
      <div className="px-[5%] max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-1 bg-white rounded-xl border border-np-border p-1 w-fit mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-np-dark text-white' : 'text-np-muted hover:text-np-dark'}`}>
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-np-accent text-np-dark' : 'bg-np-surface text-np-muted'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-np-dark font-bold text-xl">Orders</h2>
              {orders.length > 0 && <button onClick={exportCSV} className="btn-outline text-sm px-4 py-2">Export CSV</button>}
            </div>
            {orders.length === 0
              ? <EmptyState message="No orders yet. They'll appear here when customers submit the order form." />
              : (
                <div className="overflow-x-auto rounded-2xl border border-np-border bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-np-border text-np-muted text-xs uppercase tracking-wide">
                        {['Order ID','Plan','Sq Ft','Annual Total','Avg/App','Customer','Date'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-b border-np-border/50 hover:bg-np-surface/50">
                          <td className="px-4 py-3 font-mono text-xs text-np-muted">{o.id}</td>
                          <td className="px-4 py-3 font-semibold text-np-dark">{o.plan}</td>
                          <td className="px-4 py-3">{o.sqft?.toLocaleString()}</td>
                          <td className="px-4 py-3 font-bold text-np-dark">${o.total?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-np-accent">${o.avg_per_app ?? o.avgPerApp}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-np-dark">{o.customer_name || o.customer?.name}</div>
                            <div className="text-np-muted text-xs">{o.customer_email || o.customer?.email}</div>
                          </td>
                          <td className="px-4 py-3 text-np-muted">{fmt(o.submitted_at || o.submittedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

        {/* ── LEADS TAB ── */}
        {tab === 'leads' && (
          <div>
            <h2 className="text-np-dark font-bold text-xl mb-4">Leads</h2>
            {leads.length === 0
              ? <EmptyState message="No leads yet. Quote requests and contact form submissions will appear here." />
              : (
                <div className="space-y-4">
                  {leads.map((l, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-np-border p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-np-dark">{l.name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            l.source === 'get_quote'
                              ? 'bg-np-accent/20 text-np-dark'
                              : 'bg-np-surface text-np-muted border border-np-border'}`}>
                            {l.source === 'get_quote' ? 'Quote Request' : 'Contact Form'}
                          </span>
                        </div>
                        <span className="text-np-muted text-xs">{fmt(l.submitted_at || l.submittedAt)}</span>
                      </div>
                      <div className="text-np-muted text-sm mb-2">{l.email}{l.phone ? ` · ${l.phone}` : ''}</div>
                      {l.services?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {l.services.map(s => (
                            <span key={s} className="text-xs bg-np-surface border border-np-border text-np-muted px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      {l.message && <p className="text-np-text text-sm leading-relaxed">{l.message}</p>}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── PROVIDERS TAB ── */}
        {tab === 'providers' && (
          <div>
            <h2 className="text-np-dark font-bold text-xl mb-1">Marketplace Providers</h2>
            <p className="text-np-muted text-sm mb-5">{providers.length} registered · click a row to expand details &amp; quote history</p>
            {providers.length === 0
              ? <EmptyState message="No providers registered yet. Providers who sign up via CleanLawn Marketplace will appear here." />
              : (
                <div className="space-y-3">
                  {providers.map((p, i) => {
                    const name   = p.business_name || p.name || p.email;
                    const isOpen = expanded === p.email;
                    return (
                      <div key={i} className="bg-white rounded-2xl border border-np-border overflow-hidden">

                        {/* Collapsed header row */}
                        <button
                          className="w-full text-left px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-np-surface/40 transition-colors"
                          onClick={() => setExpanded(isOpen ? null : p.email)}>

                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-np-dark flex-shrink-0 flex items-center justify-center text-white font-extrabold text-sm">
                              {name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-np-dark text-sm">{name}</span>
                                {p.badge && (
                                  <span className="text-xs bg-np-accent/15 text-np-dark border border-np-accent/30 px-2 py-0.5 rounded-full">{p.badge}</span>
                                )}
                              </div>
                              <div className="text-np-muted text-xs mt-0.5 truncate">{p.email}{p.phone ? ` · ${p.phone}` : ''}</div>
                              <div className="text-np-muted text-xs">{p.address}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-5 text-xs text-np-muted flex-shrink-0">
                            {p.years_in_business > 0 && <span><strong className="text-np-dark">{p.years_in_business}</strong> yrs</span>}
                            {p.total_jobs > 0       && <span><strong className="text-np-dark">{p.total_jobs}</strong> jobs</span>}
                            {p.team_size > 0        && <span><strong className="text-np-dark">{p.team_size}</strong> crew</span>}
                            <Link to={`/discover/providers/${encodeURIComponent(p.email)}`}
                              onClick={e => e.stopPropagation()}
                              className="text-np-accent font-semibold hover:underline text-xs">
                              Public Profile →
                            </Link>
                          </div>

                          <svg viewBox="0 0 24 24"
                            className={`w-4 h-4 fill-none stroke-np-muted stroke-[2] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </button>

                        {/* Expanded details */}
                        {isOpen && (
                          <div className="border-t border-np-border px-6 py-5 space-y-5">

                            {/* Services offered */}
                            {(p.services_offered || []).length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-np-muted uppercase tracking-wide mb-2">Services Offered</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {(p.services_offered || []).map(s => (
                                    <span key={s} className="text-xs bg-np-surface border border-np-border text-np-dark px-2.5 py-1 rounded-full">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Service areas + equipment + license */}
                            <div className="grid sm:grid-cols-3 gap-4 text-sm">
                              {(p.service_areas || []).length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-np-muted uppercase tracking-wide mb-1">Service Areas</p>
                                  <p className="text-np-muted text-xs">{(p.service_areas || []).join(', ')}</p>
                                </div>
                              )}
                              {p.equipment && (
                                <div>
                                  <p className="text-xs font-bold text-np-muted uppercase tracking-wide mb-1">Equipment</p>
                                  <p className="text-np-muted text-xs">{p.equipment}</p>
                                </div>
                              )}
                              {p.license_number && (
                                <div>
                                  <p className="text-xs font-bold text-np-muted uppercase tracking-wide mb-1">License</p>
                                  <p className="text-np-muted text-xs font-mono">{p.license_number}</p>
                                </div>
                              )}
                            </div>

                            {p.description && (
                              <div>
                                <p className="text-xs font-bold text-np-muted uppercase tracking-wide mb-1">About</p>
                                <p className="text-sm text-np-muted leading-relaxed">{p.description}</p>
                              </div>
                            )}

                            {/* Marketplace quote requests this provider can see */}
                            <div>
                              <p className="text-xs font-bold text-np-muted uppercase tracking-wide mb-2">
                                Marketplace Quote Requests
                                <span className="ml-1 font-normal normal-case text-np-border"> — open requests visible to all providers</span>
                              </p>
                              {quoteRequests.length === 0
                                ? <p className="text-xs text-np-muted italic">No marketplace quote requests yet.</p>
                                : (
                                  <div className="overflow-x-auto rounded-xl border border-np-border">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-np-border bg-np-surface text-np-muted uppercase tracking-wide">
                                          {['Services','Schedule','Preferred Date','Status','Submitted'].map(h => (
                                            <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {quoteRequests.slice(0, 8).map((q, qi) => (
                                          <tr key={qi} className="border-b border-np-border/50 hover:bg-np-surface/40">
                                            <td className="px-3 py-2">
                                              <div className="flex flex-wrap gap-1">
                                                {(q.service_types || []).map(s => (
                                                  <span key={s} className="bg-np-accent/10 text-np-dark px-1.5 py-0.5 rounded">{s}</span>
                                                ))}
                                              </div>
                                            </td>
                                            <td className="px-3 py-2 capitalize text-np-muted">
                                              {q.schedule_type?.replace('_',' ')} {q.recurrence_frequency ? `(${q.recurrence_frequency})` : ''}
                                            </td>
                                            <td className="px-3 py-2 text-np-muted">{fmt(q.preferred_date)}</td>
                                            <td className="px-3 py-2"><StatusPill status={q.status}/></td>
                                            <td className="px-3 py-2 text-np-muted">{fmt(q.created_at || q.submitted_at)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {quoteRequests.length > 8 && (
                                      <p className="text-xs text-np-muted text-center py-2">
                                        Showing 8 of {quoteRequests.length} — <button onClick={() => setTab('mkt_quotes')} className="text-np-accent underline">View all in Mkt Quotes tab</button>
                                      </p>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* ── MARKETPLACE QUOTES TAB ── */}
        {tab === 'mkt_quotes' && (
          <div>
            <h2 className="text-np-dark font-bold text-xl mb-1">Marketplace Quote Requests</h2>
            <p className="text-np-muted text-sm mb-5">{quoteRequests.length} total · {openQuotes} open</p>
            {quoteRequests.length === 0
              ? <EmptyState message="No marketplace quote requests yet. Homeowners who submit requests via the CleanLawn portal will appear here." />
              : (
                <div className="overflow-x-auto rounded-2xl border border-np-border bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-np-border text-np-muted text-xs uppercase tracking-wide">
                        {['Services Needed','Schedule','Preferred Date','Lot Size','Status','Submitted'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quoteRequests.map((q, i) => (
                        <tr key={i} className="border-b border-np-border/50 hover:bg-np-surface/50">
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 mb-1">
                              {(q.service_types || []).map(s => (
                                <span key={s} className="text-xs bg-np-accent/10 text-np-dark border border-np-accent/20 px-2 py-0.5 rounded-full">{s}</span>
                              ))}
                            </div>
                            {q.description && <p className="text-xs text-np-muted line-clamp-1">{q.description}</p>}
                          </td>
                          <td className="px-4 py-3 text-np-muted capitalize">
                            {q.schedule_type?.replace('_', ' ')}
                            {q.recurrence_frequency && <span className="block text-xs">({q.recurrence_frequency})</span>}
                          </td>
                          <td className="px-4 py-3 text-np-muted">{fmt(q.preferred_date)}</td>
                          <td className="px-4 py-3 text-np-muted">{q.lot_size || '—'}</td>
                          <td className="px-4 py-3"><StatusPill status={q.status}/></td>
                          <td className="px-4 py-3 text-np-muted">{fmt(q.created_at || q.submitted_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            <h2 className="text-np-dark font-bold text-xl mb-4">Registered Users</h2>
            {users.length === 0
              ? <EmptyState message="No registered users yet. Users who sign up will appear here." />
              : (
                <div className="overflow-x-auto rounded-2xl border border-np-border bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-np-border text-np-muted text-xs uppercase tracking-wide">
                        {['Email','Role','Registered','Orders'].map(h => (
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
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                u.role === 'admin'    ? 'bg-red-50    text-red-700' :
                                u.role === 'provider' ? 'bg-blue-50   text-blue-700' :
                                                        'bg-np-surface text-np-muted border border-np-border'}`}>
                                {u.role || 'user'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-np-muted">{fmt(u.created_at || u.registeredAt)}</td>
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

      <div className="h-16"/>
    </div>
  );
}
