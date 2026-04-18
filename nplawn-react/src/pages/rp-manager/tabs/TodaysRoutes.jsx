import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { exportAgentCSV, exportAllCSV } from '../../../utils/routeExport';

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
  const localToday = new Date().toLocaleDateString('en-CA');
  const [selectedDate, setSelectedDate] = useState('');   // '' = most recent
  const [plan, setPlan]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [view, setView]       = useState('map');

  useEffect(() => { loadPlan(selectedDate); }, [selectedDate]);

  const loadPlan = async (date) => {
    setLoading(true);
    setLoadError('');
    setResult(null);
    setPlan(null);

    let query = supabase
      .from('route_plans')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (date) query = query.eq('plan_date', date);

    const { data: plans, error: planErr } = await query;
    if (planErr) { setLoadError(`Plan query failed: ${planErr.message}`); setLoading(false); return; }
    if (!plans?.length) { setLoading(false); return; }
    const p = plans[0];
    setPlan(p);

    const [{ data: assignments, error: aErr }, { data: unassignedAddrs }] = await Promise.all([
      supabase.from('route_assignments').select('*').eq('plan_id', p.id),
      supabase.from('route_addresses')
        .select('id,address,city,state,zip,address_type,lat,lng')
        .eq('plan_id', p.id)
        .eq('status', 'unassigned')
        .neq('address_type', 'do_not_knock'),
    ]);
    if (aErr) { setLoadError(`Assignments query failed: ${aErr.message}`); setLoading(false); return; }

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

  const planDate = plan?.plan_date ?? localToday;

  return (
    <div className="flex flex-col h-full">
      {/* Date picker toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Plan date</label>
        <input
          type="date"
          value={selectedDate || localToday}
          max={localToday}
          onChange={e => setSelectedDate(e.target.value === localToday ? '' : e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Show latest
          </button>
        )}
        {plan && (
          <span className="ml-2 text-xs text-gray-400">
            Showing plan from {plan.plan_date}
          </span>
        )}
      </div>

      {loading && <div className="p-8 text-center text-gray-400">Loading routes…</div>}

      {!loading && loadError && (
        <div className="p-8 text-center text-red-500">
          <p className="font-medium mb-1">Error loading routes</p>
          <p className="text-sm font-mono">{loadError}</p>
          <button onClick={() => loadPlan(selectedDate)} className="mt-3 text-sm underline">Retry</button>
        </div>
      )}

      {!loading && !loadError && !result && (
        <div className="p-8 text-center text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium text-gray-600 mb-1">No routes found{selectedDate ? ` for ${selectedDate}` : ''}</p>
          <p className="text-sm">Use the <strong>Route Planner</strong> tab to generate routes, or use <strong>Add/Edit Route</strong> to build one manually.</p>
        </div>
      )}

      {!loading && !loadError && result && (
        <>
          {/* Summary bar */}
          <div className="bg-green-700 text-white px-6 py-3 flex flex-wrap items-center gap-6">
            <div className="text-sm"><span className="font-bold text-lg">{result.routes.length}</span> <span className="opacity-75">agents</span></div>
            <div className="text-sm"><span className="font-bold text-lg">{result.stats.assigned}</span> <span className="opacity-75">stops assigned</span></div>
            {result.stats.unassigned > 0 && (
              <div className="text-sm"><span className="font-bold text-lg text-yellow-300">{result.stats.unassigned}</span> <span className="opacity-75">unassigned</span></div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => exportAllCSV(result.routes, result.unassigned ?? [], planDate)}
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
                : <RouteListView result={result} planDate={planDate} onExportAgent={exportAgentCSV} />
              }
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
