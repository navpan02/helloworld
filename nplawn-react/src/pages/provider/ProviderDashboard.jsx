import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────── localStorage helpers ─────────────────────── */
function getProfile(email) {
  try {
    const all = JSON.parse(localStorage.getItem('nplawn_provider_profiles') || '{}');
    return all[email] || null;
  } catch { return null; }
}
function saveProfile(profile) {
  const all = JSON.parse(localStorage.getItem('nplawn_provider_profiles') || '{}');
  all[profile.email] = profile;
  localStorage.setItem('nplawn_provider_profiles', JSON.stringify(all));
}
function getQuoteRequests(zips = []) {
  try {
    const all = JSON.parse(localStorage.getItem('nplawn_quote_requests') || '[]');
    return zips.length ? all.filter(q => zips.includes(q.zipCode)) : all;
  } catch { return []; }
}
function getProviderQuotes(email) {
  try {
    return JSON.parse(localStorage.getItem(`nplawn_pquotes_${email}`) || '[]');
  } catch { return []; }
}
function saveProviderQuotes(email, quotes) {
  localStorage.setItem(`nplawn_pquotes_${email}`, JSON.stringify(quotes));
}
function getJobs(email) {
  try {
    return JSON.parse(localStorage.getItem(`nplawn_jobs_${email}`) || '[]');
  } catch { return []; }
}
function saveJobs(email, jobs) {
  localStorage.setItem(`nplawn_jobs_${email}`, JSON.stringify(jobs));
}
function getMessages(email) {
  try {
    return JSON.parse(localStorage.getItem(`nplawn_msgs_${email}`) || '[]');
  } catch { return []; }
}
function saveMessages(email, msgs) {
  localStorage.setItem(`nplawn_msgs_${email}`, JSON.stringify(msgs));
}
function getAvailability(email) {
  const defaults = {
    weeklyWindows: {
      Monday: { enabled: true, start: '08:00', end: '17:00' },
      Tuesday: { enabled: true, start: '08:00', end: '17:00' },
      Wednesday: { enabled: true, start: '08:00', end: '17:00' },
      Thursday: { enabled: true, start: '08:00', end: '17:00' },
      Friday: { enabled: true, start: '08:00', end: '17:00' },
      Saturday: { enabled: false, start: '09:00', end: '13:00' },
      Sunday: { enabled: false, start: '09:00', end: '13:00' },
    },
    blockedDates: [],
    acceptingRequests: true,
    maxJobsPerDay: 4,
    maxJobsPerWeek: 18,
  };
  try {
    return JSON.parse(localStorage.getItem(`nplawn_avail_${email}`)) || defaults;
  } catch { return defaults; }
}
function saveAvailability(email, avail) {
  localStorage.setItem(`nplawn_avail_${email}`, JSON.stringify(avail));
}

/* ─────────────────────── seed demo data ─────────────────────── */
function seedDemoData(email) {
  if (localStorage.getItem(`nplawn_demo_seeded_${email}`)) return;

  // Demo provider profile
  if (!getProfile(email)) {
    saveProfile({
      email,
      businessName: 'Green Horizon Lawn Co.',
      description: 'Family-owned lawn care and landscaping serving Naperville & surrounding suburbs since 2015.',
      phone: '(630) 555-0198',
      address: '500 Ogden Ave, Naperville, IL 60540',
      yearsInBusiness: 9,
      teamSize: 4,
      equipment: '2 riding mowers, walk-behind, chipper, truck fleet',
      licenseNumber: 'IL-LN-20815',
      servicesOffered: ['Lawn Mowing', 'Tree Trimming', 'Aeration & Seeding', 'Leaf Removal', 'Fertilization'],
      serviceAreas: ['60540', '60563', '60517'],
      portfolio: [],
      rating: 4.8,
      totalJobs: 0,
      createdAt: Date.now(),
    });
  }

  // Demo quote requests
  const qrs = [
    { id: 'qr001', homeownerName: 'Raj Patel', homeownerEmail: 'raj@example.com', serviceType: 'Lawn Mowing', address: '402 Elm St, Naperville', zipCode: '60540', propertySize: 'Medium (3000–5000 sqft)', description: 'Need weekly mowing, backyard has a slight slope.', photos: [], submittedAt: new Date(Date.now() - 3600000).toISOString(), status: 'open' },
    { id: 'qr002', homeownerName: 'Sarah Kim', homeownerEmail: 'sarah@example.com', serviceType: 'Tree Trimming', address: '88 Oak Ave, Lisle', zipCode: '60563', propertySize: 'Large (5000+ sqft)', description: '3 mature oaks need crown thinning before summer storms.', photos: [], submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'open' },
    { id: 'qr003', homeownerName: 'Mike Torres', homeownerEmail: 'mike@example.com', serviceType: 'Aeration & Seeding', address: '211 Birch Ct, Woodridge', zipCode: '60517', propertySize: 'Small (under 3000 sqft)', description: 'Lawn is patchy, looking for spring aeration + overseeding.', photos: [], submittedAt: new Date(Date.now() - 172800000).toISOString(), status: 'open' },
  ];
  const existing = JSON.parse(localStorage.getItem('nplawn_quote_requests') || '[]');
  const ids = new Set(existing.map(q => q.id));
  const merged = [...existing, ...qrs.filter(q => !ids.has(q.id))];
  localStorage.setItem('nplawn_quote_requests', JSON.stringify(merged));

  // Demo submitted quotes
  const pquotes = [
    { id: 'pq001', quoteRequestId: 'qr001', providerId: email, homeownerName: 'Raj Patel', serviceType: 'Lawn Mowing', priceType: 'flat', price: 65, estimatedDuration: '1.5 hours', validityDays: 7, notes: 'Includes edging and cleanup.', status: 'accepted', submittedAt: new Date(Date.now() - 2700000).toISOString() },
    { id: 'pq002', quoteRequestId: 'qr002', providerId: email, homeownerName: 'Sarah Kim', serviceType: 'Tree Trimming', priceType: 'range', priceMin: 280, priceMax: 350, estimatedDuration: '3–4 hours', validityDays: 5, notes: 'Final price depends on canopy access.', status: 'pending', submittedAt: new Date(Date.now() - 3600000).toISOString() },
  ];
  saveProviderQuotes(email, pquotes);

  // Demo jobs
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const jobs = [
    { id: 'job001', quoteId: 'pq001', homeownerName: 'Raj Patel', homeownerEmail: 'raj@example.com', serviceType: 'Lawn Mowing', address: '402 Elm St, Naperville', scheduledDate: today, scheduledTime: '09:00', status: 'scheduled', isRecurring: true, recurringFrequency: 'Weekly', notes: '' },
    { id: 'job002', quoteId: null, homeownerName: 'Sarah Kim', homeownerEmail: 'sarah@example.com', serviceType: 'Tree Trimming', address: '88 Oak Ave, Lisle', scheduledDate: tomorrow, scheduledTime: '10:30', status: 'scheduled', isRecurring: false, recurringFrequency: null, notes: 'Bring chipper' },
    { id: 'job003', quoteId: null, homeownerName: 'Dave Nguyen', homeownerEmail: 'dave@example.com', serviceType: 'Leaf Removal', address: '55 Cedar Ln, Downers Grove', scheduledDate: yesterday, scheduledTime: '08:00', status: 'complete', isRecurring: false, recurringFrequency: null, notes: '' },
    { id: 'job004', quoteId: null, homeownerName: 'Lisa Grant', homeownerEmail: 'lisa@example.com', serviceType: 'Fertilization', address: '301 Pine Dr, Naperville', scheduledDate: yesterday, scheduledTime: '13:00', status: 'complete', isRecurring: false, recurringFrequency: null, notes: '' },
  ];
  saveJobs(email, jobs);

  // Demo messages
  const msgs = [
    { id: 'msg001', threadId: 'thread_raj', fromId: 'raj@example.com', fromName: 'Raj Patel', toId: email, content: 'Hi! Can you come by Wednesday morning instead of Thursday?', sentAt: new Date(Date.now() - 1800000).toISOString(), read: false },
    { id: 'msg002', threadId: 'thread_raj', fromId: email, fromName: 'Me', toId: 'raj@example.com', content: "Sure, Wednesday at 9 AM works. I'll confirm the day before.", sentAt: new Date(Date.now() - 900000).toISOString(), read: true },
    { id: 'msg003', threadId: 'thread_sarah', fromId: 'sarah@example.com', fromName: 'Sarah Kim', toId: email, content: "Does your quote include hauling away the branches?", sentAt: new Date(Date.now() - 7200000).toISOString(), read: true },
  ];
  saveMessages(email, msgs);

  localStorage.setItem(`nplawn_demo_seeded_${email}`, '1');
}

/* ─────────────────────── TABS list ─────────────────────── */
const TABS = [
  { id: 'overview',      label: 'Overview',     icon: '▦' },
  { id: 'profile',       label: 'Profile',      icon: '👤' },
  { id: 'portfolio',     label: 'Portfolio',    icon: '🖼' },
  { id: 'quotes',        label: 'Quotes',       icon: '📋' },
  { id: 'jobs',          label: 'Jobs',         icon: '📅' },
  { id: 'messages',      label: 'Messages',     icon: '💬' },
  { id: 'availability',  label: 'Availability', icon: '🕐' },
];

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  complete: 'bg-green-100 text-green-700',
  accepted: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  withdrawn: 'bg-gray-100 text-gray-500',
  rejected: 'bg-red-100 text-red-600',
  open: 'bg-blue-100 text-blue-700',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ═══════════════════════════════════════════════════════════════ */
export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const email = user?.email || '';

  // data state
  const [profile, setProfile]       = useState(null);
  const [quoteReqs, setQuoteReqs]   = useState([]);
  const [myQuotes, setMyQuotes]     = useState([]);
  const [jobs, setJobs]             = useState([]);
  const [messages, setMessages]     = useState([]);
  const [avail, setAvail]           = useState(null);

  // profile edit state
  const [profileDraft, setProfileDraft] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);

  // quote form state
  const [quoteForm, setQuoteForm] = useState(null); // { requestId } or null
  const [qPrice, setQPrice]           = useState('');
  const [qPriceType, setQPriceType]   = useState('flat');
  const [qPriceMax, setQPriceMax]     = useState('');
  const [qDuration, setQDuration]     = useState('');
  const [qValidity, setQValidity]     = useState('7');
  const [qNotes, setQNotes]           = useState('');

  // new message state
  const [activeThread, setActiveThread] = useState(null);
  const [newMsg, setNewMsg] = useState('');

  // job reschedule modal
  const [rescheduleJob, setRescheduleJob] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // portfolio
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioLabel, setPortfolioLabel] = useState('');

  // block date
  const [blockDate, setBlockDate] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'provider' && user.role !== 'admin') { navigate('/'); return; }
    seedDemoData(email);
    reload();
  }, [email]);

  function reload() {
    const p = getProfile(email);
    setProfile(p);
    setProfileDraft(p ? { ...p } : null);
    setPortfolioItems(p?.portfolio || []);
    const reqs = getQuoteRequests(p?.serviceAreas || []);
    setQuoteReqs(reqs);
    setMyQuotes(getProviderQuotes(email));
    setJobs(getJobs(email));
    setMessages(getMessages(email));
    setAvail(getAvailability(email));
  }

  /* ── derived stats ── */
  const activeJobs    = jobs.filter(j => j.status !== 'complete').length;
  const pendingQuotes = myQuotes.filter(q => q.status === 'pending').length;
  const totalDone     = jobs.filter(j => j.status === 'complete').length;
  const acceptedQuotes = myQuotes.filter(q => q.status === 'accepted').length;
  const totalQuotes    = myQuotes.length;
  const convRate       = totalQuotes ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;
  const demoEarnings   = myQuotes.filter(q => q.status === 'accepted')
    .reduce((s, q) => s + (q.price || q.priceMax || 0), 0);
  const unreadCount    = messages.filter(m => !m.read && m.toId === email).length;

  /* ── handlers ── */
  function handleLogout() { logout(); navigate('/'); }

  function handleProfileSave(e) {
    e.preventDefault();
    saveProfile(profileDraft);
    setProfile({ ...profileDraft });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function submitQuote(reqId) {
    const req = quoteReqs.find(r => r.id === reqId);
    if (!req) return;
    const newQ = {
      id: `pq${Date.now()}`,
      quoteRequestId: reqId,
      providerId: email,
      homeownerName: req.homeownerName,
      serviceType: req.serviceType,
      priceType: qPriceType,
      price: qPriceType === 'flat' ? parseFloat(qPrice) : parseFloat(qPrice),
      priceMax: qPriceType === 'range' ? parseFloat(qPriceMax) : undefined,
      estimatedDuration: qDuration,
      validityDays: parseInt(qValidity),
      notes: qNotes,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const updated = [...myQuotes, newQ];
    saveProviderQuotes(email, updated);
    setMyQuotes(updated);
    setQuoteForm(null);
    setQPrice(''); setQPriceMax(''); setQDuration(''); setQValidity('7'); setQNotes('');
  }

  function withdrawQuote(qid) {
    const updated = myQuotes.map(q => q.id === qid ? { ...q, status: 'withdrawn' } : q);
    saveProviderQuotes(email, updated);
    setMyQuotes(updated);
  }

  function updateJobStatus(jid, status) {
    const updated = jobs.map(j => j.id === jid ? { ...j, status } : j);
    saveJobs(email, updated);
    setJobs(updated);
  }

  function doReschedule() {
    const updated = jobs.map(j => j.id === rescheduleJob.id
      ? { ...j, scheduledDate: newDate, scheduledTime: newTime, status: 'scheduled' } : j);
    saveJobs(email, updated);
    setJobs(updated);
    setRescheduleJob(null);
  }

  function sendMessage() {
    if (!newMsg.trim() || !activeThread) return;
    const thread = getThreads().find(t => t.threadId === activeThread);
    const msg = {
      id: `msg${Date.now()}`,
      threadId: activeThread,
      fromId: email,
      fromName: 'Me',
      toId: thread?.partnerId || '',
      content: newMsg.trim(),
      sentAt: new Date().toISOString(),
      read: true,
    };
    const updated = [...messages, msg];
    saveMessages(email, updated);
    setMessages(updated);
    setNewMsg('');
  }

  function getThreads() {
    const threadMap = {};
    messages.forEach(m => {
      const partnerId = m.fromId === email ? m.toId : m.fromId;
      const partnerName = m.fromId === email ? (m.toId.split('@')[0]) : m.fromName;
      if (!threadMap[m.threadId]) {
        threadMap[m.threadId] = { threadId: m.threadId, partnerId, partnerName, msgs: [], unread: 0 };
      }
      threadMap[m.threadId].msgs.push(m);
      if (!m.read && m.toId === email) threadMap[m.threadId].unread++;
    });
    return Object.values(threadMap).sort((a, b) =>
      new Date(b.msgs.at(-1)?.sentAt) - new Date(a.msgs.at(-1)?.sentAt));
  }

  function toggleAvailDay(day) {
    const updated = { ...avail, weeklyWindows: { ...avail.weeklyWindows, [day]: { ...avail.weeklyWindows[day], enabled: !avail.weeklyWindows[day].enabled } } };
    setAvail(updated);
    saveAvailability(email, updated);
  }
  function updateAvailWindow(day, field, val) {
    const updated = { ...avail, weeklyWindows: { ...avail.weeklyWindows, [day]: { ...avail.weeklyWindows[day], [field]: val } } };
    setAvail(updated);
    saveAvailability(email, updated);
  }
  function addBlockDate() {
    if (!blockDate || avail.blockedDates.includes(blockDate)) return;
    const updated = { ...avail, blockedDates: [...avail.blockedDates, blockDate].sort() };
    setAvail(updated);
    saveAvailability(email, updated);
    setBlockDate('');
  }
  function removeBlockDate(d) {
    const updated = { ...avail, blockedDates: avail.blockedDates.filter(x => x !== d) };
    setAvail(updated);
    saveAvailability(email, updated);
  }
  function toggleAccepting() {
    const updated = { ...avail, acceptingRequests: !avail.acceptingRequests };
    setAvail(updated);
    saveAvailability(email, updated);
  }

  function addPortfolioItem() {
    if (!portfolioLabel.trim()) return;
    const item = { id: `port${Date.now()}`, label: portfolioLabel.trim(), addedAt: new Date().toISOString() };
    const updated = [...portfolioItems, item];
    setPortfolioItems(updated);
    const p = { ...(profile || {}), portfolio: updated };
    saveProfile(p);
    setPortfolioLabel('');
  }
  function removePortfolioItem(id) {
    const updated = portfolioItems.filter(i => i.id !== id);
    setPortfolioItems(updated);
    const p = { ...(profile || {}), portfolio: updated };
    saveProfile(p);
  }

  const threads = getThreads();
  const activeThreadData = threads.find(t => t.threadId === activeThread);

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-np-surface flex flex-col">

      {/* Top bar */}
      <header className="bg-np-dark px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-np-lite to-np-accent flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 20V10C12 6 9 3 5 4c1 4 4 7 7 7" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20V12C12 8 15 5 19 6c-1 4-4 7-7 7" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="4" y1="20" x2="20" y2="20" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-sm">Provider Portal</span>
            <p className="text-white/50 text-xs leading-none">{profile?.businessName || email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {avail && !avail.acceptingRequests && (
            <span className="hidden sm:block text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-full">
              Paused — not accepting requests
            </span>
          )}
          <Link to="/" className="text-white/60 hover:text-white text-xs transition-colors">Home</Link>
          <button onClick={handleLogout} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-52 bg-white border-r border-np-border flex flex-col py-4 shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all text-left relative ${
                tab === t.id
                  ? 'bg-np-surface text-np-green border-r-2 border-np-green'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              <span className="text-base">{t.icon}</span>
              {t.label}
              {t.id === 'messages' && unreadCount > 0 && (
                <span className="ml-auto text-xs bg-np-accent text-np-dark font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              {t.id === 'quotes' && pendingQuotes > 0 && (
                <span className="ml-auto text-xs bg-yellow-400 text-yellow-900 font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingQuotes}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-np-text">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                {profile?.businessName || email.split('@')[0]}
              </h1>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Jobs" value={activeJobs} sub="in schedule" color="text-blue-600" />
                <StatCard label="Pending Quotes" value={pendingQuotes} sub="awaiting response" color="text-yellow-600" />
                <StatCard label="Earnings (YTD)" value={`$${demoEarnings}`} sub="accepted quotes" color="text-np-green" />
                <StatCard label="Jobs Completed" value={totalDone} sub="all time" color="text-np-mid" />
              </div>

              {/* Performance metrics */}
              <div className="bg-white rounded-2xl border border-np-border p-5">
                <h2 className="font-bold text-np-text mb-4">Performance</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Metric label="Conversion Rate" value={`${convRate}%`} hint="Quote → Job" />
                  <Metric label="Avg. Rating" value="4.8 ★" hint="from 12 reviews" />
                  <Metric label="Response Time" value="< 2 hrs" hint="avg. this month" />
                </div>
              </div>

              {/* Upcoming jobs */}
              <div className="bg-white rounded-2xl border border-np-border p-5">
                <h2 className="font-bold text-np-text mb-4">Upcoming Jobs</h2>
                {jobs.filter(j => j.status !== 'complete').length === 0
                  ? <p className="text-sm text-gray-400">No upcoming jobs.</p>
                  : jobs.filter(j => j.status !== 'complete').slice(0, 3).map(j => (
                    <div key={j.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 rounded-xl bg-np-surface flex items-center justify-center text-lg">📅</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-np-text truncate">{j.serviceType} — {j.homeownerName}</p>
                        <p className="text-xs text-gray-400">{j.scheduledDate} at {j.scheduledTime} · {j.address}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[j.status]}`}>
                        {j.status}
                      </span>
                    </div>
                  ))
                }
              </div>

              {/* Recent messages preview */}
              {unreadCount > 0 && (
                <div className="bg-white rounded-2xl border border-np-border p-5 cursor-pointer hover:border-np-accent transition-colors"
                  onClick={() => setTab('messages')}>
                  <h2 className="font-bold text-np-text mb-3">
                    Unread Messages <span className="text-np-accent">({unreadCount})</span>
                  </h2>
                  {messages.filter(m => !m.read && m.toId === email).slice(0, 2).map(m => (
                    <div key={m.id} className="flex gap-3 items-start py-2 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-np-lite/30 flex items-center justify-center text-sm font-bold text-np-green">
                        {m.fromName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-np-text">{m.fromName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{m.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === 'profile' && !profileDraft && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Loading profile…</p>
            </div>
          )}
          {tab === 'profile' && profileDraft && (
            <div className="max-w-2xl space-y-6">
              <h1 className="text-xl font-bold text-np-text">Business Profile</h1>
              <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-np-border p-6 space-y-5">
                <PField label="Business Name" value={profileDraft.businessName || ''} onChange={v => setProfileDraft(d => ({ ...d, businessName: v }))} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={profileDraft.description || ''}
                    onChange={e => setProfileDraft(d => ({ ...d, description: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 resize-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <PField label="Phone" value={profileDraft.phone || ''} onChange={v => setProfileDraft(d => ({ ...d, phone: v }))} />
                  <PField label="Years in Business" type="number" value={profileDraft.yearsInBusiness || ''} onChange={v => setProfileDraft(d => ({ ...d, yearsInBusiness: v }))} />
                </div>
                <PField label="Business Address" value={profileDraft.address || ''} onChange={v => setProfileDraft(d => ({ ...d, address: v }))} />
                <div className="grid grid-cols-2 gap-4">
                  <PField label="Team Size" type="number" value={profileDraft.teamSize || ''} onChange={v => setProfileDraft(d => ({ ...d, teamSize: v }))} />
                  <PField label="License Number" value={profileDraft.licenseNumber || ''} onChange={v => setProfileDraft(d => ({ ...d, licenseNumber: v }))} />
                </div>
                <PField label="Equipment / Fleet" value={profileDraft.equipment || ''} onChange={v => setProfileDraft(d => ({ ...d, equipment: v }))} />

                {/* Services offered */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {['Lawn Mowing','Tree Trimming','Tree & Shrub Care','Aeration & Seeding','Landscape Design','Fertilization','Weed Control','Leaf Removal','Snow Removal','Irrigation','Mulching','Hardscaping'].map(s => {
                      const active = (profileDraft.servicesOffered || []).includes(s);
                      return (
                        <button key={s} type="button"
                          onClick={() => setProfileDraft(d => ({
                            ...d,
                            servicesOffered: active
                              ? (d.servicesOffered || []).filter(x => x !== s)
                              : [...(d.servicesOffered || []), s]
                          }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            active ? 'bg-np-green text-white border-np-green' : 'bg-white text-gray-600 border-gray-300 hover:border-np-green'
                          }`}>{s}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Service areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas (ZIP Codes)</label>
                  <div className="flex flex-wrap gap-2">
                    {['60540','60563','60564','60565','60515','60517','60521','60523','60527','60559'].map(z => {
                      const active = (profileDraft.serviceAreas || []).includes(z);
                      return (
                        <button key={z} type="button"
                          onClick={() => setProfileDraft(d => ({
                            ...d,
                            serviceAreas: active
                              ? (d.serviceAreas || []).filter(x => x !== z)
                              : [...(d.serviceAreas || []), z]
                          }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            active ? 'bg-np-accent text-np-dark border-np-accent' : 'bg-white text-gray-600 border-gray-300 hover:border-np-accent'
                          }`}>{z}</button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button type="submit" className="px-6 py-2.5 bg-np-green hover:bg-np-mid text-white font-semibold rounded-lg text-sm transition-colors">
                    Save Changes
                  </button>
                  {profileSaved && <span className="text-sm text-np-green font-medium">Saved ✓</span>}
                </div>
              </form>
            </div>
          )}

          {/* ── PORTFOLIO ── */}
          {tab === 'portfolio' && (
            <div className="max-w-2xl space-y-5">
              <h1 className="text-xl font-bold text-np-text">Portfolio Gallery</h1>
              <p className="text-sm text-gray-500">Showcase before & after photos. Upload via your device and add a label.</p>
              <div className="bg-white rounded-2xl border border-np-border p-5">
                <div className="flex gap-3 mb-5">
                  <input type="text" value={portfolioLabel} onChange={e => setPortfolioLabel(e.target.value)}
                    placeholder="Photo label e.g. 'Before & After — Oak Park Mow'" onKeyDown={e => e.key === 'Enter' && addPortfolioItem()}
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 transition-all" />
                  <button onClick={addPortfolioItem}
                    className="px-4 py-2 bg-np-green text-white rounded-lg text-sm font-medium hover:bg-np-mid transition-colors">
                    + Add
                  </button>
                </div>
                {portfolioItems.length === 0
                  ? (
                    <div className="text-center py-12 text-gray-300">
                      <div className="text-5xl mb-3">🖼</div>
                      <p className="text-sm">No portfolio items yet. Add a label above to get started.</p>
                    </div>
                  )
                  : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {portfolioItems.map(item => (
                        <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-np-surface aspect-[4/3] flex flex-col items-center justify-center">
                          <div className="text-4xl mb-2">📸</div>
                          <p className="text-xs text-center text-gray-500 px-2">{item.label}</p>
                          <button onClick={() => removePortfolioItem(item.id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center font-bold">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {/* ── QUOTES ── */}
          {tab === 'quotes' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-np-text">Quote Management</h1>

              {/* Incoming requests */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Incoming Requests</h2>
                {quoteReqs.filter(r => r.status === 'open').length === 0
                  ? <BlankSlate icon="📋" text="No open requests in your service areas." />
                  : quoteReqs.filter(r => r.status === 'open').map(req => {
                    const alreadyQuoted = myQuotes.find(q => q.quoteRequestId === req.id && q.status !== 'withdrawn');
                    return (
                      <div key={req.id} className="bg-white rounded-2xl border border-np-border p-5 mb-3">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-semibold text-np-text">{req.serviceType}</p>
                            <p className="text-sm text-gray-500">{req.homeownerName} · {req.address}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{req.propertySize} · ZIP {req.zipCode} · {new Date(req.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {alreadyQuoted
                            ? <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[alreadyQuoted.status]}`}>
                                Quote {alreadyQuoted.status}
                              </span>
                            : <button onClick={() => setQuoteForm(req.id)}
                                className="shrink-0 px-4 py-2 bg-np-green text-white text-sm font-medium rounded-lg hover:bg-np-mid transition-colors">
                                Submit Quote
                              </button>
                          }
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">{req.description}</p>

                        {/* Inline quote form */}
                        {quoteForm === req.id && (
                          <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                            <p className="text-sm font-semibold text-np-text">Your Quote</p>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Price Type</label>
                                <select value={qPriceType} onChange={e => setQPriceType(e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green">
                                  <option value="flat">Flat Rate</option>
                                  <option value="range">Estimate Range</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">{qPriceType === 'flat' ? 'Price ($)' : 'Min ($)'}</label>
                                <input type="number" value={qPrice} onChange={e => setQPrice(e.target.value)} placeholder="0"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                              </div>
                              {qPriceType === 'range' && (
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                                  <input type="number" value={qPriceMax} onChange={e => setQPriceMax(e.target.value)} placeholder="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Est. Duration</label>
                                <input type="text" value={qDuration} onChange={e => setQDuration(e.target.value)} placeholder="e.g. 2–3 hours"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Valid (days)</label>
                                <input type="number" value={qValidity} onChange={e => setQValidity(e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Notes / Conditions</label>
                              <textarea rows={2} value={qNotes} onChange={e => setQNotes(e.target.value)} placeholder="Any conditions, inclusions, or notes…"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green resize-none" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => submitQuote(req.id)}
                                className="px-5 py-2 bg-np-green text-white text-sm font-medium rounded-lg hover:bg-np-mid transition-colors">
                                Send Quote
                              </button>
                              <button onClick={() => setQuoteForm(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </section>

              {/* My submitted quotes */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">My Submitted Quotes</h2>
                {myQuotes.length === 0
                  ? <BlankSlate icon="📤" text="No quotes submitted yet." />
                  : myQuotes.map(q => (
                    <div key={q.id} className="bg-white rounded-2xl border border-np-border p-4 mb-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-np-text text-sm">{q.serviceType} — {q.homeownerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {q.priceType === 'flat'
                            ? `$${q.price} flat`
                            : `$${q.price}–$${q.priceMax} range`
                          } · {q.estimatedDuration} · Valid {q.validityDays}d
                        </p>
                        {q.notes && <p className="text-xs text-gray-500 mt-1 truncate">{q.notes}</p>}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[q.status]}`}>
                        {q.status}
                      </span>
                      {q.status === 'pending' && (
                        <button onClick={() => withdrawQuote(q.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0">
                          Withdraw
                        </button>
                      )}
                    </div>
                  ))
                }
              </section>
            </div>
          )}

          {/* ── JOBS ── */}
          {tab === 'jobs' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-np-text">Jobs & Schedule</h1>

              {/* Status filter tabs */}
              {['all', 'scheduled', 'in-progress', 'complete'].map(s => (
                <span key={s} />
              ))}

              <div className="space-y-3">
                {jobs.length === 0
                  ? <BlankSlate icon="📅" text="No jobs yet." />
                  : jobs.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)).map(j => (
                    <div key={j.id} className="bg-white rounded-2xl border border-np-border p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-np-surface flex items-center justify-center text-xl shrink-0">
                          {j.serviceType.startsWith('Mow') ? '🌿' : j.serviceType.startsWith('Tree') ? '🌲' : '🏡'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-np-text text-sm">{j.serviceType}</p>
                            {j.isRecurring && (
                              <span className="text-xs bg-np-surface text-np-mid border border-np-border px-2 py-0.5 rounded-full">
                                🔁 {j.recurringFrequency}
                              </span>
                            )}
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[j.status]}`}>
                              {j.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{j.homeownerName} · {j.address}</p>
                          <p className="text-xs text-gray-400">{j.scheduledDate} at {j.scheduledTime}</p>
                          {j.notes && <p className="text-xs text-gray-400 mt-1 italic">{j.notes}</p>}
                        </div>
                        {/* Job actions */}
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                          {j.status === 'scheduled' && (
                            <>
                              <button onClick={() => updateJobStatus(j.id, 'in-progress')}
                                className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors font-medium">
                                Start
                              </button>
                              <button onClick={() => { setRescheduleJob(j); setNewDate(j.scheduledDate); setNewTime(j.scheduledTime); }}
                                className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                                Reschedule
                              </button>
                            </>
                          )}
                          {j.status === 'in-progress' && (
                            <button onClick={() => updateJobStatus(j.id, 'complete')}
                              className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium">
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Reschedule modal */}
              {rescheduleJob && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                    <h3 className="font-bold text-np-text mb-4">Reschedule Job</h3>
                    <p className="text-sm text-gray-500 mb-4">{rescheduleJob.serviceType} — {rescheduleJob.homeownerName}</p>
                    <div className="space-y-3 mb-5">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">New Date</label>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">New Time</label>
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={doReschedule}
                        className="flex-1 py-2.5 bg-np-green text-white rounded-lg text-sm font-medium hover:bg-np-mid transition-colors">
                        Confirm Reschedule
                      </button>
                      <button onClick={() => setRescheduleJob(null)}
                        className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {tab === 'messages' && (
            <div className="h-full">
              <h1 className="text-xl font-bold text-np-text mb-4">Messages</h1>
              <div className="flex gap-4 h-[calc(100vh-14rem)]">

                {/* Thread list */}
                <div className="w-64 shrink-0 bg-white rounded-2xl border border-np-border overflow-y-auto">
                  {threads.length === 0
                    ? <p className="text-sm text-gray-400 p-5">No conversations yet.</p>
                    : threads.map(t => (
                      <button key={t.threadId} onClick={() => setActiveThread(t.threadId)}
                        className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeThread === t.threadId ? 'bg-np-surface' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-np-lite/30 flex items-center justify-center text-sm font-bold text-np-green shrink-0">
                            {t.partnerName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-np-text truncate">{t.partnerName}</p>
                            <p className="text-xs text-gray-400 truncate">{t.msgs.at(-1)?.content}</p>
                          </div>
                          {t.unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-np-accent text-np-dark text-xs font-bold flex items-center justify-center shrink-0">
                              {t.unread}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  }
                </div>

                {/* Chat window */}
                <div className="flex-1 bg-white rounded-2xl border border-np-border flex flex-col overflow-hidden">
                  {!activeThread
                    ? <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Select a conversation</div>
                    : (
                      <>
                        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-np-text text-sm">
                          {activeThreadData?.partnerName}
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                          {activeThreadData?.msgs.map(m => (
                            <div key={m.id} className={`flex ${m.fromId === email ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                m.fromId === email
                                  ? 'bg-np-green text-white rounded-br-sm'
                                  : 'bg-gray-100 text-np-text rounded-bl-sm'
                              }`}>
                                <p>{m.content}</p>
                                <p className={`text-xs mt-1 ${m.fromId === email ? 'text-white/60' : 'text-gray-400'}`}>
                                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
                          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message…"
                            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 transition-all" />
                          <button onClick={sendMessage}
                            className="px-4 py-2 bg-np-green text-white rounded-xl text-sm font-medium hover:bg-np-mid transition-colors">
                            Send
                          </button>
                        </div>
                      </>
                    )
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── AVAILABILITY ── */}
          {tab === 'availability' && avail && (
            <div className="max-w-xl space-y-6">
              <h1 className="text-xl font-bold text-np-text">Availability Settings</h1>

              {/* Accepting toggle */}
              <div className="bg-white rounded-2xl border border-np-border p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-np-text text-sm">Accepting New Quote Requests</p>
                  <p className="text-xs text-gray-400 mt-0.5">Turn off to pause incoming requests temporarily</p>
                </div>
                <button onClick={toggleAccepting}
                  className={`w-12 h-6 rounded-full transition-colors relative ${avail.acceptingRequests ? 'bg-np-green' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${avail.acceptingRequests ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Max jobs */}
              <div className="bg-white rounded-2xl border border-np-border p-5 space-y-4">
                <p className="font-semibold text-np-text text-sm">Job Limits</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Jobs / Day</label>
                    <input type="number" value={avail.maxJobsPerDay} min={1} max={20}
                      onChange={e => { const u = { ...avail, maxJobsPerDay: parseInt(e.target.value) }; setAvail(u); saveAvailability(email, u); }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Jobs / Week</label>
                    <input type="number" value={avail.maxJobsPerWeek} min={1} max={100}
                      onChange={e => { const u = { ...avail, maxJobsPerWeek: parseInt(e.target.value) }; setAvail(u); saveAvailability(email, u); }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                  </div>
                </div>
              </div>

              {/* Weekly windows */}
              <div className="bg-white rounded-2xl border border-np-border p-5 space-y-3">
                <p className="font-semibold text-np-text text-sm mb-1">Weekly Availability</p>
                {DAYS.map(day => {
                  const w = avail.weeklyWindows[day];
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <button onClick={() => toggleAvailDay(day)}
                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${w.enabled ? 'bg-np-green' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${w.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                      <span className={`text-sm w-24 font-medium ${w.enabled ? 'text-np-text' : 'text-gray-300'}`}>{day}</span>
                      {w.enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={w.start} onChange={e => updateAvailWindow(day, 'start', e.target.value)}
                            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                          <span className="text-xs text-gray-400">to</span>
                          <input type="time" value={w.end} onChange={e => updateAvailWindow(day, 'end', e.target.value)}
                            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Block dates */}
              <div className="bg-white rounded-2xl border border-np-border p-5 space-y-3">
                <p className="font-semibold text-np-text text-sm">Blocked Dates</p>
                <div className="flex gap-2">
                  <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                  <button onClick={addBlockDate}
                    className="px-4 py-2 bg-np-green text-white rounded-lg text-sm font-medium hover:bg-np-mid transition-colors">
                    Block
                  </button>
                </div>
                {avail.blockedDates.length === 0
                  ? <p className="text-xs text-gray-400">No dates blocked.</p>
                  : (
                    <div className="flex flex-wrap gap-2">
                      {avail.blockedDates.map(d => (
                        <span key={d} className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-full">
                          {d}
                          <button onClick={() => removeBlockDate(d)} className="font-bold text-red-400 hover:text-red-600">×</button>
                        </span>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ── tiny helper components ── */
function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-np-border p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-bold text-np-text">{value}</p>
      <p className="text-xs text-gray-400">{hint}</p>
    </div>
  );
}

function PField({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 transition-all" />
    </div>
  );
}

function BlankSlate({ icon, text }) {
  return (
    <div className="bg-white rounded-2xl border border-np-border py-12 text-center text-gray-300">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
