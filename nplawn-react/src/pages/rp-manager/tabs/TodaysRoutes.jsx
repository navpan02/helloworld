import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { exportAgentCSV, exportAllCSV, buildGoogleMapsUrls } from '../../../utils/routeExport';

function buildClusters(stops) {
  const map = new Map();
  for (const stop of stops) {
    const cid = stop.cluster_id ?? 'C0';
    if (!map.has(cid)) map.set(cid, []);
    map.get(cid).push(stop);
  }
  return Array.from(map.entries()).map(([id, clStops]) => {
    const lat = clStops.reduce((s, p) => s + (p.lat ?? 0), 0) / clStops.length;
    const lng = clStops.reduce((s, p) => s + (p.lng ?? 0), 0) / clStops.length;
    return { id, center: { lat, lng }, size: clStops.length, stops: clStops };
  });
}

const RouteMap      = lazy(() => import('../../../components/RouteMap'));
const RouteListView = lazy(() => import('../../../components/RouteListView'));

export default function TodaysRoutes({ session }) {
  const today = new Date().toISOString().slice(0, 10);
  const [plan, setPlan]     = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState('map'); // map | list

  useEffect(() => {
    loadTodaysPlan();
  }, [session.branchId]);

  const loadTodaysPlan = async () => {
    setLoading(true);
    const { data: plans } = await supabase
      .from('route_plans')
      .select('*')
      .eq('branch_id', session.branchId)
      .eq('plan_date', today)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!plans?.length) { setLoading(false); return; }
    const p = plans[0];
    setPlan(p);

    const [{ data: assignments }, { data: unassignedAddrs }] = await Promise.all([
      supabase.from('route_assignments').select('*').eq('plan_id', p.id),
      supabase.from('route_addresses')
        .select('id,address,city,state,zip,address_type,lat,lng')
        .eq('plan_id', p.id)
        .eq('status', 'unassigned')
        .neq('address_type', 'do_not_knock'),
    ]);

    const unassigned = (unassignedAddrs ?? []).map(a => ({ ...a, unique_id: a.id }));

    if (assignments?.length) {
      setResult({
        routes: assignments.map(a => {
          const stopSeq = a.stop_sequence ?? [];
          return {
            agent_id:         a.agent_id,
            agent_name:       a.agent_name,
            assignment_id:    a.id,
            stop_sequence:    stopSeq,
            clusters:         buildClusters(stopSeq),
            total_stops:      a.total_stops,
            total_miles:      a.total_miles,
            est_hours:        a.est_hours,
            google_maps_urls: a.google_maps_urls ?? [],
            view_token:       a.view_token,
          };
        }),
        unassigned,
        stats: { total_input: p.total_stops, assigned: p.total_stops - p.unassigned_ct, excluded: 0, unassigned: p.unassigned_ct },
      });
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading today's routes…</div>;

  if (!result) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p className="font-medium text-gray-600 mb-1">No routes generated for today</p>
        <p className="text-sm">Use the <strong>Draw Route</strong> tab to build a route manually, or ask your admin to generate today's plan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="bg-green-700 text-white px-6 py-3 flex flex-wrap items-center gap-6">
        <div className="text-sm"><span className="font-bold text-lg">{result.routes.length}</span> <span className="opacity-75">agents</span></div>
        <div className="text-sm"><span className="font-bold text-lg">{result.stats.assigned}</span> <span className="opacity-75">stops assigned</span></div>
        {result.stats.unassigned > 0 && (
          <div className="text-sm"><span className="font-bold text-lg text-yellow-300">{result.stats.unassigned}</span> <span className="opacity-75">unassigned</span></div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => exportAllCSV(result.routes, result.unassigned ?? [], today)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Export All CSV
          </button>
          <button
            onClick={() => setView(v => v === 'map' ? 'list' : 'map')}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {view === 'map' ? 'List View' : 'Map View'}
          </button>
        </div>
      </div>

      {/* Map / list */}
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading map…</div>}>
          {view === 'map'
            ? <RouteMap result={result} />
            : <RouteListView result={result} planDate={today} onExportAgent={exportAgentCSV} />
          }
        </Suspense>
      </div>
    </div>
  );
}
