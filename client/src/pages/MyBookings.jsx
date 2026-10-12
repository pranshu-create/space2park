import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function MyBookings() {
  const location = useLocation();
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reportingProblem, setReportingProblem] = useState(false);
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState('');
  const [cancelModal, setCancelModal] = useState(false);

  // Interactive Toast State
  const [toast, setToast] = useState({ show: false, title: '', message: '', icon: 'check_circle' });
  const [barrierTesting, setBarrierTesting] = useState(false);
  const [barrierVerified, setBarrierVerified] = useState(false);

  // Countdown Timer
  const [countdown, setCountdown] = useState(16 * 60 + 44);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m : ${s < 10 ? '0' : ''}${s}s`;
  };

  const showToast = (title, message, icon = 'check_circle') => {
    setToast({ show: true, title, message, icon });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Fetch user bookings
  const fetchBookings = () => {
    fetch('/api/bookings/my-bookings', {
      headers: {
        Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        if (data.length > 0) {
          const newBooking = location.state?.newBooking;
          const found = newBooking ? data.find(b => b.id === newBooking.id) : data[0];
          setSelectedBooking(found || data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Listen to reallocation socket events
  useEffect(() => {
    if (!socket) return;
    const handleReallocation = data => {
      fetchBookings();
      setReassignSuccessMsg(`Failsafe Activated: Re-allocated to Bay ${data.newSlot} in Reserve Pool!`);
    };
    socket.on('reallocation', handleReallocation);
    return () => socket.off('reallocation', handleReallocation);
  }, [socket]);

  // Handle reporting space occupied / problem
  const handleReportOccupied = async () => {
    if (!selectedBooking) return;
    setReportingProblem(true);
    setReassignSuccessMsg('');

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}/report-occupied`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({
          reason: 'Space occupied on arrival by unauthorized vehicle',
          evidenceNote: 'Reported via Seeker Mobile HUD'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to report problem');

      setReassignSuccessMsg(
        `Instant Re-allocation Successful! Assigned Reserve Bay ${data.newSlotCode} at ${data.newSpaceName}.`
      );
      showToast('RE-ALLOCATED', `Assigned priority reserve bay ${data.newSlotCode}`, 'swap_horiz');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setReportingProblem(false);
    }
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');

      showToast('PASS CANCELLED', '100% refund credited to original payment source.', 'cancel');
      setCancelModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  // Barrier Simulation
  const simulateBarrierTest = () => {
    setBarrierTesting(true);
    setTimeout(() => {
      setBarrierTesting(false);
      setBarrierVerified(true);
      showToast(
        'ANPR VERIFIED',
        `Barrier Gate 2A recognized plate ${selectedBooking?.vehicleNumber || 'MP 09 WZ 4821'} (Latency: 42ms).`,
        'door_front'
      );
    }, 1200);
  };

  const currentSlot = selectedBooking?.slotCode || 'A-12';
  const currentVenue = selectedBooking?.spaceName || 'Phoenix Citadel Grand Deck';
  const currentAddress = selectedBooking?.spaceAddress || 'Bypass Road, Sector A, Indore, MP';
  const currentVehicle = selectedBooking?.vehicleNumber || 'MP 09 WZ 4821';
  const currentAmount = selectedBooking?.amount || 130;
  const currentPassId = selectedBooking?.id ? `#${selectedBooking.id.toUpperCase()}` : '#S2P-IND-884920';

  return (
    <div className="w-full pt-16 md:pt-20 bg-surface min-h-screen text-on-surface">
      {/* Subtle Ambient Glow Orbs behind main content */}
      <div className="relative w-full overflow-hidden px-margin-mobile md:px-margin py-space-lg lg:py-space-xl">
        <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-tertiary/5 blur-[140px] pointer-events-none -z-10"></div>

        {/* Active Vehicle & Status Telemetry Strip */}
        <div className="w-full max-w-7xl mx-auto mb-space-lg">
          <div className="w-full bg-surface-container-low rounded-xl p-space-md md:p-space-lg shadow-xl relative overflow-hidden">
            {/* Subtle linear accent glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[26px]">verified</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                      RESERVATION ACTIVE
                    </span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="font-label-caps text-label-caps text-tertiary uppercase flex items-center gap-1 font-bold">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse inline-block"></span>
                      Sensors Armed
                    </span>
                    <span className="text-on-surface-variant/40">•</span>
                    <span className="font-data-mono text-data-mono text-xs text-on-surface-variant">
                      ANPR GATE 2A PRE-AUTHORIZED
                    </span>
                  </div>
                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-0.5 font-bold">
                    {currentVenue} — Bay {currentSlot}
                  </h1>
                </div>
              </div>

              {/* Dynamic Arrival Countdown Component */}
              <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-sm rounded-lg shrink-0">
                <div className="flex flex-col text-right">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Estimated Ingress
                  </span>
                  <span className="font-data-mono text-headline-sm text-primary font-semibold tracking-tight" id="arrival-timer">
                    {formatCountdown(countdown)}
                  </span>
                </div>
                <div className="w-px h-8 bg-surface-container-highest mx-1"></div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">speed</span>
                </div>
              </div>
            </div>

            {/* Micro status ticker line */}
            <div className="mt-space-sm pt-space-sm flex flex-wrap items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-data-mono text-xs text-on-surface">Ultrasonic Sensor #904 Armed</span>
                <span className="text-outline-variant">/</span>
                <span>
                  Space held exclusively for <strong className="text-on-surface font-semibold">{currentVehicle}</strong>
                </span>
              </div>
              <div className="flex items-center gap-space-xs font-data-mono text-xs">
                <span className="text-on-surface-variant">AUTH_TOKEN:</span>
                <span className="text-primary tracking-wider font-bold">0x8849-TAYCAN-INDORE</span>
              </div>
            </div>
          </div>
        </div>

        {reassignSuccessMsg && (
          <div className="w-full max-w-7xl mx-auto mb-space-lg p-space-md rounded-2xl bg-tertiary-container/20 border border-tertiary text-tertiary flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[24px]">verified</span>
              <span className="text-sm font-semibold font-body-md">{reassignSuccessMsg}</span>
            </div>
            <button onClick={() => setReassignSuccessMsg('')} className="text-on-surface hover:text-tertiary cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Centered Dual-Card Luxury Cockpit Grid */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* LEFT CARD: Contactless Barrier Pass & Escrow Details (Col 6) */}
          <div className="lg:col-span-6 flex flex-col bg-surface-container-low rounded-xl p-space-lg md:p-space-xl shadow-2xl relative overflow-hidden">
            {/* Holographic ambient highlight */}
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Pass Header Bar */}
            <div className="flex items-start justify-between pb-space-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-caps text-label-caps tracking-widest uppercase font-bold">
                    FASTPASS VIP
                  </span>
                  <span className="font-data-mono text-xs text-on-surface-variant">{currentPassId}</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1 font-bold">
                  Contactless Ingress Pass
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">DECK LOCATION</span>
                <span className="font-data-mono text-data-mono text-tertiary font-bold">LEVEL 03 • WEST</span>
              </div>
            </div>

            {/* Centerpiece: Holographic QR Shield & ANPR Notice */}
            <div className="my-space-md p-space-md rounded-xl bg-surface-container flex flex-col sm:flex-row items-center gap-space-md relative group">
              {/* QR Visual Representation */}
              <div className="relative shrink-0 p-3 bg-surface-container-lowest rounded-lg shadow-inner">
                <div className="w-36 h-36 bg-surface-container-high rounded p-1 flex items-center justify-center relative overflow-hidden">
                  {selectedBooking?.qrCodeDataUrl ? (
                    <img
                      src={selectedBooking.qrCodeDataUrl}
                      alt="Signed QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    /* Geometric Luxury QR Pattern from Stitch */
                    <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 100 100">
                      <rect fill="none" height="26" rx="2" stroke="currentColor" strokeWidth="4" width="26" x="5" y="5"></rect>
                      <rect fill="currentColor" height="14" rx="1" width="14" x="11" y="11"></rect>
                      <rect fill="none" height="26" rx="2" stroke="currentColor" strokeWidth="4" width="26" x="69" y="5"></rect>
                      <rect fill="currentColor" height="14" rx="1" width="14" x="75" y="11"></rect>
                      <rect fill="none" height="26" rx="2" stroke="currentColor" strokeWidth="4" width="26" x="5" y="69"></rect>
                      <rect fill="currentColor" height="14" rx="1" width="14" x="11" y="75"></rect>
                      <rect height="8" rx="1" width="8" x="37" y="10"></rect>
                      <rect height="8" rx="1" width="8" x="51" y="10"></rect>
                      <rect height="8" rx="1" width="8" x="37" y="24"></rect>
                      <rect height="8" rx="1" width="8" x="51" y="24"></rect>
                      <rect height="8" rx="1" width="8" x="10" y="37"></rect>
                      <rect height="8" rx="1" width="8" x="24" y="37"></rect>
                      <rect fill="none" height="24" rx="2" stroke="currentColor" strokeWidth="3" width="24" x="38" y="38"></rect>
                      <circle cx="50" cy="50" fill="currentColor" r="4"></circle>
                      <rect height="8" rx="1" width="8" x="69" y="37"></rect>
                      <rect height="8" rx="1" width="8" x="83" y="37"></rect>
                      <rect height="8" rx="1" width="8" x="69" y="51"></rect>
                      <rect height="8" rx="1" width="8" x="83" y="51"></rect>
                      <rect height="8" rx="1" width="8" x="37" y="69"></rect>
                      <rect height="8" rx="1" width="8" x="51" y="69"></rect>
                      <rect height="8" rx="1" width="8" x="37" y="83"></rect>
                      <rect height="8" rx="1" width="8" x="51" y="83"></rect>
                      <rect height="8" rx="1" width="8" x="69" y="69"></rect>
                      <rect height="8" rx="1" width="8" x="83" y="83"></rect>
                    </svg>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-tertiary/10 pointer-events-none"></div>
                </div>
                <div className="w-full text-center mt-1">
                  <span className="font-data-mono text-[10px] text-tertiary tracking-widest uppercase font-bold">
                    DYNAMIC ROLLING
                  </span>
                </div>
              </div>

              {/* Pass Scanning Details */}
              <div className="flex flex-col justify-center gap-1.5 min-w-0">
                <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold">
                  GATE SCANNER OR CAMERA
                </span>
                <p className="font-body-md text-body-md text-on-surface font-medium leading-tight">
                  Scan barcode at Barrier #2 or drive in seamlessly via automated ANPR lens.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-surface-container-high font-data-mono text-xs text-on-surface font-semibold tracking-wider">
                    {currentVehicle}
                  </span>
                  <span className="text-tertiary flex items-center text-xs font-label-caps font-bold">
                    <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span> Instant Unlock
                  </span>
                </div>
              </div>
            </div>

            {/* Bay & Vehicle Telemetry Grid */}
            <div className="grid grid-cols-2 gap-space-sm my-space-sm">
              <div className="p-space-md rounded-lg bg-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Designated Space</span>
                <div className="font-headline-md text-headline-md text-primary font-bold mt-1 tracking-tight">
                  BAY {currentSlot}
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                  Ground Ramp West • Wide Bay
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Vehicle Profile</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1 truncate">
                  Porsche Taycan
                </div>
                <span className="font-body-sm text-body-sm text-tertiary block mt-0.5 font-bold">
                  EV Fast-Dock Compatible
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Session Window</span>
                <div className="font-data-mono text-body-lg text-on-surface font-semibold mt-1">
                  07:30 PM – 09:30 PM
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                  2 Hours Pre-Booked
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Tariff Settlement</span>
                <div className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1 flex items-center gap-1">
                  ₹{currentAmount}{' '}
                  <span className="font-label-caps text-label-caps text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded font-bold">
                    PAID
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                  UPI Escrow Auto-Release
                </span>
              </div>
            </div>

            {/* In-Pass Action Center */}
            <div className="mt-space-md pt-space-sm flex flex-col gap-space-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'EV CHARGER PRE-ARMED',
                      `Bay ${currentSlot} CCS2 350kW Dispenser unlocked. Cable ready upon vehicle arrival.`,
                      'bolt'
                    )
                  }
                  className="px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">bolt</span>
                  <span>Initiate 350kW EV Charge</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'SESSION EXTENDED',
                      'Added +1 hour to session. New end window: 10:30 PM (₹65 adjusted).',
                      'schedule'
                    )
                  }
                  className="px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">more_time</span>
                  <span>Extend Time (+1 Hr)</span>
                </button>
              </div>

              {/* Problem Reporting & Share Actions */}
              <div className="flex items-center justify-between pt-space-xs flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    showToast('WALLET SYNC', 'Encrypted pass exported to Apple Wallet & WhatsApp notification sent.', 'share')
                  }
                  className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">share</span>
                  <span>Share Pass (WhatsApp / Apple Wallet)</span>
                </button>

                <button
                  type="button"
                  onClick={handleReportOccupied}
                  disabled={reportingProblem}
                  className="text-error hover:text-error-container font-label-md text-label-md flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">report_problem</span>
                  <span>{reportingProblem ? 'Reallocating...' : 'Report Space Occupied'}</span>
                </button>
              </div>

              {/* Bookings Switcher Pill if multiple */}
              {bookings.length > 1 && (
                <div className="mt-2 pt-2 border-t border-outline-variant/30 flex items-center gap-2 overflow-x-auto">
                  <span className="font-label-caps text-[10px] uppercase text-on-surface-variant font-bold shrink-0">
                    Your Passes:
                  </span>
                  {bookings.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBooking(b)}
                      className={`px-2 py-0.5 rounded text-xs font-data-mono shrink-0 transition-colors cursor-pointer ${
                        selectedBooking?.id === b.id
                          ? 'bg-primary text-on-primary font-bold'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {b.slotCode || 'Bay'} • {b.id.slice(-6)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CARD: Live Ingress Navigation HUD & Telemetry (Col 6) */}
          <div className="lg:col-span-6 flex flex-col bg-surface-container-low rounded-xl p-space-lg md:p-space-xl shadow-2xl relative overflow-hidden">
            {/* Navigation Top Bar */}
            <div className="flex items-start justify-between pb-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[24px]">turn_sharp_right</span>
                </div>
                <div>
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest font-semibold">
                    Active Ingress Guidance
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Gate 2 Pavilion Approach
                  </h2>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-data-mono text-headline-sm text-primary font-bold">2.4 km</span>
                <span className="font-label-caps text-label-caps text-tertiary font-bold">ETA 8 MINS</span>
              </div>
            </div>

            {/* Photorealistic Underground & Aerial Spatial Visualizer */}
            <div className="w-full h-56 rounded-xl relative overflow-hidden bg-surface-container my-space-xs group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Photorealistic dark concrete architectural indoor parking pavilion for luxury electric cars"
                src="/assets/pavilion_guidance.png"
                onError={e => {
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAdry9EvD3NNZGcojrokoCsqauWZumI_-nB9p26Bn6AVzb_n0uYSMKWXST_sLPbru8Bo26qrvW435B3yegQ1cBTYtkJSApXCLys7YV6ovj8yKNUbQwc3UNVXGMqfZB2kTmNIzgmmu82U_Or7MvfzPKtG-eoI-BPNFSoo2QjkP-lM4oASmz2iuwpEjtCtd794J4P96PxgyrE0HrrR-hudr99rU4w3XgI3GPKI2J42LXR2e9PiglhWWSuqw';
                }}
              />
              {/* Tactical HUD Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent flex flex-col justify-between p-space-md">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="font-data-mono text-xs text-primary font-bold">LIVE VECTOR: GATE 2A</span>
                  </div>
                  <span className="font-data-mono text-xs px-2.5 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md text-tertiary font-semibold">
                    TRAFFIC: NOMINAL (12s WAIT)
                  </span>
                </div>
                {/* Dynamic Bay Guidance Banner */}
                <div className="p-space-sm rounded-lg bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                      {currentSlot.replace('-', '')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Reserved Vector</span>
                      <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                        Overhead Gold Illuminator Armed
                      </span>
                    </div>
                  </div>
                  <span className="font-data-mono text-xs text-primary font-bold">DECK 3 RAMP</span>
                </div>
              </div>
            </div>

            {/* Turn-by-Turn Navigation Waypoints */}
            <div className="my-space-md flex flex-col gap-space-xs">
              {/* Step 1 */}
              <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container/60 hover:bg-surface-container transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-data-mono text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      Ingress via Bypass Service Road
                    </span>
                    <span className="font-data-mono text-xs text-on-surface-variant">1.8 km</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Take the dedicated commercial bypass toward Gate 2 entrance lane.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container/60 hover:bg-surface-container transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-data-mono text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      Approach Barrier 2A (ANPR Scanning)
                    </span>
                    <span className="font-data-mono text-xs text-tertiary font-bold">Automated</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Keep steady at 15 km/h. Plate {currentVehicle} validates within &lt;2 sec.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container/60 hover:bg-surface-container transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-data-mono text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      Ascend Deck 3 &amp; Follow Gold LEDs
                    </span>
                    <span className="font-data-mono text-xs text-primary font-bold">Bay {currentSlot}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Follow continuous warm gold floor guides directly to reserved bay marker.
                  </p>
                </div>
              </div>
            </div>

            {/* Marshal Assistance Anchor */}
            <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                </div>
                <div className="truncate">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">
                    Deck 3 Marshal On-Duty
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
                    Ramesh Sharma (Ground Lead)
                  </span>
                </div>
              </div>
              <a
                className="px-space-sm py-1.5 rounded-full bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-xs flex items-center gap-1 shrink-0 transition-colors"
                href="tel:+919800012345"
              >
                <span className="material-symbols-outlined text-[14px] text-tertiary">call</span>
                <span>Call Marshal</span>
              </a>
            </div>

            {/* Navigation Action Trigger Group */}
            <div className="mt-space-md pt-space-xs flex flex-col gap-space-xs">
              <a
                className="w-full py-space-sm px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                href={`https://maps.google.com/?q=${encodeURIComponent(currentAddress)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>Launch Ingress Route in Maps</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </a>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  id="test-barrier-btn"
                  onClick={simulateBarrierTest}
                  disabled={barrierTesting}
                  className="text-xs font-label-md text-primary hover:text-primary-fixed flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[15px] ${barrierTesting ? 'animate-spin' : ''}`}>
                    {barrierVerified ? 'check' : 'sensors'}
                  </span>
                  <span>
                    {barrierTesting
                      ? 'Pinging Gate 2A ANPR...'
                      : barrierVerified
                      ? 'Barrier 2A Acknowledged (Latency: 42ms)'
                      : 'Test Barrier Pre-Authorization Signal'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCancelModal(true)}
                  className="text-xs font-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Cancel Pass
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Context & Live Deck Diagnostics Strip */}
        <div className="w-full max-w-7xl mx-auto mt-space-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-md flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">ev_station</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">DC Fast Charger</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">350 kW CCS2</span>
                <span className="font-body-sm text-body-sm text-tertiary font-bold">Active at Bay {currentSlot}</span>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-md flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">videocam</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">CCTV Surveillance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">4K Continuous</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Live Guard Monitored</span>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-md flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">height</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Clearance Specs</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">2.45 Meters</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">SUV &amp; Sedan Rated</span>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-md flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">security</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Cancellation Protection</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Free Until 07:15</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">100% Instant Escrow Refund</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Feedback Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
          <div className="bg-surface-container-highest text-on-surface px-space-md py-space-sm rounded-lg shadow-2xl flex items-center gap-3 border border-primary/40 animate-fadeIn">
            <span className="material-symbols-outlined text-tertiary text-[24px]">{toast.icon}</span>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold">{toast.title}</span>
              <span className="font-body-sm text-body-sm text-on-surface">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-space-md">
            <h3 className="font-headline-sm font-bold text-lg text-on-surface">Confirm Cancellation</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Cancelling your reservation will instantly release Bay {currentSlot} back to the public pool and trigger automated re-allocation.
            </p>
            <div className="p-3 rounded-xl bg-surface-container text-xs font-data-mono text-tertiary font-bold">
              Refund Policy: 100% Instant refund credited to original payment source.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-label-md text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Keep Pass
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-bold text-xs font-label-md cursor-pointer"
              >
                Yes, Cancel Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
