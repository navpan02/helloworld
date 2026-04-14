import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface InputAddress {
  unique_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  address_type: string;
  lat?: number;
  lng?: number;
}

interface Agent {
  id: string;
  name: string;
  start_address: string;
  start_lat?: number;
  start_lng?: number;
}

interface Constraints {
  max_stops: number;
  max_miles: number;
  excluded_zips: string[];
  priority_order: string[];
  cluster_radius_m: number;
  min_cluster_size: number;
}

interface Stop {
  unique_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  address_type: string;
  lat: number;
  lng: number;
  priority_score: number;
  cluster_id?: string;
  stop_order?: number;
}

interface Cluster {
  id: string;
  center: { lat: number; lng: number };
  size: number;
  stops: Stop[];
  priority_score: number;
}

interface RouteResult {
  agent_id: string;
  agent_name: string;
  assignment_id: string;
  clusters: Cluster[];
  stop_sequence: Stop[];
  total_stops: number;
  total_miles: number;
  est_hours: number;
  google_maps_urls: string[];
  view_token: string;
}

// ─── Geo utilities ────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clusterCenter(stops: Stop[]): { lat: number; lng: number } {
  const lat = stops.reduce((s, p) => s + p.lat, 0) / stops.length;
  const lng = stops.reduce((s, p) => s + p.lng, 0) / stops.length;
  return { lat, lng };
}

// ─── Nominatim geocoding (cache-first) ───────────────────────────────────────

function normaliseKey(addr: string): string {
  return addr.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

async function geocodeBatch(
  addresses: InputAddress[],
  supabase: ReturnType<typeof createClient>,
): Promise<Map<string, { lat: number; lng: number } | null>> {
  const result = new Map<string, { lat: number; lng: number } | null>();
  const needGeocoding: InputAddress[] = [];

  // Separate pre-geocoded rows from ones that need Nominatim
  for (const addr of addresses) {
    if (
      addr.lat !== undefined && addr.lng !== undefined &&
      isFinite(addr.lat) && isFinite(addr.lng) &&
      addr.lat >= -90 && addr.lat <= 90 &&
      addr.lng >= -180 && addr.lng <= 180
    ) {
      result.set(addr.unique_id, { lat: addr.lat, lng: addr.lng });
    } else {
      needGeocoding.push(addr);
    }
  }

  if (needGeocoding.length === 0) return result;

  // Build cache key → unique_id map
  const keyToId = new Map<string, string[]>();
  for (const addr of needGeocoding) {
    const full = `${addr.address}, ${addr.city}, ${addr.state} ${addr.zip}`;
    const key = normaliseKey(full);
    if (!keyToId.has(key)) keyToId.set(key, []);
    keyToId.get(key)!.push(addr.unique_id);
  }

  // Check geocode_cache in Supabase
  const keys = Array.from(keyToId.keys());
  const { data: cached } = await supabase
    .from('geocode_cache')
    .select('address_key, lat, lng')
    .in('address_key', keys);

  const cachedKeys = new Set<string>();
  for (const row of cached ?? []) {
    cachedKeys.add(row.address_key);
    const ids = keyToId.get(row.address_key) ?? [];
    for (const id of ids) {
      result.set(id, { lat: Number(row.lat), lng: Number(row.lng) });
    }
  }

  // Geocode cache misses via Nominatim (1 req/sec)
  const misses = needGeocoding.filter(a => {
    const full = `${a.address}, ${a.city}, ${a.state} ${a.zip}`;
    return !cachedKeys.has(normaliseKey(full));
  });

  // Deduplicate by key so we don't hit Nominatim twice for same address
  const seen = new Set<string>();
  for (const addr of misses) {
    const full = `${addr.address}, ${addr.city}, ${addr.state} ${addr.zip}`;
    const key = normaliseKey(full);
    if (seen.has(key)) continue;
    seen.add(key);

    await new Promise(r => setTimeout(r, 1100)); // Nominatim rate limit: 1 req/sec

    try {
      const q = encodeURIComponent(full);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { 'User-Agent': 'NPLawn-RouteOptimizer/1.0' } },
      );
      const json = await res.json();
      if (json.length > 0) {
        const geo = { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
        // Store in cache
        await supabase.from('geocode_cache').upsert({
          address_key: key,
          raw_address: full,
          lat: geo.lat,
          lng: geo.lng,
          source: 'nominatim',
        });
        // Map all IDs that share this key
        for (const id of keyToId.get(key) ?? []) {
          result.set(id, geo);
        }
      } else {
        for (const id of keyToId.get(key) ?? []) {
          result.set(id, null);
        }
      }
    } catch {
      for (const id of keyToId.get(key) ?? []) {
        result.set(id, null);
      }
    }
  }

  return result;
}

// ─── DBSCAN clustering ────────────────────────────────────────────────────────

function dbscan(
  points: Stop[],
  epsKm: number,
  minPts: number,
): Map<number, string> {
  const labels = new Map<number, string>(); // index → cluster label
  let clusterId = 0;

  const regionQuery = (idx: number): number[] => {
    const neighbors: number[] = [];
    for (let j = 0; j < points.length; j++) {
      if (j === idx) continue;
      if (haversineKm(points[idx].lat, points[idx].lng, points[j].lat, points[j].lng) <= epsKm) {
        neighbors.push(j);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < points.length; i++) {
    if (labels.has(i)) continue;

    const neighbors = regionQuery(i);
    if (neighbors.length < minPts - 1) {
      labels.set(i, 'noise');
      continue;
    }

    const cid = `C${clusterId++}`;
    labels.set(i, cid);

    const queue = [...neighbors];
    while (queue.length > 0) {
      const q = queue.shift()!;
      if (labels.get(q) === 'noise') labels.set(q, cid);
      if (labels.has(q) && labels.get(q) !== 'noise') continue;
      labels.set(q, cid);
      const qNeighbors = regionQuery(q);
      if (qNeighbors.length >= minPts - 1) queue.push(...qNeighbors);
    }
  }

  // Merge noise points into nearest cluster within 1km
  const clusterPoints = new Map<string, Stop[]>();
  for (const [i, cid] of labels.entries()) {
    if (cid !== 'noise') {
      if (!clusterPoints.has(cid)) clusterPoints.set(cid, []);
      clusterPoints.get(cid)!.push(points[i]);
    }
  }

  for (const [i, cid] of labels.entries()) {
    if (cid !== 'noise') continue;
    let bestCluster = 'noise';
    let bestDist = 1.0; // 1km merge threshold
    for (const [clId, cPoints] of clusterPoints.entries()) {
      const center = clusterCenter(cPoints);
      const d = haversineKm(points[i].lat, points[i].lng, center.lat, center.lng);
      if (d < bestDist) { bestDist = d; bestCluster = clId; }
    }
    labels.set(i, bestCluster);
  }

  return labels;
}

// ─── Nearest-neighbour TSP ────────────────────────────────────────────────────

function nearestNeighbourTSP(
  points: { lat: number; lng: number }[],
  startLat: number,
  startLng: number,
): number[] {
  const visited = new Set<number>();
  const order: number[] = [];
  let curLat = startLat;
  let curLng = startLng;

  while (visited.size < points.length) {
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;
      const d = haversineKm(curLat, curLng, points[i].lat, points[i].lng);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    visited.add(best);
    order.push(best);
    curLat = points[best].lat;
    curLng = points[best].lng;
  }
  return order;
}

// ─── Walk distance within cluster ─────────────────────────────────────────────

function walkMilesInCluster(stops: Stop[]): number {
  if (stops.length <= 1) return 0;
  const order = nearestNeighbourTSP(
    stops.map(s => ({ lat: s.lat, lng: s.lng })),
    stops[0].lat,
    stops[0].lng,
  );
  let dist = 0;
  for (let i = 1; i < order.length; i++) {
    dist += haversineKm(
      stops[order[i - 1]].lat, stops[order[i - 1]].lng,
      stops[order[i]].lat, stops[order[i]].lng,
    );
  }
  return dist * 0.621371; // km → miles
}

// ─── Google Maps URL builder ───────────────────────────────────────────────────

function buildGoogleMapsUrls(stops: Stop[]): string[] {
  const CHUNK = 23; // 23 waypoints + origin + dest = 25 total
  const urls: string[] = [];
  for (let i = 0; i < stops.length; i += CHUNK) {
    const chunk = stops.slice(i, i + CHUNK + 1); // overlap by 1 for continuity
    const encoded = chunk.map(s => `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`);
    const origin = encoded[0];
    const dest = encoded[encoded.length - 1];
    const waypoints = encoded.slice(1, -1).join('/');
    const url = waypoints
      ? `https://maps.google.com/maps/dir/${origin}/${waypoints}/${dest}`
      : `https://maps.google.com/maps/dir/${origin}/${dest}`;
    urls.push(url);
  }
  return urls;
}

// ─── Random token ─────────────────────────────────────────────────────────────

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function randomUUID(): string {
  return crypto.randomUUID();
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      addresses,
      agents,
      constraints: rawConstraints,
      plan_id,
    } = await req.json();

    if (!addresses || !agents || !plan_id) {
      return new Response(
        JSON.stringify({ error: 'addresses, agents, and plan_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (addresses.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Maximum 10,000 addresses per run' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const constraints: Constraints = {
      max_stops: rawConstraints?.max_stops ?? 100,
      max_miles: rawConstraints?.max_miles ?? 25,
      excluded_zips: rawConstraints?.excluded_zips ?? [],
      priority_order: rawConstraints?.priority_order ?? [
        'homeowner', 'new_construction', 'renter', 'multi_family', 'commercial', 'vacant',
      ],
      cluster_radius_m: rawConstraints?.cluster_radius_m ?? 400,
      min_cluster_size: rawConstraints?.min_cluster_size ?? 5,
    };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── Phase 1: Geocoding + filtering ──────────────────────────────────────

    const geocodeMap = await geocodeBatch(addresses as InputAddress[], supabase);

    const excluded: Stop[] = [];
    const unassigned: Stop[] = [];
    const valid: Stop[] = [];

    for (const addr of addresses as InputAddress[]) {
      const geo = geocodeMap.get(addr.unique_id);

      // Filter excluded ZIPs
      if (constraints.excluded_zips.includes(addr.zip)) {
        excluded.push({
          ...addr,
          lat: geo?.lat ?? 0,
          lng: geo?.lng ?? 0,
          priority_score: 0,
        });
        continue;
      }

      if (!geo) {
        unassigned.push({
          ...addr,
          lat: 0,
          lng: 0,
          priority_score: 0,
        });
        continue;
      }

      const priorityIdx = constraints.priority_order.indexOf(addr.address_type);
      const priority_score = priorityIdx >= 0
        ? (constraints.priority_order.length - priorityIdx) * 10
        : 5;

      valid.push({ ...addr, lat: geo.lat, lng: geo.lng, priority_score });
    }

    // ── Phase 2: DBSCAN clustering ──────────────────────────────────────────

    const epsKm = constraints.cluster_radius_m / 1000;
    const labelMap = dbscan(valid, epsKm, constraints.min_cluster_size);

    const clusterMap = new Map<string, Stop[]>();
    for (const [i, cid] of labelMap.entries()) {
      if (cid === 'noise') {
        unassigned.push(valid[i]);
        continue;
      }
      if (!clusterMap.has(cid)) clusterMap.set(cid, []);
      clusterMap.get(cid)!.push(valid[i]);
    }

    const clusters: Cluster[] = [];
    for (const [cid, stops] of clusterMap.entries()) {
      const center = clusterCenter(stops);
      const priority_score = stops.reduce((s, p) => s + p.priority_score, 0);
      clusters.push({ id: cid, center, size: stops.length, stops, priority_score });
    }

    // Sort clusters by total priority descending
    clusters.sort((a, b) => b.priority_score - a.priority_score);

    // ── Phase 3: Agent assignment ────────────────────────────────────────────

    // Geocode agent start positions if needed
    const agentStops: { agentIdx: number; lat: number; lng: number }[] = [];
    for (let i = 0; i < agents.length; i++) {
      const ag: Agent = agents[i];
      if (
        ag.start_lat !== undefined && ag.start_lng !== undefined &&
        isFinite(ag.start_lat) && isFinite(ag.start_lng)
      ) {
        agentStops.push({ agentIdx: i, lat: ag.start_lat, lng: ag.start_lng });
      } else {
        // Default to geographic centroid of all valid stops
        const centroid = clusterCenter(valid.length > 0 ? valid : [{ lat: 41.88, lng: -87.63, address: '', city: '', state: '', zip: '', address_type: '', unique_id: '', priority_score: 0 }]);
        agentStops.push({ agentIdx: i, lat: centroid.lat, lng: centroid.lng });
      }
    }

    const agentRunning = agents.map((ag: Agent, i: number) => ({
      agent: ag,
      start: agentStops[i],
      stops: 0,
      miles: 0,
      assignedClusters: [] as Cluster[],
      curLat: agentStops[i].lat,
      curLng: agentStops[i].lng,
    }));

    for (const cluster of clusters) {
      const walkMi = walkMilesInCluster(cluster.stops);
      let bestAgent = -1;
      let bestScore = Infinity;

      for (let a = 0; a < agentRunning.length; a++) {
        const ag = agentRunning[a];
        const driveKm = haversineKm(ag.curLat, ag.curLng, cluster.center.lat, cluster.center.lng);
        const driveMi = driveKm * 0.621371;
        const newStops = ag.stops + cluster.stops.length;
        const newMiles = ag.miles + driveMi + walkMi;

        if (newStops <= constraints.max_stops && newMiles <= constraints.max_miles) {
          // Prefer agent with fewest stops (load balancing)
          if (ag.stops < bestScore) {
            bestScore = ag.stops;
            bestAgent = a;
          }
        }
      }

      if (bestAgent === -1) {
        unassigned.push(...cluster.stops);
        continue;
      }

      const ag = agentRunning[bestAgent];
      const driveKm = haversineKm(ag.curLat, ag.curLng, cluster.center.lat, cluster.center.lng);
      ag.miles += driveKm * 0.621371 + walkMi;
      ag.stops += cluster.stops.length;
      ag.assignedClusters.push(cluster);
      ag.curLat = cluster.center.lat;
      ag.curLng = cluster.center.lng;
    }

    // ── Phase 4: TSP sequencing + result building ────────────────────────────

    const routes: RouteResult[] = [];

    for (const ag of agentRunning) {
      if (ag.assignedClusters.length === 0) continue;

      // TSP on cluster centroids starting from agent start
      const clusterOrder = nearestNeighbourTSP(
        ag.assignedClusters.map(c => c.center),
        ag.start.lat,
        ag.start.lng,
      );

      const orderedClusters = clusterOrder.map(i => ag.assignedClusters[i]);
      const stopSequence: Stop[] = [];
      let stopOrder = 1;

      const resultClusters: Cluster[] = orderedClusters.map(cluster => {
        // Within cluster: nearest-neighbour walk path, priority-sorted ties
        const sortedByPriority = [...cluster.stops].sort((a, b) => b.priority_score - a.priority_score);
        const walkOrder = nearestNeighbourTSP(
          sortedByPriority.map(s => ({ lat: s.lat, lng: s.lng })),
          sortedByPriority[0].lat,
          sortedByPriority[0].lng,
        );
        const orderedStops = walkOrder.map(i => ({
          ...sortedByPriority[i],
          cluster_id: cluster.id,
          stop_order: stopOrder++,
        }));
        stopSequence.push(...orderedStops);
        return { ...cluster, stops: orderedStops };
      });

      const assignmentId = randomUUID();
      const viewToken = randomToken();
      const totalDriveKm = orderedClusters.reduce((acc, c, i) => {
        if (i === 0) return acc + haversineKm(ag.start.lat, ag.start.lng, c.center.lat, c.center.lng);
        return acc + haversineKm(orderedClusters[i - 1].center.lat, orderedClusters[i - 1].center.lng, c.center.lat, c.center.lng);
      }, 0);
      const totalWalkMi = orderedClusters.reduce((acc, c) => acc + walkMilesInCluster(c.stops), 0);
      const totalMiles = totalDriveKm * 0.621371 + totalWalkMi;
      const estHours = parseFloat((totalMiles / 3 + stopSequence.length * 0.05).toFixed(1)); // ~3mph walk + 3 min/stop

      routes.push({
        agent_id: ag.agent.id,
        agent_name: ag.agent.name,
        assignment_id: assignmentId,
        clusters: resultClusters,
        stop_sequence: stopSequence,
        total_stops: stopSequence.length,
        total_miles: parseFloat(totalMiles.toFixed(2)),
        est_hours: estHours,
        google_maps_urls: buildGoogleMapsUrls(stopSequence),
        view_token: viewToken,
      });

      // Persist route_assignment to DB (best-effort)
      try {
        await supabase.from('route_assignments').insert({
          id: assignmentId,
          plan_id,
          agent_id: ag.agent.id,
          agent_name: ag.agent.name,
          cluster_sequence: resultClusters.map(c => c.id),
          stop_sequence: stopSequence,
          total_stops: stopSequence.length,
          total_miles: totalMiles,
          est_hours: estHours,
          google_maps_urls: buildGoogleMapsUrls(stopSequence),
          view_token: viewToken,
        });
      } catch {
        // non-fatal
      }
    }

    const stats = {
      total_input: addresses.length,
      assigned: routes.reduce((s, r) => s + r.total_stops, 0),
      excluded: excluded.length,
      unassigned: unassigned.length,
    };

    return new Response(JSON.stringify({ routes, unassigned, excluded, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
