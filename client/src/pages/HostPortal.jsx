import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function HostPortal() {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState('estimator'); // 'estimator' | 'create' | 'dashboard'

  // Estimator Parameters (Interactive Stage A Rule-Based Model)
  const [attendance, setAttendance] = useState(25000);
  const [eventType, setEventType] = useState('stadium_match');
  const [officialCapacity, setOfficialCapacity] = useState(1200);

  // Form State for creating new event
  const [eventName, setEventName] = useState('Indore Tech Summit 2026');
  const [venueAddress, setVenueAddress] = useState('Brilliant Convention Centre, Scheme 78, Vijay Nagar, Indore');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEvent, setSubmittedEvent] = useState(null);

  // Stage A Lookup Parameters
  const lookupTable = {
    stadium_match: { pvs: 0.45, ppv: 2.5, pf: 1.15, label: 'Stadium Match (e.g. Holkar)' },
    concert: { pvs: 0.50, ppv: 2.2, pf: 1.20, label: 'Live Concert / Music Fest' },
    college_fest: { pvs: 0.35, ppv: 2.8, pf: 1.10, label: 'College / University Fest' },
    exhibition: { pvs: 0.55, ppv: 2.0, pf: 1.05, label: 'Trade Expo / Exhibition' },
    food_bazaar: { pvs: 0.40, ppv: 2.4, pf: 1.25, label: 'Culinary Bazaar (e.g. Chappan)' },
    cultural: { pvs: 0.42, ppv: 2.6, pf: 1.18, label: 'Cultural / Heritage Festival' }
  };

  const eventImages = {
    stadium_match: { src: '/assets/event_stadium.jpg', alt: 'Holkar Cricket Stadium sports match crowd in Indore' },
    concert: { src: '/assets/event_concert.jpg', alt: 'Live music concert stage performance with thousands of fans' },
    college_fest: { src: '/assets/event_campus.jpg', alt: 'Indore University campus grounds hosting annual youth festival' },
    exhibition: { src: '/assets/event_tech.jpg', alt: 'Brilliant Convention Centre high-tech exhibition hall' },
    food_bazaar: { src: '/assets/hub_chappan.jpg', alt: '56 Dukan evening culinary street market in Indore' },
    cultural: { src: '/assets/hub_citadel.jpg', alt: 'Cultural celebration and retail festival crowd in Indore' }
  };

  const currentParams = lookupTable[eventType] || lookupTable.concert;
  const activeEventImg = eventImages[eventType] || eventImages.concert;

  // Formula: D = Attendance × PrivateVehicleShare ÷ PersonsPerVehicle × PeakFactor − ExistingOfficialCapacity
  const rawVehicles = (attendance * currentParams.pvs) / currentParams.ppv;
  const peakVehicles = Math.round(rawVehicles * currentParams.pf);
  const predictedDemand = Math.max(0, peakVehicles - officialCapacity);

  // Confidence Bounds (P10 to P90)
  const p10 = Math.round(predictedDemand * 0.85);
  const p90 = Math.round(predictedDemand * 1.18);
  const recommendedReserve = Math.round(predictedDemand * 0.10);

  const handleCreateEvent = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({
          name: eventName,
          eventType,
          location: { address: venueAddress, lat: 22.7533, lng: 75.8937 },
          expectedAttendance: attendance,
          officialCapacity
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit event');

      setSubmittedEvent(data);
      setActiveTab('dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pt-24 pb-24 min-h-screen bg-surface text-on-surface px-margin-mobile md:px-margin max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg border-b border-outline-variant/30 gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold">
              Event Organizers & Municipal Hub
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
            EVENT HOST STUDIO
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
            Simulate attendance surges with the Hybrid Demand Estimator and orchestrate private parking supply ahead of crowds.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-full glass-panel border border-outline-variant/40">
          <button
            type="button"
            onClick={() => setActiveTab('estimator')}
            className={`px-4 py-1.5 rounded-full text-xs font-label-caps uppercase font-bold transition-all ${
              activeTab === 'estimator'
                ? 'bg-primary-container text-on-primary shadow-sm glass-pill'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Hybrid Demand Estimator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-full text-xs font-label-caps uppercase font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-primary-container text-on-primary shadow-sm glass-pill'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            + Create Event
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-label-caps uppercase font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-primary-container text-on-primary shadow-sm glass-pill'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Live Monitor
          </button>
        </div>
      </div>

      {/* TAB 1: HYBRID DEMAND ESTIMATOR (Section 6.1 Spec) */}
      {activeTab === 'estimator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Controls Column */}
          <div className="lg:col-span-6 flex flex-col gap-space-md p-space-xl rounded-3xl glass-panel-elevated border border-white/[0.08] shadow-2xl">
            {/* Visual Event Banner with Alt Text */}
            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-surface-container-high border border-white/[0.06] mb-1">
              <img
                src={activeEventImg.src}
                alt={activeEventImg.alt}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-2.5 left-3">
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {currentParams.label}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30">
              <span className="font-headline-sm text-lg font-bold text-on-surface">
                Estimator Model Parameters
              </span>
              <span className="text-[10px] font-label-caps uppercase px-2.5 py-0.5 rounded-full glass-pill text-tertiary border border-tertiary/30 font-bold">
                Stage A: Rule-Based Baseline
              </span>
            </div>

            {/* Event Category Select */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                Event Category
              </label>
              <select
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm cursor-pointer"
              >
                {Object.entries(lookupTable).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-label-caps uppercase text-on-surface-variant">
                  Expected Crowd Attendance
                </span>
                <span className="font-data-mono font-bold text-primary text-base">
                  {attendance.toLocaleString()} attendees
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="60000"
                step="500"
                value={attendance}
                onChange={e => setAttendance(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-data-mono mt-1">
                <span>1,000 (Local fest)</span>
                <span>30,000 (Stadium)</span>
                <span>60,000 (Mega Expo)</span>
              </div>
            </div>

            {/* Official On-site Capacity */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-label-caps uppercase text-on-surface-variant">
                  Existing Official Venue Capacity
                </span>
                <span className="font-data-mono font-bold text-on-surface text-base">
                  {officialCapacity} spots
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={officialCapacity}
                onChange={e => setOfficialCapacity(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Formula coefficients readout */}
            <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-data-mono space-y-1">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
                Calibrated Lookup Parameters
              </span>
              <div className="grid grid-cols-3 gap-2 text-on-surface">
                <div>PVS: {(currentParams.pvs * 100).toFixed(0)}%</div>
                <div>PPV: {currentParams.ppv}</div>
                <div>Peak Factor: {currentParams.pf}</div>
              </div>
            </div>

            {/* Model Evolution Roadmap Tooltip as Required by Spec */}
            <div className="p-space-sm rounded-xl bg-surface-container-highest/40 border border-outline-variant/40 text-xs">
              <span className="font-label-caps text-[10px] uppercase text-primary font-bold block mb-1">
                Estimator Architectural Roadmap
              </span>
              <p className="text-on-surface-variant leading-relaxed">
                <em>Rule-based baseline → Gradient Boosting after 20 to 50 events → LSTM as longitudinal occupancy dataset matures.</em>
              </p>
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="p-space-xl rounded-3xl glass-panel-elevated border-2 border-primary/40 shadow-2xl flex flex-col gap-space-lg">
              <div>
                <span className="text-[10px] font-label-caps uppercase px-2.5 py-0.5 rounded-full glass-pill text-primary border border-primary/30 font-bold">
                  STAGE A DEMAND OUTPUT
                </span>
                <h3 className="font-headline-md text-3xl font-bold text-on-surface mt-2">
                  {predictedDemand.toLocaleString()} Slots Needed
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Net external private capacity that must be activated across Indore's distributed network.
                </p>
              </div>

              {/* Confidence Range Band (P10 to P90) */}
              <div className="p-space-md rounded-2xl glass-panel border border-tertiary/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-label-caps uppercase">
                  <span className="text-tertiary font-bold">Confidence Range (P10 to P90)</span>
                  <span className="text-on-surface font-data-mono">80% Interval</span>
                </div>
                <div className="flex items-center justify-between text-sm font-data-mono">
                  <span className="text-on-surface">P10: <strong>{p10}</strong> slots</span>
                  <span className="text-primary font-bold">Baseline: {predictedDemand}</span>
                  <span className="text-on-surface">P90: <strong>{p90}</strong> slots</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden relative">
                  <div className="absolute inset-y-0 bg-tertiary/80 left-[15%] right-[15%] rounded-full"></div>
                </div>
              </div>

              {/* 10% Reserve Pool Buffer */}
              <div className="grid grid-cols-2 gap-space-md">
                <div className="p-space-sm rounded-xl glass-panel text-xs font-data-mono">
                  <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">
                    10% Hidden Reserve
                  </span>
                  <span className="text-base font-bold text-primary">+{recommendedReserve} Bays</span>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">
                    For automatic re-allocation
                  </span>
                </div>

                <div className="p-space-sm rounded-xl glass-panel text-xs font-data-mono">
                  <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">
                    Grid Ingress Buffer
                  </span>
                  <span className="text-base font-bold text-tertiary">~45 min</span>
                  <span className="text-[10px] text-on-surface-variant block mt-0.5">
                    Prior to peak gate arrival
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="w-full py-3 rounded-full bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-sm font-bold shadow-[0_0_20px_rgba(216,166,74,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>Provision Event With This Model</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE EVENT WIZARD */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto p-space-xl rounded-3xl glass-panel-elevated border border-white/[0.08] shadow-2xl">
          <div className="mb-space-lg pb-space-sm border-b border-outline-variant/30">
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">Register Event Corridor</h3>
            <p className="text-xs text-on-surface-variant">
              Submit your event to Municipal Admin queue and activate distributed parking allocation.
            </p>
          </div>

          <form onSubmit={handleCreateEvent} className="flex flex-col gap-space-lg">
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                Venue Landmark / Corridor Address
              </label>
              <input
                type="text"
                value={venueAddress}
                onChange={e => setVenueAddress(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-space-md">
              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Expected Attendance
                </label>
                <input
                  type="number"
                  value={attendance}
                  onChange={e => setAttendance(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm font-data-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Official Parking Slots
                </label>
                <input
                  type="number"
                  value={officialCapacity}
                  onChange={e => setOfficialCapacity(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm font-data-mono"
                />
              </div>
            </div>

            <div className="p-space-sm rounded-xl glass-panel text-xs font-data-mono text-tertiary">
              Calculated Demand Deficit: <strong>{predictedDemand} slots</strong> will be requested from verified Indore private hosts.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-sm font-bold shadow-lg transition-all"
            >
              {submitting ? 'Submitting to Authority Queue...' : 'Submit Event For Approval'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LIVE MONITOR */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-space-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="p-space-lg rounded-2xl glass-panel hover:glass-panel-elevated border border-white/[0.08] transition-all">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
                Active Event
              </span>
              <span className="font-headline-sm text-lg font-bold text-on-surface block mt-1">
                {submittedEvent?.name || 'Holkar Stadium Trophy Match'}
              </span>
              <span className="text-xs font-data-mono text-tertiary">Approved & Live</span>
            </div>

            <div className="p-space-lg rounded-2xl glass-panel hover:glass-panel-elevated border border-white/[0.08] transition-all">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
                Network Fill Rate
              </span>
              <span className="font-headline-sm text-2xl font-bold text-primary block mt-1">
                84.2%
              </span>
              <span className="text-xs font-data-mono text-on-surface-variant">2,140 / 2,540 booked</span>
            </div>

            <div className="p-space-lg rounded-2xl glass-panel hover:glass-panel-elevated border border-white/[0.08] transition-all">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
                No-Show Rate
              </span>
              <span className="font-headline-sm text-2xl font-bold text-tertiary block mt-1">
                2.1%
              </span>
              <span className="text-xs font-data-mono text-on-surface-variant">Well below 5% threshold</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
