import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Agent colours (up to 10 agents)
const AGENT_COLOURS = [
  '#16a34a', // green
  '#2563eb', // blue
  '#ea580c', // orange
  '#7c3aed', // purple
  '#dc2626', // red
  '#0891b2', // teal
  '#d97706', // amber
  '#db2777', // pink
  '#65a30d', // lime
  '#9333ea', // violet
];

// Address type marker colours
const TYPE_COLOURS = {
  homeowner: '#16a34a',
  new_construction: '#2563eb',
  renter: '#f59e0b',
  multi_family: '#8b5cf6',
  commercial: '#64748b',
  vacant: '#94a3b8',
};

function typeColour(type) {
  return TYPE_COLOURS[type] ?? '#64748b';
}

function createPinIcon(colour, label) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${colour};
      color:#fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;
      border:2px solid rgba(0,0,0,0.25);
      font-size:10px;font-weight:700;
    "><span style="transform:rotate(45deg)">${label}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

/** Compute convex hull (Graham scan) for cluster polygon */
function convexHull(points) {
  if (points.length < 3) return points;
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return [...lower, ...upper];
}

/** Auto-fit map bounds to all stops */
function FitBounds({ routes }) {
  const map = useMap();
  useEffect(() => {
    if (!routes || routes.length === 0) return;
    const allStops = routes.flatMap(r => r.stop_sequence);
    if (allStops.length === 0) return;
    const bounds = L.latLngBounds(allStops.map(s => [s.lat, s.lng]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [routes, map]);
  return null;
}

export default function RouteMap({ routes, unassigned = [] }) {
  if (!routes || routes.length === 0) {
    return (
      <div className="route-map-empty">
        <p>No routes to display.</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[41.88, -87.63]}
      zoom={11}
      style={{ height: '600px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds routes={routes} />

      {routes.map((route, agentIdx) => {
        const agentColour = AGENT_COLOURS[agentIdx % AGENT_COLOURS.length];

        return (
          <span key={route.agent_id ?? agentIdx}>
            {/* Drive route — dashed polyline between cluster centroids */}
            {route.clusters.length > 1 && (
              <Polyline
                positions={route.clusters.map(c => [c.center.lat, c.center.lng])}
                pathOptions={{ color: agentColour, weight: 2, dashArray: '6 4', opacity: 0.7 }}
              />
            )}

            {route.clusters.map(cluster => {
              const hullPts = convexHull(cluster.stops.map(s => [s.lat, s.lng]));
              const walkPath = cluster.stops.map(s => [s.lat, s.lng]);

              return (
                <span key={cluster.id}>
                  {/* Cluster convex hull polygon */}
                  {hullPts.length >= 3 && (
                    <Polygon
                      positions={hullPts}
                      pathOptions={{
                        color: agentColour,
                        fillColor: agentColour,
                        fillOpacity: 0.08,
                        weight: 1,
                      }}
                    />
                  )}

                  {/* Walk route — solid polyline within cluster */}
                  {walkPath.length > 1 && (
                    <Polyline
                      positions={walkPath}
                      pathOptions={{ color: agentColour, weight: 1.5, opacity: 0.5 }}
                    />
                  )}

                  {/* Stop pins */}
                  {cluster.stops.map(stop => (
                    <Marker
                      key={stop.unique_id}
                      position={[stop.lat, stop.lng]}
                      icon={createPinIcon(typeColour(stop.address_type), stop.stop_order ?? '?')}
                    >
                      <Popup>
                        <div className="route-map-popup">
                          <strong>#{stop.stop_order}</strong> — {stop.address_type}
                          <br />
                          {stop.address}, {stop.city}, {stop.state} {stop.zip}
                          <br />
                          <small>Cluster: {stop.cluster_id} · Agent: {route.agent_name}</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </span>
              );
            })}
          </span>
        );
      })}

      {/* Unassigned stops in grey */}
      {unassigned.map(stop => (
        stop.lat && stop.lng ? (
          <Marker
            key={stop.unique_id}
            position={[stop.lat, stop.lng]}
            icon={createPinIcon('#94a3b8', '?')}
          >
            <Popup>
              <div className="route-map-popup">
                <strong>UNASSIGNED</strong>
                <br />
                {stop.address}, {stop.city}, {stop.state} {stop.zip}
                <br />
                <small>{stop.address_type}</small>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}
