import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalHeader from '../../components/rp/PortalHeader';
import PortalAuthGuard from '../../components/rp/PortalAuthGuard';

const TodaysRoutes    = lazy(() => import('./tabs/TodaysRoutes'));
const ConstraintsTab  = lazy(() => import('./tabs/ConstraintsTab'));
const AgentsTab       = lazy(() => import('./tabs/AgentsTab'));
const DrawRouteTab    = lazy(() => import('./tabs/DrawRouteTab'));

const TABS = [
  { id: 'routes',      label: "Today's Routes", icon: '🗺' },
  { id: 'draw',        label: 'Add/Edit Route', icon: '✏️' },
  { id: 'agents',      label: 'Agents',         icon: '👤' },
  { id: 'constraints', label: 'Constraints',    icon: '⚙️' },
];

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <PortalAuthGuard portal="manager">
      {(session) => (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <PortalHeader
            title={`Route Planner — ${session.branchName ?? 'Branch Manager'}`}
            session={session}
            portal="manager"
            onLogout={() => navigate('/rp-manager/login')}
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
              {activeTab === 'routes'      && <TodaysRoutes session={session} />}
              {activeTab === 'draw'        && <DrawRouteTab session={session} />}
              {activeTab === 'agents'      && <AgentsTab    session={session} />}
              {activeTab === 'constraints' && <ConstraintsTab session={session} />}
            </Suspense>
          </div>
        </div>
      )}
    </PortalAuthGuard>
  );
}
