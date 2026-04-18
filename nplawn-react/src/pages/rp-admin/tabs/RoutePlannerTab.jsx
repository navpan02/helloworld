import { lazy, Suspense } from 'react';

// Reuse the existing RoutePlanner page wholesale inside the admin portal tab
const RoutePlanner = lazy(() => import('../../RoutePlanner'));

export default function RoutePlannerTab({ session }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading route planner…</div>}>
      <RoutePlanner portalSession={session} />
    </Suspense>
  );
}
