import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DemoControlPanel({
  onToggleHeatmap,
  heatmapActive,
  onTriggerAllocationAnimation,
  onResetComplete
}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [simSpeed, setSimSpeed] = useState('1x');
  const [simulating, setSimulating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const triggerSurge = async () => {
    setSimulating(true);
    setStatusMsg('Flooding real atomic bookings...');
    try {
      const res = await fetch('/api/admin/demo/simulate-tick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({ phase: 'surge_bookings' })
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Surge complete!');
    } catch (err) {
      setStatusMsg('Simulation tick error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const triggerOwnerCancel = async () => {
    setSimulating(true);
    setStatusMsg('Triggering owner cancellation...');
    try {
      const res = await fetch('/api/admin/demo/simulate-tick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({ phase: 'owner_cancel' })
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Owner cancelled; re-allocated to reserve pool!');
    } catch (err) {
      setStatusMsg('Error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const triggerReset = async () => {
    if (!window.confirm('Restore demo database back to pristine Indore seed state?')) return;
    setStatusMsg('Resetting seed state...');
    try {
      const res = await fetch('/api/admin/demo/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('s2p_token')}`
        }
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Demo state restored!');
      if (onResetComplete) onResetComplete();
    } catch (err) {
      setStatusMsg('Reset error: ' + err.message);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Minimized Trigger Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-full glass-panel border border-primary text-primary text-xs font-label-caps uppercase tracking-wider flex items-center gap-2 shadow-[0_0_24px_rgba(216,166,74,0.3)] hover:scale-105 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>Judge Demo Controls</span>
          <span className="material-symbols-outlined text-[16px]">tune</span>
        </button>
      ) : (
        /* Expanded HUD Panel */
        <div className="w-80 rounded-2xl glass-panel-elevated border border-primary/40 p-space-md shadow-2xl flex flex-col gap-space-sm text-on-surface">
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                SIH Judge Demo HUD
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Status readout */}
          {statusMsg && (
            <div className="p-2 rounded-lg bg-surface-container text-xs text-tertiary font-data-mono">
              {statusMsg}
            </div>
          )}

          {/* Speed & Simulator Controls */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-label-caps uppercase text-on-surface-variant">
              Event-Day Time Speed
            </span>
            <div className="grid grid-cols-4 gap-1">
              {['1x', '5x', '20x', '60x'].map(spd => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSimSpeed(spd)}
                  className={`py-1 rounded-md text-xs font-data-mono font-semibold transition-colors ${
                    simSpeed === spd
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          {/* Judge Wow Feature Buttons */}
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              type="button"
              onClick={triggerSurge}
              disabled={simulating}
              className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-label-md flex items-center justify-between border border-outline-variant/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">flood</span>
                <span>Flood Synthetic Bookings</span>
              </span>
              <span className="font-data-mono text-[10px] text-tertiary">+10 real locks</span>
            </button>

            <button
              type="button"
              onClick={triggerOwnerCancel}
              disabled={simulating}
              className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-label-md flex items-center justify-between border border-outline-variant/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-error">cancel</span>
                <span>Simulate Owner Cancel</span>
              </span>
              <span className="font-data-mono text-[10px] text-primary">Auto-Reallocate</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleHeatmap && onToggleHeatmap()}
              className={`w-full py-2 px-3 rounded-lg text-xs font-label-md flex items-center justify-between border transition-colors ${
                heatmapActive
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-container hover:bg-surface-bright border-outline-variant/50 text-on-surface'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                <span>Live Demand Heatmap</span>
              </span>
              <span className="font-data-mono text-[10px]">
                {heatmapActive ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerAllocationAnimation && onTriggerAllocationAnimation()}
              className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-label-md flex items-center justify-between border border-outline-variant/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary">hub</span>
                <span>Allocation Ray Animation</span>
              </span>
              <span className="font-data-mono text-[10px] text-primary">Pulse</span>
            </button>
          </div>

          {/* One-Click Reset */}
          <div className="pt-2 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={triggerReset}
              className="w-full py-2 rounded-lg bg-error-container/40 hover:bg-error-container text-error text-xs font-label-caps uppercase font-bold flex items-center justify-center gap-1.5 transition-colors border border-error/40"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>1-Click Reset Demo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
