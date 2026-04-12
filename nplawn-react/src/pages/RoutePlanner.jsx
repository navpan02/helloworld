import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import ConstraintPanel, { DEFAULT_CONSTRAINTS } from '../components/ConstraintPanel';
import RouteListView from '../components/RouteListView';
import { exportAllCSV } from '../utils/routeExport';

// Lazy-load map to avoid SSR/bundle issues with Leaflet
const RouteMap = lazy(() => import('../components/RouteMap'));

// ── CSV column normalisation ──────────────────────────────────────────────────

const REQUIRED_COLS = ['address', 'city', 'state', 'zip', 'address_type'];

/** Accept multiple header spellings, return canonical key or null */
function normaliseHeader(h) {
  const s = h.trim().toLowerCase().replace(/[\s_-]+/g, '_');
  if (['address'].includes(s)) return 'address';
  if (['city'].includes(s)) return 'city';
  if (['state'].includes(s)) return 'state';
  if (['zip', 'zipcode', 'zip_code', 'postal_code', 'postal'].includes(s)) return 'zip';
  if (['address_type', 'addresstype', 'type', 'lead_type', 'leadtype'].includes(s)) return 'address_type';
  if (['lat', 'latitude'].includes(s)) return 'lat';
  if (['lng', 'lon', 'long', 'longitude'].includes(s)) return 'lng';
  if (['unique_id', 'id', 'address_id', 'addressid', 'uid'].includes(s)) return 'unique_id';
  return null;
}

function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => normaliseHeader(h) ?? h.trim().toLowerCase(),
      complete: result => resolve(result),
      error: reject,
    });
  });
}

function validateRows(rawRows) {
  const errors = [];
  const rows = rawRows.map((row, i) => {
    const rowNum = i + 2; // 1-based + header row
    const r = { ...row };

    // Unique ID — generate if absent
    if (!r.unique_id || r.unique_id.trim() === '') {
      r.unique_id = crypto.randomUUID();
    }

    // Required fields
    for (const col of REQUIRED_COLS) {
      if (!r[col] || r[col].trim() === '') {
        errors.push(`Row ${rowNum}: missing required field "${col}"`);
      }
    }

    // ZIP validation
    if (r.zip && !/^\d{5}$/.test(r.zip.trim())) {
      errors.push(`Row ${rowNum}: invalid ZIP "${r.zip}" — must be 5 digits`);
    }

    // Lat/lng validation — if present, must be valid numerics
    const hasLat = r.lat !== undefined && r.lat !== '';
    const hasLng = r.lng !== undefined && r.lng !== '';
    if (hasLat || hasLng) {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lng);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push(`Row ${rowNum}: invalid lat "${r.lat}"`);
        r.lat = undefined;
        r.lng = undefined;
      } else if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push(`Row ${rowNum}: invalid lng "${r.lng}"`);
        r.lat = undefined;
        r.lng = undefined;
      } else {
        r.lat = lat;
        r.lng = lng;
      }
    } else {
      r.lat = undefined;
      r.lng = undefined;
    }

    return r;
  });
  return { rows, errors };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RoutePlanner() {
  const today = new Date().toISOString().slice(0, 10);

  const [planDate, setPlanDate] = useState(today);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState(new Set());
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('map'); // map | list
  const fileRef = useRef();

  // Load agents from DB on mount
  useEffect(() => {
    supabase
      .from('agents')
      .select('id, name, email, start_address, start_lat, start_lng')
      .eq('active', true)
      .order('name')
      .then(({ data }) => {
        if (data) {
          setAgents(data);
          setSelectedAgentIds(new Set(data.map(a => a.id)));
        }
      });
  }, []);

  // ── CSV upload ──────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setCsvFileName(file.name);
    setCsvData([]);
    setCsvErrors([]);
    try {
      const parsed = await parseCSV(file);
      const headers = parsed.meta.fields ?? [];
      const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
      if (missing.length > 0) {
        setCsvErrors([`Missing required columns: ${missing.join(', ')}`]);
        return;
      }
      const { rows, errors } = validateRows(parsed.data);
      setCsvData(rows);
      setCsvErrors(errors);
    } catch (e) {
      setCsvErrors([`Failed to parse CSV: ${e.message}`]);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Agent toggle ────────────────────────────────────────────────────────────

  const toggleAgent = (id) => {
    setSelectedAgentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Generate routes ─────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (csvData.length === 0) return;
    const activeAgents = agents.filter(a => selectedAgentIds.has(a.id));
    if (activeAgents.length === 0) { setErrorMsg('Select at least one agent.'); return; }

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    const geocodeNeeded = csvData.filter(r => r.lat === undefined).length;
    if (geocodeNeeded > 0) {
      setProgress(
        `Geocoding ${geocodeNeeded.toLocaleString()} new address${geocodeNeeded > 1 ? 'es' : ''} via Nominatim — this may take a few minutes the first time…`,
      );
    }

    try {
      // Create plan record in DB
      const { data: plan, error: planErr } = await supabase
        .from('route_plans')
        .insert({
          plan_date: planDate,
          constraints,
          total_agents: activeAgents.length,
          status: 'draft',
          created_by: 'admin',
        })
        .select('id')
        .single();

      if (planErr) throw new Error(`Could not create plan: ${planErr.message}`);

      const payload = {
        addresses: csvData,
        agents: activeAgents.map(a => ({
          id: a.id,
          name: a.name,
          start_address: a.start_address,
          start_lat: a.start_lat ? Number(a.start_lat) : undefined,
          start_lng: a.start_lng ? Number(a.start_lng) : undefined,
        })),
        constraints,
        plan_id: plan.id,
      };

      // Use supabase.functions.invoke so the URL + auth are handled by the client
      const { data, error: fnError } = await supabase.functions.invoke('route-optimize', {
        body: payload,
      });

      if (fnError) throw new Error(fnError.message ?? 'Edge function error');
      setResult(data);
      setStatus('done');
      setProgress('');

      // Update plan totals
      await supabase.from('route_plans').update({
        total_stops: data.stats.assigned,
        unassigned_ct: data.stats.unassigned,
        status: 'active',
      }).eq('id', plan.id);

    } catch (e) {
      // Give a human-readable diagnosis for common failures
      let msg = e.message ?? 'Unknown error';
      if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('fetch')) {
        msg =
          'Network error: could not reach the route-optimize edge function. ' +
          'Make sure the function is deployed in Supabase (Dashboard → Edge Functions → route-optimize) ' +
          'and that your browser is online.';
      }
      setStatus('idle'); // keep form interactive so user can fix and retry
      setErrorMsg(msg);
      setProgress('');
    }
  };

  const selectedAgents = agents.filter(a => selectedAgentIds.has(a.id));

  return (
    <div className="route-planner">
      <div className="rp-header">
        <h1 className="rp-title">Route Planner</h1>
        <p className="rp-subtitle">Generate optimised field sales routes for your team.</p>
      </div>

      {/* ── Step 1: Upload & Configure ── */}
      {status !== 'done' && (
        <div className="rp-setup">
          {/* Date */}
          <div className="rp-section">
            <label className="rp-label">Route date</label>
            <input
              type="date"
              value={planDate}
              onChange={e => setPlanDate(e.target.value)}
              className="rp-date-input"
            />
          </div>

          {/* CSV upload */}
          <div className="rp-section">
            <label className="rp-label">Addresses (CSV)</label>
            <div
              className="rp-dropzone"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
              {csvFileName ? (
                <span className="rp-dropzone-filename">{csvFileName}</span>
              ) : (
                <span className="rp-dropzone-prompt">Drop CSV here or click to upload</span>
              )}
              <span className="rp-dropzone-hint">
                Required columns: address, city, state, zip, address_type
                <br />
                Optional: lat, lng, unique_id
              </span>
            </div>

            {csvData.length > 0 && (
              <p className="rp-parse-summary">
                Parsed <strong>{csvData.length.toLocaleString()}</strong> addresses
                {csvErrors.length > 0 && ` · ${csvErrors.length} warning${csvErrors.length > 1 ? 's' : ''}`}
              </p>
            )}

            {csvErrors.length > 0 && (
              <ul className="rp-errors">
                {csvErrors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                {csvErrors.length > 10 && <li>…and {csvErrors.length - 10} more</li>}
              </ul>
            )}

            {/* Preview table */}
            {csvData.length > 0 && (
              <div className="rp-preview-wrap">
                <table className="rp-preview-table">
                  <thead>
                    <tr>
                      {['unique_id', 'address', 'city', 'state', 'zip', 'address_type', 'lat', 'lng'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {['unique_id', 'address', 'city', 'state', 'zip', 'address_type', 'lat', 'lng'].map(h => (
                          <td key={h}>{row[h] ?? '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <p className="rp-preview-more">…and {csvData.length - 10} more rows</p>
                )}
              </div>
            )}
          </div>

          {/* Agent selection */}
          <div className="rp-section">
            <label className="rp-label">Agents working today</label>
            {agents.length === 0 ? (
              <p className="rp-empty-agents">
                No active agents found. Add agents to the <code>agents</code> table in Supabase.
              </p>
            ) : (
              <div className="rp-agent-grid">
                {agents.map(agent => (
                  <label key={agent.id} className="rp-agent-check">
                    <input
                      type="checkbox"
                      checked={selectedAgentIds.has(agent.id)}
                      onChange={() => toggleAgent(agent.id)}
                    />
                    <span>{agent.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Constraints */}
          <div className="rp-section">
            <label className="rp-label">Constraints</label>
            <ConstraintPanel constraints={constraints} onChange={setConstraints} />
          </div>

          {/* Generate button */}
          <div className="rp-generate-row">
            {errorMsg && (
              <div className="rp-error-banner" role="alert">
                <strong>Error</strong>
                <p>{errorMsg}</p>
                <button
                  type="button"
                  className="rp-error-dismiss"
                  onClick={() => setErrorMsg('')}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
              disabled={status === 'loading' || csvData.length === 0}
            >
              {status === 'loading' ? 'Generating…' : `Generate Routes →`}
            </button>
            {status === 'loading' && progress && (
              <p className="rp-progress">{progress}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Results ── */}
      {status === 'done' && result && (
        <div className="rp-results">
          {/* Summary bar */}
          <div className="rp-summary-bar">
            <span>{result.routes.length} agent{result.routes.length > 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{result.stats.assigned.toLocaleString()} stops assigned</span>
            <span>·</span>
            <span>{result.stats.unassigned.toLocaleString()} unassigned</span>
            {result.stats.excluded > 0 && (
              <>
                <span>·</span>
                <span>{result.stats.excluded.toLocaleString()} excluded (ZIP filter)</span>
              </>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline rp-start-over"
              onClick={() => { setStatus('idle'); setResult(null); }}
            >
              ← Start Over
            </button>
          </div>

          {/* View tabs */}
          <div className="rp-tabs">
            <button
              type="button"
              className={`rp-tab${activeTab === 'map' ? ' rp-tab--active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              Map View
            </button>
            <button
              type="button"
              className={`rp-tab${activeTab === 'list' ? ' rp-tab--active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              List View
            </button>
          </div>

          {activeTab === 'map' && (
            <Suspense fallback={<div className="rp-map-loading">Loading map…</div>}>
              <RouteMap routes={result.routes} unassigned={result.unassigned} />
            </Suspense>
          )}

          {activeTab === 'list' && (
            <RouteListView result={result} planDate={planDate} />
          )}

          {/* Footer actions */}
          <div className="rp-footer-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => exportAllCSV(result.routes, result.unassigned, planDate)}
            >
              Export All CSV
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
