import { useState } from 'react';

/**
 * Modal for swapping entire routes between two agents.
 * Props:
 *   routes    — current result.routes array
 *   onConfirm(agentIdA, agentIdB) — called when user confirms swap
 *   onClose() — called on cancel or backdrop click
 */
export default function SwapRoutesModal({ routes, onConfirm, onClose }) {
  const [agentA, setAgentA] = useState(routes[0]?.agent_id ?? '');
  const [agentB, setAgentB] = useState(routes[1]?.agent_id ?? routes[0]?.agent_id ?? '');

  const routeA = routes.find(r => r.agent_id === agentA);
  const routeB = routes.find(r => r.agent_id === agentB);
  const same = agentA && agentB && agentA === agentB;
  const canConfirm = agentA && agentB && !same;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-np-dark/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative bg-white rounded-2xl shadow-np-lg border border-np-border w-full max-w-md p-6"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-extrabold text-np-dark">Swap Routes</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-np-muted hover:text-np-dark transition-colors text-xl leading-none mt-0.5"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-np-muted text-sm mb-6">
          Exchange all stops between two agents. You can undo or republish afterwards.
        </p>

        {/* Agent A */}
        <div className="mb-3">
          <label className="text-[10px] font-bold text-np-muted uppercase tracking-widest block mb-1.5">
            Agent A
          </label>
          <select
            value={agentA}
            onChange={e => setAgentA(e.target.value)}
            className="w-full border border-np-border rounded-xl px-4 py-2.5 text-sm text-np-text bg-white focus:outline-none focus:ring-2 focus:ring-np-accent/30 focus:border-np-accent transition-all"
          >
            {routes.map(r => (
              <option key={r.agent_id} value={r.agent_id}>
                {r.agent_name} — {r.total_stops} stops
              </option>
            ))}
          </select>
        </div>

        {/* Swap divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-np-border" />
          <div className="w-8 h-8 rounded-full bg-np-surface border border-np-border flex items-center justify-center text-np-muted text-base select-none">
            ⇅
          </div>
          <div className="flex-1 h-px bg-np-border" />
        </div>

        {/* Agent B */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-np-muted uppercase tracking-widest block mb-1.5">
            Agent B
          </label>
          <select
            value={agentB}
            onChange={e => setAgentB(e.target.value)}
            className="w-full border border-np-border rounded-xl px-4 py-2.5 text-sm text-np-text bg-white focus:outline-none focus:ring-2 focus:ring-np-accent/30 focus:border-np-accent transition-all"
          >
            {routes.map(r => (
              <option key={r.agent_id} value={r.agent_id}>
                {r.agent_name} — {r.total_stops} stops
              </option>
            ))}
          </select>
        </div>

        {/* Preview / validation */}
        {same ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700 font-medium">
            Agent A and Agent B must be different.
          </div>
        ) : canConfirm && routeA && routeB ? (
          <div className="bg-np-surface rounded-xl border border-np-border px-4 py-3.5 mb-6">
            <p className="text-xs font-bold text-np-muted uppercase tracking-widest mb-3">Preview</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-np-dark">{routeA.agent_name}</span>
                <span>
                  <span className="font-bold text-np-accent">{routeB.total_stops}</span>
                  <span className="text-np-muted"> stops </span>
                  <span className="text-np-muted text-xs">(was {routeA.total_stops})</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-np-dark">{routeB.agent_name}</span>
                <span>
                  <span className="font-bold text-np-accent">{routeA.total_stops}</span>
                  <span className="text-np-muted"> stops </span>
                  <span className="text-np-muted text-xs">(was {routeB.total_stops})</span>
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-np-border text-np-text font-semibold px-4 py-2.5 rounded-xl hover:border-np-dark hover:text-np-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm(agentA, agentB)}
            className={`flex-1 font-semibold px-4 py-2.5 rounded-xl transition-all ${
              canConfirm
                ? 'bg-np-accent text-np-dark hover:brightness-110 shadow-np'
                : 'bg-np-muted/20 text-np-muted cursor-not-allowed'
            }`}
          >
            Swap Routes
          </button>
        </div>
      </div>
    </div>
  );
}
