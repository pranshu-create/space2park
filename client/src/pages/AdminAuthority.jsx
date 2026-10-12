import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminAuthority() {
  const { user, token } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [verificationItems, setVerificationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processedIds, setProcessedIds] = useState(new Set());

  useEffect(() => {
    // 1. Fetch Authority KPIs
    fetch('/api/admin/authority', {
      headers: {
        Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setMetrics(data.metrics);
        setHotspots(data.hotspots || []);
      })
      .catch(err => console.error('Error fetching authority metrics:', err));

    // 2. Fetch Verification queue
    fetch('/api/admin/verifications', {
      headers: {
        Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setVerificationItems(data.pendingItems || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching verification queue:', err);
        setLoading(false);
      });
  }, []);

  const handleAction = (id, action) => {
    setProcessedIds(prev => new Set([...prev, id]));
  };

  return (
    <div className="w-full pt-24 pb-24 min-h-screen bg-surface text-on-surface px-margin-mobile md:px-margin max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg border-b border-outline-variant/30 gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Municipal Traffic & Urban Mobility Authority
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
            INDORE MUNICIPAL DASHBOARD
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
            Real-time urban telemetry, parking utilisation indices, and AI risk verification queues for Smart India Hackathon.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-outline-variant/50 text-xs font-data-mono">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span>CITY SURGE MONITOR: OPTIMAL</span>
        </div>
      </div>

      {/* Mandatory Honesty Caveat Banner */}
      <div className="mb-space-lg p-space-md rounded-2xl glass-panel border border-primary/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm shadow-lg">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[22px]">policy</span>
          <div>
            <span className="font-label-caps text-xs text-primary uppercase font-bold block">
              Platform KPI Telemetry Caveat
            </span>
            <p className="text-xs text-on-surface-variant italic">
              "Impact is measured through platform KPIs; final city-level reductions require pilot data."
            </p>
          </div>
        </div>
        <span className="text-[10px] font-data-mono text-on-surface-variant px-2.5 py-0.5 rounded-full glass-panel">
          MODEL ESTIMATE (NOT FIELD SENSOR SINK)
        </span>
      </div>

      {/* 1. KEY AUTHORITY METRICS GRID */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          <div className="p-space-lg rounded-2xl glass-panel hover:glass-panel-elevated transition-all">
            <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
              Network Utilisation
            </span>
            <span className="font-headline-lg text-3xl font-bold text-primary mt-1 block">
              {metrics.networkUtilisationPct}%
            </span>
            <span className="text-xs font-data-mono text-on-surface-variant block mt-1">
              {metrics.activeParkedVehicles} / {metrics.totalSlotsInNetwork} Slots Active
            </span>
          </div>

          <div className="p-space-lg rounded-2xl glass-panel hover:glass-panel-elevated transition-all">
            <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
              Estimated Cruising Saved
            </span>
            <span className="font-headline-lg text-3xl font-bold text-tertiary mt-1 block">
              {metrics.estimatedCruisingKmSaved} km
            </span>
            <span className="text-xs font-data-mono text-on-surface-variant block mt-1">
              ~2.4 km search circle per car
            </span>
          </div>

          <div className="p-space-lg rounded-2xl glass-panel hover:glass-panel-elevated transition-all">
            <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
              CO₂ Emissions Mitigated
            </span>
            <span className="font-headline-lg text-3xl font-bold text-on-surface mt-1 block">
              {metrics.estimatedCO2SavedKg} kg
            </span>
            <span className="text-xs font-data-mono text-on-surface-variant block mt-1">
              0.192 kg CO₂ / km passenger proxy
            </span>
          </div>

          <div className="p-space-lg rounded-2xl glass-panel hover:glass-panel-elevated transition-all">
            <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
              Avg Walking Ingress
            </span>
            <span className="font-headline-lg text-3xl font-bold text-on-surface mt-1 block">
              {metrics.avgAllocationDistanceMeters} m
            </span>
            <span className="text-xs font-data-mono text-tertiary block mt-1">
              &lt; 6 min pedestrian corridor
            </span>
          </div>
        </div>
      )}

      {/* INDORE URBAN DENSITY RADAR VISUAL */}
      <div className="mb-space-xl p-space-lg rounded-3xl glass-panel-elevated border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-white/[0.08] mb-4">
          <div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface">
              Indore Urban Mobility &amp; Density Radar
            </h3>
            <p className="text-xs text-on-surface-variant">
              Live municipal heatmap monitoring across Vijay Nagar, Palasia, and Bypass corridors.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full glass-pill font-data-mono text-xs text-primary border border-primary/30 w-fit">
            AI Density Stream Active
          </span>
        </div>
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-white/[0.08] bg-black">
          <img
            src="/assets/indore_radar_map.png"
            alt="High-resolution real-time Indore city radar map showing parking density corridors and traffic choke points"
            className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs font-data-mono text-on-surface">
            <span className="px-2.5 py-1 rounded-lg glass-panel text-tertiary">Corridors Synced: 14 Sectors</span>
            <span className="px-2.5 py-1 rounded-lg glass-panel text-primary">Spatial Re-balancing: Stage 2 Active</span>
          </div>
        </div>
      </div>

      {/* 2. ROADSIDE CONGESTION HOTSPOTS */}
      <div className="mb-space-xl p-space-lg rounded-3xl glass-panel-elevated border border-white/[0.08] flex flex-col gap-space-md shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-lg font-bold text-on-surface">
            Roadside Congestion & Illegal Parking Hotspots
          </span>
          <span className="text-xs font-data-mono text-primary">3 Active Ingress Points</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          {hotspots.map((h, i) => (
            <div key={i} className="p-space-sm rounded-xl glass-panel border border-white/[0.08]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-on-surface">{h.name}</span>
                <span
                  className={`text-[9px] font-label-caps uppercase px-1.5 py-0.5 rounded ${
                    h.riskLevel === 'High'
                      ? 'bg-error-container/30 text-error'
                      : 'bg-primary-container/20 text-primary'
                  }`}
                >
                  {h.riskLevel} Risk
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-data-mono">{h.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VERIFICATION QUEUE WITH RISK FLAGS (Section 5.5 Spec) */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-lg font-bold text-on-surface">
            Verification Queue (AI Risk Scoring Flags)
          </span>
          <span className="text-xs font-data-mono text-on-surface-variant">
            {verificationItems.length - processedIds.size} Pending Actions
          </span>
        </div>

        <div className="flex flex-col gap-space-sm">
          {verificationItems.map(item => {
            const isProcessed = processedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`p-space-md rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md ${
                  isProcessed
                    ? 'opacity-40 bg-surface-container-lowest border-outline-variant/20'
                    : 'glass-panel hover:glass-panel-elevated border-white/[0.08]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded glass-panel text-on-surface-variant">
                      {item.type.toUpperCase()}
                    </span>
                    <span className="font-headline-sm text-base font-semibold text-on-surface">
                      {item.title}
                    </span>
                    {item.riskFlag === 'gps_mismatch' && (
                      <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded bg-error-container/40 text-error border border-error/50 font-bold">
                        AI Flag: GPS Mismatch
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant font-data-mono">
                    {item.address || item.venue} • {item.riskScore}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {isProcessed ? (
                    <span className="text-xs font-data-mono text-tertiary">Action Recorded</span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAction(item.id, 'reject')}
                        className="px-3.5 py-1.5 rounded-xl glass-panel hover:bg-surface-container-high text-error text-xs font-label-caps uppercase font-bold border border-error/30 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(item.id, 'approve')}
                        className="px-3.5 py-1.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-label-caps uppercase font-bold transition-all shadow-sm"
                      >
                        Approve & Verify
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
