import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalHeader from '../../components/rp/PortalHeader';
import PortalAuthGuard from '../../components/rp/PortalAuthGuard';

const RoutePlannerTab  = lazy(() => import('./tabs/RoutePlannerTab'));
const ManagerAccounts  = lazy(() => import('./tabs/ManagerAccounts'));
const BranchesTab      = lazy(() => import('./tabs/BranchesTab'));
const AgentRosterTab   = lazy(() => import('./tabs/AgentRosterTab'));

const TABS = [
  { id: 'planner',  label: 'Route Planner', icon: '🗺' },
  { id: 'agents',   label: 'Agents',        icon: '👤' },
  { id: 'branches', label: 'Branches',      icon: '🏢' },
  { id: 'managers', label: 'Manager Accounts', icon: '🔑' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <PortalAuthGuard portal="admin">
      {(session) => (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <PortalHeader
            title="Route Planner — Admin"
            session={session}
            portal="admin"
            onLogout={() => navigate('/rp-admin/login')}
          />

          {/* Tab bar */}
          <div className="bg-white border-b border-gray-200 px-6">
            <nav className="flex gap-1 -mb-px">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading…</div>}>
              {activeTab === 'planner'  && <RoutePlannerTab session={session} />}
              {activeTab === 'agents'   && <AgentRosterTab  session={session} />}
              {activeTab === 'branches' && <BranchesTab     session={session} />}
              {activeTab === 'managers' && <ManagerAccounts session={session} />}
            </Suspense>
          </div>
        </div>
      )}
    </PortalAuthGuard>
  );
}
