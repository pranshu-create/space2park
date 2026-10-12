import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import ThreeSpatialDeck from '../components/ThreeSpatialDeck';

export default function BookingCheckout() {
  const { spaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const space = location.state?.space;
  const lockData = location.state?.lockData;
  const initialSlot = location.state?.slotCode || 'A-12';
  const vehicleMode = location.state?.vehicleMode || 'car';

  const [selectedBay, setSelectedBay] = useState(initialSlot);
  const [hourlyRate, setHourlyRate] = useState(space?.pricePerHour || 50);
  const [durationHours, setDurationHours] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState('MP 09 WZ 4821');
  const [payMethod, setPayMethod] = useState('upi');
  const [demoOutcome, setDemoOutcome] = useState('success');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('blueprint');

  // Lock countdown timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(300);

  useEffect(() => {
    if (!lockData?.expiresAt) return;
    const expiresTimestamp = new Date(lockData.expiresAt).getTime();
    const interval = setInterval(() => {
      const remainingMs = expiresTimestamp - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSeconds(remainingSec);
      if (remainingSec <= 0) {
        clearInterval(interval);
        setErrorMessage('Atomic slot lock has expired. Slot returned to public pool.');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockData]);

  const baseAmount = durationHours * hourlyRate;
  const preconditioningFee = 20;
  const escrowFee = 10;
  const totalAmount = baseAmount + preconditioningFee + escrowFee;

  const handleSelectBay = (bay, rate) => {
    setSelectedBay(bay);
    if (rate) setHourlyRate(rate);
  };

  const handleConfirmReservation = async e => {
    if (e) e.preventDefault();
    setProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({
          spaceId: space?.id || spaceId || 'space_citadel_01',
          slotCode: selectedBay,
          lockToken: lockData?.lockToken || `token_${Date.now()}`,
          vehicleNumber,
          vehicleType: vehicleMode,
          hours: durationHours,
          demoOutcome
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment and booking failed.');

      if (data.status === 'failed' || data.status === 'cancelled') {
        setErrorMessage(`Simulation outcome: ${data.message || 'Payment rejected'}. Lock automatically released.`);
        setProcessing(false);
        return;
      }

      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });

      setTimeout(() => {
        navigate('/my-bookings', { state: { newBooking: data.booking } });
      }, 900);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const venueTitle = space?.name || 'Phoenix Citadel Grand Deck — Level 03';
  const venueAddress = space?.address || 'Bypass Road, Sector A, Indore, MP • 0.8 km from your current GPS';

  return (
    <div className="w-full pt-16 md:pt-20 bg-surface min-h-screen text-on-surface">
      <div className="w-full px-margin-mobile md:px-margin py-space-lg max-w-7xl mx-auto">
        {/* Top System Sub-Bar / Breadcrumbs & Status */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <Link to="/explore" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Find Parking
            </Link>
            <span>/</span>
            <span className="text-on-surface-variant">Phoenix Citadel</span>
            <span>/</span>
            <span className="text-primary font-semibold">Level 03 — Section A &amp; B</span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-data-mono text-xs text-on-surface font-bold">ANPR GATE #02 LIVE</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps">
              <span className="material-symbols-outlined text-primary text-[15px]">verified</span>
              ISO 27001 &amp; PRIVACY COMPLIANT
            </div>
          </div>
        </div>

        {/* Lock Timer Warning if active */}
        {timeLeftSeconds < 120 && (
          <div className="mb-space-md p-space-sm rounded-xl bg-primary-container/20 border border-primary text-primary flex items-center justify-between text-xs font-data-mono">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">lock_clock</span>
              <span>Server-Authoritative Lock Active for Bay {selectedBay}. Holding exclusively in Redis.</span>
            </div>
            <span className="font-bold">{Math.floor(timeLeftSeconds / 60)}:{(timeLeftSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
        )}

        {/* Main Workspace Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT COLUMN: 60% (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg min-w-0">
            {/* Header Banner Section */}
            <div className="flex flex-col gap-space-xs glass-panel p-space-lg rounded-2xl shadow-xl border border-white/[0.08]">
              <div className="flex flex-wrap items-start justify-between gap-space-md">
                <div>
                  <div className="inline-flex items-center gap-2 text-primary font-label-caps text-label-caps tracking-widest uppercase mb-1 font-bold">
                    <span className="material-symbols-outlined text-[14px]">local_parking</span>
                    Autonomous Tier-1 Hub
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    {venueTitle}
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">location_on</span>
                    {venueAddress}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-xl border border-white/[0.08]">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface leading-none font-bold">4.9</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">(1,420 reviews)</span>
                  </div>
                  <span className="font-label-caps text-[10px] uppercase text-tertiary mt-1 font-bold">
                    Direct Mall Atrium Lift
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Spatial Deck Visualizer & Slot Matrix */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col border border-white/[0.08]">
              {/* Viewport Visual Context Image & WebGL Toggle */}
              <div className="relative w-full h-64 md:h-72 bg-surface-container-lowest overflow-hidden">
                {viewMode === 'blueprint' ? (
                  <div className="relative w-full h-full">
                    <img
                      src="/assets/3d_deck.png"
                      alt="Subterranean 3D architectural deck layout and slot positioning"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent"></div>
                  </div>
                ) : (
                  <ThreeSpatialDeck selectedBayCode={selectedBay} className="w-full h-full" />
                )}

                {/* Floating Deck HUD Badges & Mode Switcher */}
                <div className="absolute top-space-md left-space-md right-space-md flex flex-wrap items-center justify-between gap-2 z-10">
                  <div className="flex flex-wrap gap-2">
                    <div className="px-space-sm py-1 rounded-full glass-pill text-on-surface font-data-mono text-xs flex items-center gap-1.5 shadow-sm font-bold border border-white/[0.08]">
                      <span className="material-symbols-outlined text-tertiary text-[14px]">sensors</span>
                      CAD Sync: 80ms Ultra-Wideband
                    </div>
                    <div className="px-space-sm py-1 rounded-full glass-pill text-primary font-data-mono text-xs shadow-sm font-bold border border-primary/30">
                      Ramp Clearance: 2.80m
                    </div>
                  </div>

                  {/* Blueprint vs 3D WebGL Switcher */}
                  <div className="flex items-center gap-1 p-1 rounded-full glass-pill border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setViewMode('blueprint')}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-caps uppercase font-bold transition-all ${
                        viewMode === 'blueprint'
                          ? 'bg-primary-container text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Blueprint
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('webgl3d')}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-caps uppercase font-bold transition-all flex items-center gap-1 ${
                        viewMode === 'webgl3d'
                          ? 'bg-primary-container text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">view_in_ar</span>
                      3D Orbit
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-space-md left-space-md right-space-md flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface glass-pill px-2.5 py-1 rounded-full border border-white/[0.08]">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                      Bay {selectedBay} Selected
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant glass-pill px-2.5 py-1 rounded-full border border-white/[0.08]">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      60kW DC Ready
                    </div>
                  </div>
                  <span className="font-data-mono text-[11px] text-on-surface-variant glass-pill px-2 py-0.5 rounded border border-white/[0.08]">
                    ELEVATION +11.20M
                  </span>
                </div>
              </div>

              {/* Interactive Bay Matrix Canvas */}
              <div className="p-space-lg flex flex-col gap-space-lg">
                <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm border-b border-outline-variant/30">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase font-bold">
                      Interactive Spatial Grid
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span className="font-body-sm text-body-sm text-secondary">Tap any empty bay to switch reservation</span>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-space-md font-label-caps text-[10px] uppercase">
                    <span className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="w-2.5 h-2.5 rounded bg-surface-container-highest"></span> Occupied
                    </span>
                    <span className="flex items-center gap-1.5 text-tertiary">
                      <span className="w-2.5 h-2.5 rounded bg-tertiary/40"></span> Available
                    </span>
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <span className="w-2.5 h-2.5 rounded bg-primary ring-2 ring-primary/40"></span> Selected
                    </span>
                  </div>
                </div>

                {/* ROW A: Premium SUV & EV Bays */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs font-semibold text-on-surface tracking-wider uppercase flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-primary text-[16px]">ev_station</span>
                      Row A — High-Capacity DC Fast Charge Bays (Up to 4.9m)
                    </span>
                    <span className="font-data-mono text-xs text-tertiary font-bold">2 / 8 Open</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2" id="slot-matrix-row-a">
                    {[
                      { slot: 'A-01', car: 'Taycan', occupied: true },
                      { slot: 'A-02', car: 'Cybertruck', occupied: true },
                      { slot: 'A-03', car: 'Nexon EV', occupied: true },
                      { slot: 'A-04', spec: '60 kW', occupied: false, rate: 50 },
                      { slot: 'A-05', spec: '60 kW', occupied: false, rate: 50 },
                      { slot: 'A-06', car: 'Ioniq 5', occupied: true },
                      { slot: 'A-07', car: 'BMW iX', occupied: true },
                      { slot: 'A-12', spec: '60 kW', occupied: false, rate: 50 }
                    ].map(bay => {
                      const isSelected = selectedBay === bay.slot;
                      if (bay.occupied) {
                        return (
                          <div
                            key={bay.slot}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-high text-on-secondary-container opacity-60 cursor-not-allowed"
                          >
                            <span className="font-data-mono text-xs font-bold">{bay.slot}</span>
                            <span className="text-[9px] uppercase tracking-tighter mt-0.5">{bay.car}</span>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={bay.slot}
                          type="button"
                          onClick={() => handleSelectBay(bay.slot, bay.rate)}
                          className={`bay-tile group flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 scale-105'
                              : 'bg-tertiary-container/15 hover:bg-tertiary-container/25 text-tertiary'
                          }`}
                        >
                          <span className="font-data-mono text-xs font-bold">{bay.slot}</span>
                          <span className="text-[9px] uppercase tracking-tighter mt-0.5 font-bold">
                            {isSelected ? 'ACTIVE' : bay.spec}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROW B: Two-Wheeler Racks */}
                <div className="flex flex-col gap-space-xs pt-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-xs font-semibold text-on-surface-variant tracking-wider uppercase flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-secondary text-[16px]">two_wheeler</span>
                      Row B — Two-Wheeler &amp; Battery Swap Locker Racks
                    </span>
                    <span className="font-data-mono text-xs text-on-surface-variant font-bold">9 / 12 Open</span>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'B-06', 'B-07', 'B-08', 'B-09', 'B-10', 'B-11', 'B-12'].map(
                      (b, i) => {
                        const isOccupied = i === 0 || i === 4 || i === 9;
                        const isSelected = selectedBay === b;
                        if (isOccupied) {
                          return (
                            <div key={b} className="p-1.5 rounded bg-surface-container-high text-center text-on-secondary-container text-[10px] font-data-mono opacity-50">
                              {b}
                            </div>
                          );
                        }
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => handleSelectBay(b, 20)}
                            className={`p-1.5 rounded text-center transition-colors text-[10px] font-data-mono cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-on-primary font-bold'
                                : 'bg-surface-container text-on-surface-variant hover:bg-tertiary/20 hover:text-tertiary'
                            }`}
                          >
                            {b}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Deck Telemetry Status Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-md rounded-xl glass-panel text-on-surface-variant border border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">height</span>
                    <div>
                      <div className="font-label-caps text-[10px] uppercase tracking-wider text-secondary">Floor Clearance</div>
                      <div className="font-data-mono text-sm text-on-surface font-bold">2.80m Max Height</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">wifi_tethering</span>
                    <div>
                      <div className="font-label-caps text-[10px] uppercase tracking-wider text-secondary">Sensor Latency</div>
                      <div className="font-data-mono text-sm text-on-surface font-bold">Ultrasonic 80ms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">elevator</span>
                    <div>
                      <div className="font-label-caps text-[10px] uppercase tracking-wider text-secondary">Pedestrian Transit</div>
                      <div className="font-data-mono text-sm text-on-surface font-bold">West Core Lift #02</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Facility Specifications & Amenities Grid */}
            <div className="flex flex-col gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Deck Infrastructure &amp; Security
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="p-space-md rounded-2xl glass-panel shadow-sm flex items-start gap-space-sm border border-white/[0.08]">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-white/[0.06]">
                    <span className="material-symbols-outlined text-[22px]">auto_read_play</span>
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface font-semibold">ANPR Contactless Barrier</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Seamless optical number plate matching opens barricade without lowering driver window.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-2xl glass-panel shadow-sm flex items-start gap-space-sm border border-white/[0.08]">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary shrink-0 border border-white/[0.06]">
                    <span className="material-symbols-outlined text-[22px]">bolt</span>
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface font-semibold">EV High-Speed CCS2 60kW</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Plug &amp; charge enabled at ₹14/unit with auto-billing directly through your Space2Park wallet.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-2xl glass-panel shadow-sm flex items-start gap-space-sm border border-white/[0.08]">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-white/[0.06]">
                    <span className="material-symbols-outlined text-[22px]">videocam</span>
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface font-semibold">4K AI Continuous Sentry</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Overhead 360° tamper surveillance with instant push alerts for door dings or proximity alerts.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-2xl glass-panel shadow-sm flex items-start gap-space-sm border border-white/[0.08]">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary shrink-0 border border-white/[0.06]">
                    <span className="material-symbols-outlined text-[22px]">ac_unit</span>
                  </div>
                  <div>
                    <h3 className="font-label-md text-label-md text-on-surface font-semibold">Subterranean Climate Control</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Vapor-cooled 24°C ambient envelope prevents thermal runaway during intensive summer heatwaves.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Intelligence & Verified Tips */}
            <div className="p-space-lg rounded-2xl glass-panel flex flex-col gap-space-md shadow-sm border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Driver Intelligence &amp; Verified Tips
                </h2>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold">Indore EV Syndicate</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="p-space-md rounded-xl glass-panel flex flex-col gap-space-xs border border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">V</div>
                      <span className="font-label-md text-label-md text-on-surface font-medium">Vikramaditya S.</span>
                    </div>
                    <span className="font-data-mono text-xs text-secondary">Yesterday</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    "Bay A-12 is the widest slot in Section A. Easiest turnaround radius for long sedans like the Taycan or EQS. Direct elevator to PVR Lux cinema."
                  </p>
                </div>
                <div className="p-space-md rounded-xl glass-panel flex flex-col gap-space-xs border border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs">P</div>
                      <span className="font-label-md text-label-md text-on-surface font-medium">Pooja M.</span>
                    </div>
                    <span className="font-data-mono text-xs text-secondary">3 days ago</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    "Fastag autogate worked in under 1 second. The 60kW DC charger topped up my battery from 34% to 80% while I was shopping inside Citadel."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 40% (5 Cols) - STICKY RESERVATION DRAWER */}
          <div className="lg:col-span-5 w-full sticky top-24">
            <div className="w-full glass-panel-elevated rounded-3xl p-space-lg shadow-2xl flex flex-col gap-space-md relative overflow-hidden border border-primary/30">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-space-sm border-b border-white/[0.08]">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                    Configured Slot
                  </span>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-[32px] leading-tight font-bold text-on-surface" id="selected-bay-title">
                      Bay {selectedBay}
                    </h3>
                    <span className="font-data-mono text-xs text-secondary font-bold" id="selected-bay-sensor">
                      (Sensor #904)
                    </span>
                  </div>
                </div>
                <div className="px-space-sm py-1 rounded-full glass-pill text-tertiary font-label-caps text-[10px] uppercase font-bold flex items-center gap-1.5 border border-tertiary/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  Live Reservation
                </div>
              </div>

              {/* Luxury Car Image Preview with Alt Text */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-inner border border-white/[0.08]">
                <img
                  src="/assets/hero_car.png"
                  alt="Porsche Taycan electric sedan parked in reserved intelligent charging bay"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/90 via-surface-container-lowest/40 to-transparent flex items-center p-space-md">
                  <div className="max-w-[180px]">
                    <span className="font-label-caps text-[9px] uppercase text-primary font-bold tracking-wider">
                      Assigned Specs
                    </span>
                    <p className="font-label-md text-xs text-on-surface font-semibold">
                      Sedan • Air Susp Safe • 15m to Lift
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Registration Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center justify-between font-bold">
                  <span>Vehicle Registration (ANPR Sync)</span>
                  <span className="text-tertiary font-normal lowercase text-[10px]">Auto-detected</span>
                </label>
                <div className="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg bg-surface-container-highest">
                  <span className="material-symbols-outlined text-primary text-[20px]">directions_car</span>
                  <input
                    className="bg-transparent font-data-mono text-sm text-on-surface focus:outline-none w-full tracking-wider font-semibold uppercase"
                    type="text"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  />
                  <span className="font-label-caps text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-bold">
                    Taycan EV
                  </span>
                </div>
              </div>

              {/* Duration Selector */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  <span>Parking Duration</span>
                  <span className="text-on-surface font-data-mono lowercase">Arrival: Today, 07:30 PM</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { hours: 1, label: '+1 hr' },
                    { hours: 2, label: '2 hrs' },
                    { hours: 4, label: '+4 hrs' },
                    { hours: 8, label: 'Full Day' }
                  ].map(dur => {
                    const isActive = durationHours === dur.hours;
                    return (
                      <button
                        key={dur.hours}
                        type="button"
                        onClick={() => setDurationHours(dur.hours)}
                        className={`duration-btn py-2 rounded-lg font-label-md text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-primary text-on-primary font-semibold shadow-sm'
                            : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {dur.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span>Standard Parking ({durationHours} hrs @ ₹{hourlyRate}/hr)</span>
                  <span className="font-data-mono text-on-surface font-semibold">₹{baseAmount}.00</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    EV Bay Pre-conditioning
                    <span className="material-symbols-outlined text-[13px] text-tertiary" title="Slot sensor locks and clears access ramp">
                      info
                    </span>
                  </span>
                  <span className="font-data-mono text-on-surface font-semibold">₹{preconditioningFee}.00</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span>Escrow &amp; Guaranteed Vacancy</span>
                  <span className="font-data-mono text-on-surface font-semibold">₹{escrowFee}.00</span>
                </div>
                <div className="pt-space-xs mt-space-xs flex items-center justify-between border-t border-outline-variant/30">
                  <div>
                    <div className="font-label-caps text-label-caps uppercase text-secondary font-bold">Total Amount Due</div>
                    <div className="font-label-caps text-[9px] text-tertiary font-bold">Zero Surge Guarantee</div>
                  </div>
                  <div className="font-display text-[26px] leading-none font-bold text-primary">
                    ₹{totalAmount}.00
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">
                  Instant Checkout Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / GPay', icon: 'account_balance_wallet' },
                    { id: 'fastag', label: 'Fastag Toll', icon: 'toll' },
                    { id: 'card', label: 'Card', icon: 'credit_card' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id)}
                      className={`cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-lg transition-colors text-center ${
                        payMethod === m.id
                          ? 'bg-surface-container-highest text-primary border border-primary/40'
                          : 'bg-surface-container hover:bg-surface-bright text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                      <span className="font-label-caps text-[10px] mt-1 uppercase font-bold text-on-surface">
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SIH Judge Demo Outcome Selector */}
              <div className="p-space-sm rounded-lg bg-surface-container-highest/60 border border-primary/30 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-label-caps uppercase text-primary font-bold">
                  <span>Judge Simulation Mode</span>
                  <span>DEMO_OUTCOME</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {['success', 'failure', 'timeout'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDemoOutcome(mode)}
                      className={`py-1 text-[10px] rounded font-label-caps uppercase font-bold transition-all cursor-pointer ${
                        demoOutcome === mode
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-space-sm rounded-lg bg-error-container/30 border border-error text-error text-xs font-data-mono">
                  {errorMessage}
                </div>
              )}

              {/* Primary CTA Button */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmReservation}
                  className="w-full py-3.5 px-space-md rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all transform active:scale-[0.99] text-center cursor-pointer"
                >
                  {processing ? (
                    <span>Securing Pass...</span>
                  ) : (
                    <>
                      <span>Lock Bay {selectedBay} &amp; Generate Pass</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-center text-on-surface-variant font-body-sm text-xs pt-1">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">verified_user</span>
                  <span>Free cancellation up to 15 mins before entry. Slot is 100% held.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
