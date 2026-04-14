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

// Address type marker colours (WI #31)
const TYPE_COLOURS = {
  homeowner:        '#16a34a', // green
  new_construction: '#2563eb', // blue
  renter:           '#f59e0b', // yellow
  multi_family:     '#8b5cf6', // purple
  commercial:       '#ea580c', // orange
  vacant:           '#94a3b8', // grey
};
const UNKNOWN_TYPE_COLOUR = '#475569'; // dark grey for unmapped types

function typeColour(type) {
  return TYPE_COLOURS[type] ?? UNKNOWN_TYPE_COLOUR;
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

/** Auto-fit map bounds to all stops (only on first mount) */
function FitBounds({ routes }) {
  const map = useMap();
  useEffect(() => {
    if (!routes || routes.length === 0) return;
    const allStops = routes.flatMap(r => r.stop_sequence);
    if (allStops.length === 0) return;
    const bounds = L.latLngBounds(allStops.map(s => [s.lat, s.lng]));
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only fit on first mount, not on colourMode change
  return null;
}

const LEGEND_STYLE = `
  background:rgba(255,255,255,0.95);
  padding:8px 12px;
  border-radius:10px;
  box-shadow:0 2px 8px rgba(0,0,0,0.18);
  font-size:11px;
  line-height:1.7;
  min-width:140px;
`;

const DOT_STYLE = 'width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0;';
const ROW_STYLE = 'display:flex;align-items:center;gap:6px;';

/** Leaflet legend control — bottom-left, updates when colourMode changes */
function MapLegend({ colourMode, routes }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'bottomleft' });

    control.onAdd = () => {
      const div = L.DomUtil.create('div');
      div.setAttribute('style', LEGEND_STYLE);
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      if (colourMode === 'type') {
        const entries = [
          ...Object.entries(TYPE_COLOURS),
          ['unknown', UNKNOWN_TYPE_COLOUR],
        ];
        div.innerHTML =
          `<strong style="display:block;margin-bottom:4px;font-size:12px;">Address Type</strong>` +
          entries.map(([type, colour]) =>
            `<div style="${ROW_STYLE}">
              <span style="${DOT_STYLE}background:${colour};"></span>
              <span>${type.replace(/_/g, '\u00A0').replace(/\b\w/g, c => c.toUpperCase())}</span>
            </div>`
          ).join('');
      } else {
        // Agent mode
        div.innerHTML =
          `<strong style="display:block;margin-bottom:4px;font-size:12px;">Agent</strong>` +
          routes.map((r, i) =>
            `<div style="${ROW_STYLE}">
              <span style="${DOT_STYLE}background:${AGENT_COLOURS[i % AGENT_COLOURS.length]};"></span>
              <span>${r.agent_name}</span>
            </div>`
          ).join('');
      }

      return div;
    };

    control.addTo(map);
    return () => control.remove();
  }, [colourMode, routes, map]);

  return null;
}

export default function RouteMap({ routes, unassigned = [], colourMode = 'agent' }) {
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
      <MapLegend colourMode={colourMode} routes={routes} />

      {routes.map((route, agentIdx) => {
        const agentColour = AGENT_COLOURS[agentIdx % AGENT_COLOURS.length];

        return (
          <span key={route.agent_id ?? agentIdx}>
            {/* Drive route — dashed polyline between cluster centroids (always agent-coloured) */}
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
                  {/* Cluster convex hull polygon — always agent-coloured per AC */}
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

                  {/* Walk route — solid polyline within cluster (always agent-coloured) */}
                  {walkPath.length > 1 && (
                    <Polyline
                      positions={walkPath}
                      pathOptions={{ color: agentColour, weight: 1.5, opacity: 0.5 }}
                    />
                  )}

                  {/* Stop pins — colour depends on colourMode */}
                  {cluster.stops.map(stop => {
                    const pinColour = colourMode === 'type'
                      ? typeColour(stop.address_type)
                      : agentColour;
                    return (
                      <Marker
                        key={stop.unique_id}
                        position={[stop.lat, stop.lng]}
                        icon={createPinIcon(pinColour, stop.stop_order ?? '?')}
                      >
                        <Popup>
                          <div className="route-map-popup">
                            <strong>#{stop.stop_order}</strong>
                            {' '}—{' '}
                            <span style={{ color: typeColour(stop.address_type), fontWeight: 600 }}>
                              {(stop.address_type ?? 'unknown').replace(/_/g, '\u00A0')}
                            </span>
                            <br />
                            {stop.address}, {stop.city}, {stop.state} {stop.zip}
                            <br />
                            <small>Cluster: {stop.cluster_id} · Agent: {route.agent_name}</small>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
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
                <small style={{ color: typeColour(stop.address_type) }}>
                  {(stop.address_type ?? 'unknown').replace(/_/g, '\u00A0')}
                </small>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}
