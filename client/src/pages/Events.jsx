import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Events() {
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [activationSuccess, setActivationSuccess] = useState(null);

  const fetchEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load events:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Listen to socket allocation activations
  useEffect(() => {
    if (!socket) return;
    const handleAllocationActivated = data => {
      fetchEvents();
    };
    socket.on('allocation:activated', handleAllocationActivated);
    return () => socket.off('allocation:activated', handleAllocationActivated);
  }, [socket]);

  // Activate event parking via Smart Allocation Engine
  const handleActivateEvent = async eventId => {
    setActivatingId(eventId);
    setActivationSuccess(null);
    try {
      const res = await fetch(`/api/events/${eventId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Activation failed');

      setActivationSuccess({
        eventId,
        message: data.message,
        result: data.allocationResult
      });
      fetchEvents();
    } catch (err) {
      alert(err.message);
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="w-full pt-24 pb-24 min-h-screen bg-surface text-on-surface px-margin-mobile md:px-margin max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg border-b border-outline-variant/30 gap-space-md mb-space-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              High-Capacity Corridors • Indore Pilot
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
            EVENT PARKING READINESS
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            AI-driven proactive capacity allocation. Connects stadium matches, expos, and festivals with nearby private and commercial distributed bays before gridlock forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/host/events/new"
            className="px-space-md py-2.5 rounded-full bg-primary-container text-on-primary font-headline-sm text-xs font-semibold flex items-center gap-2 hover:bg-primary transition-all shadow-[0_0_16px_rgba(216,166,74,0.25)]"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Host An Event</span>
          </Link>
        </div>
      </div>

      {activationSuccess && (
        <div className="mb-space-lg p-space-md rounded-2xl bg-surface-container-high border-2 border-tertiary text-on-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md animate-fadeIn shadow-2xl">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <div>
              <span className="font-headline-sm text-sm font-bold text-tertiary block">
                Smart Allocation Engine Activated!
              </span>
              <p className="text-xs text-on-surface-variant font-data-mono">
                {activationSuccess.result?.activatedSpaces?.length} Spaces Activated •{' '}
                {activationSuccess.result?.reservePoolSpaces?.length} in 10% Reserve Pool • Capacity:{' '}
                {activationSuccess.result?.totalActivatedCapacity} slots
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivationSuccess(null)}
            className="text-on-surface-variant hover:text-on-surface px-2 py-1 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant font-data-mono">
          Loading Indore event corridors & readiness metrics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {events.map(event => {
            const estimate = event.demandEstimate || {};
            const stats = event.nearbyStats || {};
            const coverage = stats.supplyCoveragePct || 0;
            const isActivating = activatingId === event.id;

            // Image lookup with descriptive alt text
            const name = (event.name || '').toLowerCase();
            const cat = (event.category || event.eventType || '').toLowerCase();
            let imgSrc = '/assets/event_stadium.jpg';
            let imgAlt = `${event.name} parking corridor at ${event.location?.address || 'Indore'} with monitored parking gates`;
            if (name.includes('arijit') || name.includes('holkar') || cat.includes('stadium') || cat.includes('cricket')) {
              imgSrc = '/assets/event_concert.jpg';
              imgAlt = `${event.name} live crowd and stage illumination at Holkar Stadium Indore`;
            } else if (name.includes('tech') || name.includes('summit') || cat.includes('expo') || cat.includes('convention')) {
              imgSrc = '/assets/event_tech.jpg';
              imgAlt = `${event.name} exhibition pavilion and conference entrance at Brilliant Convention Centre`;
            } else if (name.includes('fest') || name.includes('campus') || name.includes('iit') || cat.includes('college')) {
              imgSrc = '/assets/event_campus.jpg';
              imgAlt = `${event.name} campus festival entrance with illuminated pedestrian and parking corridors`;
            }

            return (
              <div
                key={event.id}
                className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden flex flex-col justify-between hover:glass-panel-elevated transition-all group shadow-sm"
              >
                {/* Event Photographic Preview Image with Alt Text */}
                <div className="relative w-full h-44 overflow-hidden bg-surface-container-high border-b border-white/[0.06]">
                  <img
                    src={imgSrc}
                    alt={imgAlt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"></div>
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full glass-pill text-primary font-label-caps text-[10px] uppercase font-bold border border-primary/30">
                      {event.category || event.eventType?.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full glass-pill font-data-mono text-[10px] text-tertiary font-bold border border-tertiary/30">
                      {stats.readinessStatus || 'Monitored'}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-space-lg flex flex-col gap-space-xs border-b border-white/[0.06]">
                  <h3 className="font-headline-sm text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                    {event.location?.address}
                  </p>
                </div>

                {/* Readiness Meter & Telemetry */}
                <div className="p-space-lg flex flex-col gap-space-md">
                  {/* Readiness Meter Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-label-caps uppercase text-on-surface-variant font-bold">
                        Parking Readiness Meter
                      </span>
                      <span className="font-data-mono font-bold text-primary">{coverage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          coverage >= 80 ? 'bg-tertiary' : coverage >= 50 ? 'bg-primary' : 'bg-error'
                        }`}
                        style={{ width: `${coverage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-data-mono">
                      <span>Supply: {stats.totalCapacity || 0} bays</span>
                      <span>Demand: {estimate.predictedDemand || 0} slots</span>
                    </div>
                  </div>

                  {/* Hybrid Demand Estimator Breakdown Box */}
                  <div className="p-space-sm rounded-xl glass-panel border border-white/[0.06] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-[10px] uppercase text-primary font-bold">
                        Hybrid Demand Estimator (Stage A)
                      </span>
                      <span
                        className="text-[10px] font-data-mono text-on-surface-variant cursor-help"
                        title="Roadmap: Rule-based baseline → Gradient Boosting after 20-50 events → LSTM as data grows"
                      >
                        ℹ️ Roadmap
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-data-mono">
                      <div>
                        <span className="text-on-surface-variant block">Attendance:</span>
                        <span className="font-bold text-on-surface">
                          {event.expectedAttendance?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Official Spots:</span>
                        <span className="font-bold text-on-surface">{event.officialCapacity || 0}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Confidence Band:</span>
                        <span className="text-tertiary">
                          P10: {estimate.confidenceRange?.p10} - P90: {estimate.confidenceRange?.p90}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Deficit To Supply:</span>
                        <span className="font-bold text-error">{estimate.predictedDemand || 0} slots</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="p-space-md border-t border-white/[0.06] bg-surface-container-lowest/40 flex items-center justify-between gap-space-sm">
                  <button
                    type="button"
                    disabled={isActivating}
                    onClick={() => handleActivateEvent(event.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>{isActivating ? 'Activating Engine...' : 'Activate Supply Engine'}</span>
                  </button>

                  <Link
                    to={`/explore?hub=${event.id}`}
                    className="py-2 px-3 rounded-xl glass-panel hover:bg-surface-high text-on-surface font-label-md text-xs font-semibold transition-colors border border-white/[0.08]"
                  >
                    View Bays
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
