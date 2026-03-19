import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const TABS = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'plans',       label: 'Lawn Care Plans' },
];

const MARKETPLACE_SECTIONS = [
  {
    title: 'Find & Book',
    links: [
      { to: '/CleanLawn/homeowner/quote-request', icon: '📋', label: 'Request a Quote',   desc: 'Get competitive bids from local pros' },
      { to: '/CleanLawn/homeowner/discover',      icon: '🔍', label: 'Find Providers',     desc: 'Browse & filter lawn care pros' },
      { to: '/CleanLawn/homeowner/quotes',        icon: '💬', label: 'My Quotes',          desc: 'Review offers from providers' },
      { to: '/CleanLawn/homeowner/jobs',          icon: '🗓️', label: 'My Jobs',            desc: 'Track upcoming & past services' },
    ],
  },
  {
    title: 'Activity',
    links: [
      { to: '/CleanLawn/homeowner/messages',  icon: '✉️', label: 'Messages',          desc: 'Chat with your service pros' },
      { to: '/CleanLawn/homeowner/feedback',  icon: '⭐', label: 'Ratings & Feedback', desc: 'Rate completed services' },
      { to: '/CleanLawn/homeowner/notes',     icon: '📝', label: 'Provider Notes',    desc: 'Gate codes, pets & access instructions' },
    ],
  },
];

const PLANS_SECTIONS = [
  {
    title: 'My Plan',
    links: [
      { to: '/CleanLawn/homeowner/plan',     icon: '⭐', label: 'Manage Plan',      desc: 'Upgrade or downgrade your service plan' },
      { to: '/CleanLawn/homeowner/schedule', icon: '🔁', label: 'Recurring Plans',  desc: 'Manage & reschedule your recurring services' },
      { to: '/CleanLawn/homeowner/properties', icon: '🏡', label: 'My Properties', desc: 'Manage your property profiles' },
    ],
  },
  {
    title: 'Billing',
    links: [
      { to: '/CleanLawn/homeowner/billing',  icon: '🧾', label: 'Billing & Invoices', desc: 'View and pay your service invoices' },
      { to: '/CleanLawn/homeowner/payments', icon: '💳', label: 'Payment Methods',    desc: 'Manage saved cards and auto-pay' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/CleanLawn/homeowner/profile',       icon: '👤', label: 'My Profile',    desc: 'Update your account details' },
      { to: '/CleanLawn/homeowner/notifications', icon: '🔔', label: 'Notifications', desc: 'Email & SMS notification preferences' },
      { to: '/CleanLawn/homeowner/referral',      icon: '🎁', label: 'Refer a Friend', desc: 'Give $20, get $20 for every referral' },
    ],
  },
];

export default function HomeownerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const [activeTab, setActiveTab] = useState('marketplace');

  const sections = activeTab === 'marketplace' ? MARKETPLACE_SECTIONS : PLANS_SECTIONS;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero bar */}
      <div className="bg-np-dark text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-np-lite text-sm font-medium mb-1">CleanLawn Homeowner Portal</p>
          <h1 className="text-3xl font-bold mb-1">Welcome back, {firstName}!</h1>
          <p className="text-white/70 text-sm">Manage your lawn care services, quotes, and scheduled appointments.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-5xl mx-auto px-4 -mt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Active Jobs',      value: '—' },
            { label: 'Pending Quotes',   value: '—' },
            { label: 'Recurring Plans',  value: '—' },
            { label: 'Unread Messages',  value: '—' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
              <div className="text-2xl font-bold text-np-dark">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {sections.map(({ title, links }) => (
          <div key={title}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {links.map(({ to, icon, label, desc }) => (
                <Link key={to} to={to}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-green-200 transition-all group">
                  <div className="text-3xl mb-3">{icon}</div>
                  <div className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{label}</div>
                  <div className="text-xs text-gray-500 mt-1">{desc}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-green-600 rounded-2xl text-white p-8 text-center">
          {activeTab === 'marketplace' ? (
            <>
              <h3 className="text-xl font-bold mb-2">Ready to schedule your next service?</h3>
              <p className="text-white/80 text-sm mb-5">Get free quotes from top-rated local lawn care professionals.</p>
              <Link to="/CleanLawn/homeowner/quote-request"
                className="inline-block bg-white text-green-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm">
                Request a Quote Now
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2">Looking for a recurring plan?</h3>
              <p className="text-white/80 text-sm mb-5">Set up automatic lawn care on your schedule and save.</p>
              <Link to="/CleanLawn/homeowner/plan"
                className="inline-block bg-white text-green-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm">
                View Plans
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
