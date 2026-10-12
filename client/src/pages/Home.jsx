import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function Home({ vehicleMode = 'car', setVehicleMode }) {
  const navigate = useNavigate();
  const { user, token, demoLogin } = useAuth();

  // Search & Filter State
  const [destination, setDestination] = useState('phoenix');
  const [bayClass, setBayClass] = useState('Standard Sedan / Hatchback');
  const [activeFilters, setActiveFilters] = useState(['ev']);
  const [selectedZone, setSelectedZone] = useState('all');

  // Selected Hub on Map & Hubs List
  const [selectedHub, setSelectedHub] = useState('phoenix');

  // 3D Slot Allocator State
  const [selectedSlot, setSelectedSlot] = useState({
    slot: 'A-12',
    type: 'Car',
    rate: '₹50',
    ev: 'Yes (Level 2 DC)',
    sensor: '904',
    status: 'Selected'
  });

  // Host Earnings Calculator State
  const [calcCars, setCalcCars] = useState(2);
  const [calcBikes, setCalcBikes] = useState(5);

  // Reservation Modal State
  const [reservationModal, setReservationModal] = useState({
    isOpen: false,
    venue: 'Phoenix Citadel Mall',
    rate: '₹50/hr',
    bay: 'Bay C-09 (Covered Basement)'
  });

  // Host Registration Modal State
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [hostFormSubmitted, setHostFormSubmitted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Live Events from Backend
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  // Filter chips toggling
  const toggleFilter = filterId => {
    setActiveFilters(prev =>
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, f]
    );
  };

  // 3D Slot Click Handler
  const handleSlotClick = (slot, type, rate, ev, sensor, status) => {
    if (status === 'Occupied') return;
    setSelectedSlot({ slot, type, rate, ev, sensor, status: 'Selected' });
  };

  // Open Reservation Modal
  const openReservationModal = (venue, rate, bay) => {
    setBookingError('');
    setBookingConfirmed(false);
    setReservationModal({
      isOpen: true,
      venue,
      rate,
      bay
    });
  };

  // Confirm Booking from Modal (Creates real cryptographically signed booking pass)
  const handleConfirmBooking = async () => {
    setBookingConfirmed(true);
    setBookingError('');
    try {
      let activeToken = token || localStorage.getItem('s2p_token');
      if (!activeToken) {
        await demoLogin('seeker');
        activeToken = localStorage.getItem('s2p_token');
      }

      // Map venue to synthetic Indore space ID
      const v = (reservationModal.venue || '').toLowerCase();
      let spaceId = 'space_ind_holkar_1';
      if (v.includes('brilliant') || v.includes('tech expo')) {
        spaceId = 'space_ind_brilliant_1';
      } else if (v.includes('chappan') || v.includes('56 dukan')) {
        spaceId = 'space_ind_chappan_1';
      } else if (v.includes('citadel') || v.includes('nexus')) {
        spaceId = 'space_ind_holkar_1';
      }

      const bayMatch = reservationModal.bay?.match(/[A-Z]-\d+/)?.[0] || selectedSlot.slot || 'A-12';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          spaceId,
          slotCode: bayMatch,
          vehicleNumber: user?.vehicleNumber || 'MP 09 WZ 4821',
          vehicleType: vehicleMode || 'car',
          hours: 2,
          demoOutcome: 'success'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue instant reservation pass');

      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      localStorage.setItem('s2p_last_booking', JSON.stringify(data.booking));

      setTimeout(() => {
        setReservationModal(prev => ({ ...prev, isOpen: false }));
        setBookingConfirmed(false);
        navigate('/my-bookings', { state: { newBooking: data.booking } });
      }, 900);
    } catch (err) {
      console.error('Instant reservation error:', err);
      setBookingError(err.message);
      setBookingConfirmed(false);
      alert('Reservation Error: ' + err.message);
    }
  };

  // Host Form Submit
  const handleHostSubmit = e => {
    e.preventDefault();
    setHostFormSubmitted(true);
    setTimeout(() => {
      setHostModalOpen(false);
      setHostFormSubmitted(false);
      alert('Thank you! Our Indore field surveyor will arrive within 24 hours to install ultrasonic sensors free of charge.');
    }, 1000);
  };

  // Calculate Monthly Earnings
  const monthlyEarnings = Math.round(
    calcCars * 40 * 8 * 26 * 0.75 + calcBikes * 15 * 8 * 26 * 0.75
  );

  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest">
        {/* Cinematic Visual Background with Ambient Scrims */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Porsche Taycan in hyper-luxurious ambient illuminated parking facility"
            className="w-full h-full object-cover object-center opacity-45 transform scale-105 motion-safe:transition-transform duration-1000"
            src="/assets/hero_car.png"
            onError={e => {
              e.currentTarget.src =
                'https://lh3.googleusercontent.com/aida-public/AB6AXuA9V3PlXqxc7VJ7UKxMq3HB6P3nM1Qth5sxSZAiX9z8r72ayYF8BGiXFf__CKKP8TygE1VH2izkEwcg6_QILbi3_abd3Lf7g3-4P4WnM6YcBcbwo9UvT2i0kmL-YWncv4kgUyJLvUmbM5SUZwCVBQMf2hkVnVc2L511dYdWeSbKDi4UyAauGuX6c_5VCoowL2IwmIFUVHjMGMKu9YBGlXbhaB8j0r-VQiuoPohvwipubHVlC-XgGEohMA';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 w-full px-margin-mobile md:px-margin pt-12 pb-24 md:py-24 max-w-7xl mx-auto flex flex-col justify-between min-h-[82vh]">
          {/* Top Meta Badges */}
          <div className="flex flex-wrap items-center gap-space-sm mb-space-lg">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/90 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
                INDORE EDITION • LIVE IN 14+ HUBS
              </span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md shadow-sm">
              <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                100% SENSOR VERIFIED
              </span>
            </div>
          </div>

          {/* Hero Main Copy & Spatial Visual Badges Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-end my-auto">
            <div className="lg:col-span-8 flex flex-col">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-tight text-on-surface font-headline-lg uppercase mb-space-md">
                PARK SMART.<br />
                <span className="text-primary selection:text-surface">ARRIVE EASY.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-xl leading-relaxed">
                Find and reserve guaranteed parking for cars and two-wheelers with calibrated sensor precision — wherever Indore takes you.
              </p>

              {/* Primary / Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-space-md">
                <a
                  className="inline-flex items-center gap-space-sm px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm text-label-md font-semibold hover:bg-primary shadow-[0_0_24px_rgba(216,166,74,0.3)] transition-all"
                  href="#search-section"
                >
                  <span>Find Parking</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
                <button
                  type="button"
                  onClick={() => setHostModalOpen(true)}
                  className="inline-flex items-center gap-space-sm px-space-lg py-space-sm rounded-full bg-surface-container-high text-on-surface font-headline-sm text-label-md hover:bg-surface-bright shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">garage_home</span>
                  <span>List Your Space</span>
                </button>
              </div>
            </div>

            {/* Cockpit HUD Floating Sensor Card */}
            <div className="lg:col-span-4 flex flex-col gap-space-sm">
              <div className="p-space-lg rounded-xl bg-surface-container-high/90 backdrop-blur-2xl shadow-xl flex flex-col gap-space-md relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
                    <span className="font-label-caps text-label-caps uppercase text-tertiary">Live Sensor Bay Active</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-xs text-on-surface-variant">P-704</span>
                </div>
                <div className="space-y-1">
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">
                    Brilliant Convention Centre
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Scheme 78, Vijay Nagar Corridor
                  </span>
                </div>

                {/* Telemetry Badges Strip */}
                <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
                  <div className="p-space-xs rounded bg-surface-container text-center">
                    <span className="block font-data-mono text-data-mono text-xs text-primary font-bold">24 SPOTS</span>
                    <span className="block font-label-caps text-[9px] uppercase text-on-surface-variant">Available</span>
                  </div>
                  <div className="p-space-xs rounded bg-surface-container text-center">
                    <span className="block font-data-mono text-data-mono text-xs text-tertiary font-bold">2 MIN</span>
                    <span className="block font-label-caps text-[9px] uppercase text-on-surface-variant">Drive ETA</span>
                  </div>
                  <div className="p-space-xs rounded bg-surface-container text-center">
                    <span className="block font-data-mono text-data-mono text-xs text-on-surface font-bold">₹40/hr</span>
                    <span className="block font-label-caps text-[9px] uppercase text-on-surface-variant">Base Rate</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-space-xs text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">bolt</span>
                    <span className="font-body-sm text-body-sm">350kW DC Fast Charge</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-primary font-bold">99.8% Match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Anchor Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md pt-space-xl text-on-surface">
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">98.4%</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Guaranteed Bay Arrival</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">14,200+</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Spaces Mapped Indore</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-bold text-tertiary tracking-tight">4.9 / 5</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Driver Community Trust</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">&lt; 30s</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Contactless Barrier Pass</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING INTEGRATED SEARCH COMPONENT */}
      <section className="relative z-20 w-full px-margin-mobile md:px-margin -mt-8 max-w-7xl mx-auto" id="search-section">
        <div className="w-full glass-panel-elevated rounded-3xl p-space-md md:p-space-lg shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-primary/30">
          {/* Vehicle Mode Segmented Switch */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md pb-space-sm bg-surface-container-lowest/40 p-1.5 rounded-xl">
            <div className="inline-flex p-1 rounded-lg bg-surface-container-low gap-1" id="vehicle-type-tabs">
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('car')}
                className={`vehicle-tab-btn inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-md text-label-md font-label-md transition-all ${
                  vehicleMode === 'car'
                    ? 'active bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">directions_car</span>
                <span>Car Parking</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('bike')}
                className={`vehicle-tab-btn inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-md text-label-md font-label-md transition-all ${
                  vehicleMode === 'bike'
                    ? 'active bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                <span>Bike / 2-Wheeler</span>
              </button>
            </div>
            <div className="flex items-center gap-space-md px-space-xs text-xs text-on-surface-variant font-data-mono">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Dynamic Surge Protection Active
              </span>
            </div>
          </div>

          {/* Input Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-sm">
            {/* Destination Input */}
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary/40 transition-all">
              <div className="flex items-center gap-space-xs text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">search</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">Destination</span>
              </div>
              <select
                id="destination-select"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none cursor-pointer"
              >
                <option className="bg-surface-container text-on-surface" value="phoenix">Phoenix Citadel Mall, Bypass Rd</option>
                <option className="bg-surface-container text-on-surface" value="brilliant">Brilliant Convention Centre, Vijay Nagar</option>
                <option className="bg-surface-container text-on-surface" value="56dukan">56 Dukan Culinary Zone, Palasia</option>
                <option className="bg-surface-container text-on-surface" value="holkar">Holkar Cricket Stadium, Race Course</option>
                <option className="bg-surface-container text-on-surface" value="supercorridor">Super Corridor IT Hub</option>
              </select>
            </div>

            {/* Vehicle Detail Spec */}
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary/40 transition-all">
              <div className="flex items-center gap-space-xs text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">Bay Class</span>
              </div>
              <select
                id="bay-class-select"
                value={bayClass}
                onChange={e => setBayClass(e.target.value)}
                className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none cursor-pointer"
              >
                <option className="bg-surface-container text-on-surface">Standard Sedan / Hatchback</option>
                <option className="bg-surface-container text-on-surface">Large SUV / Premium 4x4</option>
                <option className="bg-surface-container text-on-surface">EV Fast Charging Dock (CCS2)</option>
                <option className="bg-surface-container text-on-surface">Premium Superbike Bay</option>
              </select>
            </div>

            {/* Date & Duration */}
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary/40 transition-all">
              <div className="flex items-center gap-space-xs text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">Arrival &amp; Duration</span>
              </div>
              <div className="flex items-center justify-between text-on-surface font-body-md text-body-md">
                <span>Today, Immediate</span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-data-mono">2 Hours</span>
              </div>
            </div>

            {/* Action Submit */}
            <button
              id="trigger-search-btn"
              type="button"
              onClick={() => {
                const hubParam = destination === 'phoenix' ? 'citadel' : destination === '56dukan' ? 'dukan' : destination;
                navigate(`/explore?hub=${hubParam}`);
              }}
              className="h-full min-h-[52px] rounded-xl bg-primary-container text-on-primary font-headline-sm text-body-md font-semibold flex items-center justify-center gap-space-xs hover:bg-primary shadow-[0_0_20px_rgba(216,166,74,0.25)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">radar</span>
              <span>SEARCH SPACES</span>
            </button>
          </div>

          {/* Filter Subline quick tags */}
          <div className="flex flex-wrap items-center gap-2 mt-space-sm pt-space-xs text-xs text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase text-secondary">Instant Filters:</span>
            <button
              type="button"
              onClick={() => toggleFilter('ev')}
              className={`filter-chip px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                activeFilters.includes('ev')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              ⚡ EV Fast Charge
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('covered')}
              className={`filter-chip px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                activeFilters.includes('covered')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              🛡️ Covered Basement
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('cctv')}
              className={`filter-chip px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                activeFilters.includes('cctv')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              📹 24/7 CCTV Guard
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('valet')}
              className={`filter-chip px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                activeFilters.includes('valet')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              🎟️ Valet Option
            </button>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION: "PARKING, SIMPLIFIED." */}
      <section className="w-full px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
          <div>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high mb-space-xs">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">PLATFORM ARCHITECTURE</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
              PARKING, SIMPLIFIED.
            </h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Engineered for zero-friction access, smart telemetry, and instant bay reservations across commercial towers and event hubs.
          </p>
        </div>

        {/* 4 Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1 */}
          <div className="p-space-lg rounded-3xl glass-panel hover:glass-panel-elevated transition-all flex flex-col justify-between group shadow-sm border border-white/[0.08]">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all border border-white/[0.06]">
                <span className="material-symbols-outlined text-[26px]">sensors</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">Live Telemetry</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Real-time ultrasonic bay sensors confirm exact slot vacancy before you depart, eliminating blind circling.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-data-mono">
              <span>LATENCY &lt; 80ms</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-space-lg rounded-3xl glass-panel hover:glass-panel-elevated transition-all flex flex-col justify-between group shadow-sm border border-white/[0.08]">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all border border-white/[0.06]">
                <span className="material-symbols-outlined text-[26px]">commute</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">Car + Bike Dual Deck</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Optimized for Indore's dynamic vehicular mix. Dedicated multi-tier motorcycle docks alongside standard car bays.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-data-mono">
              <span>SPLIT CAPACITY</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-space-lg rounded-3xl glass-panel hover:glass-panel-elevated transition-all flex flex-col justify-between group shadow-sm border border-white/[0.08]">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all border border-white/[0.06]">
                <span className="material-symbols-outlined text-[26px]">stadium</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">Event Lock Pass</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Pre-book secured bays for stadium matches, high-octane fests, and cultural expos with expedited departure corridors.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-data-mono">
              <span>PRIORITY PASS</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-space-lg rounded-3xl glass-panel hover:glass-panel-elevated transition-all flex flex-col justify-between group shadow-sm border border-white/[0.08]">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all border border-white/[0.06]">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">Rigorous Audit</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Every location undergoes our 18-point infrastructure audit: ANPR camera gates, illuminated access, and on-site guards.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-data-mono">
              <span>ISO 27001 AUDITED</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE PARKING NEAR YOU (Interactive Indore Map & Live Result Feed) */}
      <section className="w-full px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-space-lg gap-space-md">
          <div>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high mb-space-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
                REAL-TIME RADAR • INDORE METRO
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
              PARKING NEAR YOU
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Live capacity monitoring across Indore's key arterial routes and prime commerce centers.
            </p>
          </div>

          {/* Indore Zone Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5" id="zone-pills">
            {['all', 'vijay-nagar', 'palasia', 'bhawarkua', 'super-corridor'].map(zone => {
              const labelMap = {
                all: 'All Zones',
                'vijay-nagar': 'Vijay Nagar',
                palasia: 'Palasia',
                bhawarkua: 'Bhawarkua',
                'super-corridor': 'Super Corridor'
              };
              const isActive = selectedZone === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`zone-pill px-space-sm py-1 rounded-full font-label-md text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'active-pill bg-primary-container text-on-primary font-semibold'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {labelMap[zone]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Asymmetrical Layout: Stylized Tech Map + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Interactive Dark Map Visual Column */}
          <div className="lg:col-span-6 min-h-[460px] rounded-2xl bg-surface-container-lowest relative overflow-hidden flex flex-col justify-between p-space-md shadow-inner">
            {/* Map Canvas with Static Fallback / Blueprint Vectors */}
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('/assets/indore_radar_map.png'), url('https://lh3.googleusercontent.com/aida-public/AB6AXuACmujgxL07HssV9rUQLvkJunYE7bJ1iDuOguL-7ivgVSmrlGzuPNXMDGV-SAOr5U2FwcLbqgqU96gxucswftp4oubhB__hd9Sn3GqXyPUB6Zh5cpg-yjB7LaXnYWy_SpBUsFEmA3TWmtVUoQZFMh6P6kUoxC4jxDJmEIQ05kkkMcCig-8A5kyoPtK8HjsCZqaNZF9fwY2zBkepTK1ZwIo-1X3nVOG3VlpksG9VP3BBNVxV5kh1Ke2eFw')"
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/80 pointer-events-none"></div>

            {/* Overlaid Interactive Radar Nodes on Map Canvas */}
            <div className="absolute inset-0 pointer-events-auto">
              {/* Hub 1: Phoenix Citadel */}
              <div
                className="absolute top-[28%] left-[72%] group cursor-pointer"
                onClick={() => setSelectedHub('phoenix')}
              >
                <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary/30 animate-ping"></span>
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-on-primary font-bold shadow-[0_0_12px_#d8a64a]">
                  P
                </div>
                <div className="absolute left-6 -top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest/95 p-2 rounded-lg backdrop-blur-md shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  <span className="block text-xs font-semibold text-on-surface">Phoenix Citadel Hub</span>
                  <span className="block text-[10px] text-tertiary font-data-mono">🚗 45 Free · 🏍️ 72 Free</span>
                </div>
              </div>

              {/* Hub 2: Brilliant Convention */}
              <div
                className="absolute top-[38%] left-[46%] group cursor-pointer"
                onClick={() => setSelectedHub('brilliant')}
              >
                <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-tertiary/30 animate-ping"></span>
                <div className="w-4 h-4 rounded-full bg-tertiary flex items-center justify-center text-[10px] text-on-tertiary font-bold shadow-[0_0_12px_#44e2b1]">
                  B
                </div>
                <div className="absolute left-6 -top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest/95 p-2 rounded-lg backdrop-blur-md shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  <span className="block text-xs font-semibold text-on-surface">Brilliant Convention Centre</span>
                  <span className="block text-[10px] text-tertiary font-data-mono">🚗 28 Free · 🏍️ 110 Free (EV Ready)</span>
                </div>
              </div>

              {/* Hub 3: 56 Dukan */}
              <div
                className="absolute top-[56%] left-[40%] group cursor-pointer"
                onClick={() => setSelectedHub('56dukan')}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-primary-fixed-dim flex items-center justify-center text-[9px] text-on-primary font-bold shadow-[0_0_8px_#f3be5f]">
                  56
                </div>
                <div className="absolute left-6 -top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest/95 p-2 rounded-lg backdrop-blur-md shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  <span className="block text-xs font-semibold text-on-surface">56 Dukan Gourmet Square</span>
                  <span className="block text-[10px] text-on-surface-variant font-data-mono">🚗 12 Free · 🏍️ 85 Free</span>
                </div>
              </div>

              {/* Hub 4: Holkar Stadium */}
              <div
                className="absolute top-[52%] left-[26%] group cursor-pointer"
                onClick={() => setSelectedHub('holkar')}
              >
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-on-primary font-bold shadow-[0_0_12px_#d8a64a]">
                  H
                </div>
                <div className="absolute left-6 -top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest/95 p-2 rounded-lg backdrop-blur-md shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  <span className="block text-xs font-semibold text-on-surface">Holkar Cricket Ground</span>
                  <span className="block text-[10px] text-primary font-data-mono">Match Day Secured Pass Active</span>
                </div>
              </div>
            </div>

            {/* Floating Map HUD Controls */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-high/90 backdrop-blur-md text-xs">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-data-mono text-data-mono text-on-surface">
                  GPS SYNC INDORE (22.7196° N, 75.8577° E)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="px-2 py-1 rounded-lg bg-surface-container-high/90 text-on-surface hover:bg-surface-bright flex items-center gap-1 text-xs font-data-mono transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                  <span>Full Radar</span>
                </button>
              </div>
            </div>

            {/* Map Bottom Status Feed Indicator */}
            <div className="relative z-10 p-space-sm rounded-xl bg-surface-container-high/90 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">my_location</span>
                <span className="text-xs text-on-surface font-body-sm">Closest Available: Phoenix Citadel (~0.8km away)</span>
              </div>
              <span className="text-xs font-data-mono text-tertiary font-bold">EST. TIME 3 MIN</span>
            </div>
          </div>

          {/* Real-time Parking Hubs List */}
          <div className="lg:col-span-6 flex flex-col gap-space-sm">
            {/* Hub Card 1: Phoenix Citadel */}
            <div
              className={`hub-card p-space-md rounded-2xl glass-panel transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm cursor-pointer border ${
                selectedHub === 'phoenix'
                  ? 'border-primary ring-2 ring-primary/40 glass-panel-elevated'
                  : 'border-white/[0.08] hover:border-primary/40 hover:glass-panel-elevated'
              }`}
              onClick={() => setSelectedHub('phoenix')}
            >
              <div className="flex items-center gap-space-md">
                <img
                  src="/assets/hub_citadel.jpg"
                  alt="Phoenix Citadel Grand Deck covered parking facility on Bypass Road Indore"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-white/[0.08]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      Phoenix Citadel Mall
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill text-tertiary font-data-mono font-bold border border-tertiary/30">
                      0.8 KM
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Bypass Road, High-Volume Multi-Level Garage</p>
                  <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                    <span className="flex items-center gap-1">
                      <span className="text-primary font-bold">🚗 45</span> available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-tertiary font-bold">🏍️ 72</span> available
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">
                  ₹50<span className="text-xs text-on-surface-variant font-normal">/hr</span>
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    openReservationModal('Phoenix Citadel Mall', '₹50/hr', 'Bay C-09');
                  }}
                  className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm cursor-pointer"
                >
                  Reserve Spot
                </button>
              </div>
            </div>

            {/* Hub Card 2: Brilliant Convention */}
            <div
              className={`hub-card p-space-md rounded-2xl glass-panel transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm cursor-pointer border ${
                selectedHub === 'brilliant'
                  ? 'border-primary ring-2 ring-primary/40 glass-panel-elevated'
                  : 'border-white/[0.08] hover:border-primary/40 hover:glass-panel-elevated'
              }`}
              onClick={() => setSelectedHub('brilliant')}
            >
              <div className="flex items-center gap-space-md">
                <img
                  src="/assets/hub_brilliant.jpg"
                  alt="Brilliant Convention Centre premium subterranean parking garage in Vijay Nagar Indore"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-white/[0.08]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      Brilliant Convention Centre
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill text-tertiary font-data-mono font-bold border border-tertiary/30">
                      1.4 KM
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Scheme 78, Vijay Nagar • Fast EV Charging Hub</p>
                  <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                    <span className="flex items-center gap-1">
                      <span className="text-primary font-bold">🚗 28</span> available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-tertiary font-bold">🏍️ 110</span> available
                    </span>
                    <span className="text-tertiary flex items-center gap-0.5 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">bolt</span> EV Ready
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">
                  ₹40<span className="text-xs text-on-surface-variant font-normal">/hr</span>
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    openReservationModal('Brilliant Convention Centre', '₹40/hr', 'Bay E-04 (EV 350kW)');
                  }}
                  className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm cursor-pointer"
                >
                  Reserve Spot
                </button>
              </div>
            </div>

            {/* Hub Card 3: 56 Dukan */}
            <div
              className={`hub-card p-space-md rounded-2xl glass-panel transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm cursor-pointer border ${
                selectedHub === '56dukan'
                  ? 'border-primary ring-2 ring-primary/40 glass-panel-elevated'
                  : 'border-white/[0.08] hover:border-primary/40 hover:glass-panel-elevated'
              }`}
              onClick={() => setSelectedHub('56dukan')}
            >
              <div className="flex items-center gap-space-md">
                <img
                  src="/assets/hub_chappan.jpg"
                  alt="56 Dukan Culinary Multi-Deck parking facility in New Palasia Indore"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-white/[0.08]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      56 Dukan Culinary Hub
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill text-tertiary font-data-mono font-bold border border-tertiary/30">
                      2.1 KM
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">New Palasia, Automated Valet &amp; High-Density Bay</p>
                  <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                    <span className="flex items-center gap-1">
                      <span className="text-primary font-bold">🚗 12</span> available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-tertiary font-bold">🏍️ 85</span> available
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">
                  ₹35<span className="text-xs text-on-surface-variant font-normal">/hr</span>
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    openReservationModal('56 Dukan Culinary Hub', '₹35/hr', 'Bay D-18');
                  }}
                  className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm cursor-pointer"
                >
                  Reserve Spot
                </button>
              </div>
            </div>

            {/* Hub Card 4: Holkar Stadium */}
            <div
              className={`hub-card p-space-md rounded-2xl glass-panel transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm cursor-pointer border ${
                selectedHub === 'holkar'
                  ? 'border-primary ring-2 ring-primary/40 glass-panel-elevated'
                  : 'border-white/[0.08] hover:border-primary/40 hover:glass-panel-elevated'
              }`}
              onClick={() => setSelectedHub('holkar')}
            >
              <div className="flex items-center gap-space-md">
                <img
                  src="/assets/hub_holkar.jpg"
                  alt="Holkar Stadium VIP & General Ring parking grounds on Race Course Road Indore"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-white/[0.08]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      Holkar Cricket Stadium
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill text-primary font-data-mono font-bold border border-primary/30">
                      3.2 KM
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Race Course Road • VIP &amp; General Gate Corridors</p>
                  <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                    <span className="flex items-center gap-1">
                      <span className="text-primary font-bold">🚗 60</span> available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-tertiary font-bold">🏍️ 140</span> available
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">
                  ₹80<span className="text-xs text-on-surface-variant font-normal">/hr</span>
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    openReservationModal('Holkar Cricket Stadium', '₹80/hr', 'VIP Bay G-01');
                  }}
                  className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm cursor-pointer"
                >
                  Reserve Spot
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EVENT PARKING: "PARKING FOR EVERY EVENT" */}
      <section className="w-full px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
          <div>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high mb-space-xs">
              <span className="material-symbols-outlined text-[14px] text-primary">local_activity</span>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
                HIGH CAPACITY EVENT CORRIDORS
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
              PARKING FOR EVERY EVENT
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Never miss the opening note or match kickoff. Guaranteed reserved slots with private ingress gates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Demand Surge Protection Active
            </span>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Event 1 */}
          <div className="rounded-2xl glass-panel overflow-hidden flex flex-col justify-between hover:glass-panel-elevated transition-all group shadow-sm border border-white/[0.08]">
            <div className="relative w-full h-40 overflow-hidden bg-surface-container-high">
              <img
                src="/assets/event_concert.jpg"
                alt="Arijit Singh Live concert stadium crowd at Holkar Stadium Indore with illuminated stage beams"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={e => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
              <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full glass-pill text-primary font-label-caps text-[10px] uppercase font-bold border border-primary/30">
                Concert Surge
              </span>
            </div>

            <div className="p-space-md space-y-space-xs flex-1 flex flex-col justify-between">
              <div>
                <span className="font-data-mono text-[10px] text-tertiary block font-semibold">THIS SATURDAY</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">
                  Arijit Singh Live in Concert
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  Holkar Stadium, Indore
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-data-mono">
                  <span className="text-primary font-bold">🚗 120 slots left</span>
                  <span className="text-tertiary font-bold">🏍️ 350 slots</span>
                </div>
              </div>

              <div className="pt-space-sm">
                <button
                  type="button"
                  onClick={() => openReservationModal('Arijit Singh Live', '₹150 Flat Pass', 'Event Gate 4 Area')}
                  className="w-full py-2 rounded-xl bg-primary-container text-on-primary group-hover:bg-primary font-label-md text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                  <span>Reserve Event Bay</span>
                </button>
              </div>
            </div>
          </div>

          {/* Event 2 */}
          <div className="rounded-2xl glass-panel overflow-hidden flex flex-col justify-between hover:glass-panel-elevated transition-all group shadow-sm border border-white/[0.08]">
            <div className="relative w-full h-40 overflow-hidden bg-surface-container-high">
              <img
                src="/assets/event_tech.jpg"
                alt="Indore Tech and Startup Expo modern conference pavilion at Brilliant Convention Centre"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={e => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
              <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full glass-pill text-tertiary font-label-caps text-[10px] uppercase font-bold border border-tertiary/30">
                Conference
              </span>
            </div>

            <div className="p-space-md space-y-space-xs flex-1 flex flex-col justify-between">
              <div>
                <span className="font-data-mono text-[10px] text-tertiary block font-semibold">APR 4–6, 2026</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">
                  Indore Tech &amp; Startup Expo
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  Brilliant Convention Centre
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-data-mono">
                  <span className="text-primary font-bold">🚗 210 slots left</span>
                  <span className="text-tertiary font-bold">🏍️ 400 slots</span>
                </div>
              </div>

              <div className="pt-space-sm">
                <button
                  type="button"
                  onClick={() => openReservationModal('Indore Tech Expo 2026', '₹120 Flat Pass', 'BCC Hall 2 Valet Bay')}
                  className="w-full py-2 rounded-xl bg-primary-container text-on-primary group-hover:bg-primary font-label-md text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                  <span>Reserve Event Bay</span>
                </button>
              </div>
            </div>
          </div>

          {/* Event 3 */}
          <div className="rounded-2xl glass-panel overflow-hidden flex flex-col justify-between hover:glass-panel-elevated transition-all group shadow-sm border border-white/[0.08]">
            <div className="relative w-full h-40 overflow-hidden bg-surface-container-high">
              <img
                src="/assets/event_campus.jpg"
                alt="Euphoria NMIMS campus student festival evening lights along Super Corridor Indore"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={e => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
              <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full glass-pill text-on-surface-variant font-label-caps text-[10px] uppercase font-bold border border-white/20">
                Campus Fest
              </span>
            </div>

            <div className="p-space-md space-y-space-xs flex-1 flex flex-col justify-between">
              <div>
                <span className="font-data-mono text-[10px] text-tertiary block font-semibold">NEXT WEEKEND</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">
                  Euphoria NMIMS Campus Fest
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  NMIMS Campus, Super Corridor
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-data-mono">
                  <span className="text-primary font-bold">🚗 45 slots left</span>
                  <span className="text-tertiary font-bold">🏍️ 220 slots</span>
                </div>
              </div>

              <div className="pt-space-sm">
                <button
                  type="button"
                  onClick={() => openReservationModal('Euphoria NMIMS Fest', '₹60 Flat Pass', 'North Ground Quad')}
                  className="w-full py-2 rounded-xl bg-primary-container text-on-primary group-hover:bg-primary font-label-md text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                  <span>Reserve Event Bay</span>
                </button>
              </div>
            </div>
          </div>

          {/* Event 4 */}
          <div className="rounded-2xl glass-panel overflow-hidden flex flex-col justify-between hover:glass-panel-elevated transition-all group shadow-sm border border-white/[0.08]">
            <div className="relative w-full h-40 overflow-hidden bg-surface-container-high">
              <img
                src="/assets/event_stadium.jpg"
                alt="IPL Fan Park and sports arena floodlit match screening at Nehru Stadium Ground Indore"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={e => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
              <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full glass-pill text-primary font-label-caps text-[10px] uppercase font-bold border border-primary/30">
                IPL Screening
              </span>
            </div>

            <div className="p-space-md space-y-space-xs flex-1 flex flex-col justify-between">
              <div>
                <span className="font-data-mono text-[10px] text-tertiary block font-semibold">APR 12, 2026</span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">
                  IPL Fan Park &amp; Arena
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  Nehru Stadium Ground
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-data-mono">
                  <span className="text-primary font-bold">🚗 85 slots left</span>
                  <span className="text-tertiary font-bold">🏍️ 310 slots</span>
                </div>
              </div>

              <div className="pt-space-sm">
                <button
                  type="button"
                  onClick={() => openReservationModal('IPL Fan Park Arena', '₹100 Flat Pass', 'Nehru Ground Ring Bay')}
                  className="w-full py-2 rounded-xl bg-primary-container text-on-primary group-hover:bg-primary font-label-md text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                  <span>Reserve Event Bay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 3D PARKING VISUALIZATION (Futuristic Slot Allocator) */}
      <section className="w-full px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto">
        <div className="p-space-lg md:p-space-xl rounded-3xl bg-surface-container-lowest shadow-2xl overflow-hidden relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-space-lg gap-space-md">
            <div>
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container mb-space-xs">
                <span className="material-symbols-outlined text-[14px] text-tertiary">view_in_ar</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
                  SPATIAL DECK TELEMETRY
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
                3D SLOT ALLOCATOR: LEVEL 03
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Click any open bay cell to inspect hardware charging ratings, live clearance, and reserve on the fly.
              </p>
            </div>

            {/* Legend Bar */}
            <div className="flex items-center gap-space-md text-xs font-data-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-primary shadow-[0_0_8px_#f6c162]"></span>
                <span className="text-on-surface">Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-surface-container-high ring-1 ring-tertiary"></span>
                <span className="text-tertiary">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-surface-container-highest"></span>
                <span className="text-on-surface-variant">Occupied</span>
              </div>
            </div>
          </div>

          {/* Main Visual Deck Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            {/* Left Side: Architectural Isometric Backdrop + Clickable Slot Overlay */}
            <div className="lg:col-span-8 rounded-2xl bg-surface-container relative overflow-hidden min-h-[380px] p-space-md flex flex-col justify-between">
              <div className="absolute inset-0 z-0">
                <img
                  alt="Futuristic neon-lit multi-deck autonomous parking structure"
                  className="w-full h-full object-cover object-center opacity-45"
                  src="/assets/3d_deck.png"
                  onError={e => {
                    e.currentTarget.src =
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuA85dyP6gnQBRGImvUiiBHlIlPjgE1rxL9TnBcs7btCDyKyMGxt8EYOcALmphnf9wqKzlljJkaNfFPVku233oC0AvJHLslmKWFCbJ9QoOjhh7RZweSuFl0oFaxDf7xX3rpPVwOAYAMo6tqm2nlMx8aWpYrud9TNn5cVIyTeTZzMall_SE3_kIZZntcroqDvxtEhRB17Hx4AJeQb6GmNShh8D3c_rXTO5l_YXrGzjK_JokJ8qd2Y1gYp9Q';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent"></div>
              </div>

              {/* Spatial HUD Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-space-sm py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md text-xs font-data-mono text-tertiary font-bold">
                  BAY CAPACITY: 214/340 OCCUPIED
                </span>
                <span className="px-space-sm py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md text-xs font-data-mono text-on-surface">
                  CLEARANCE: 2.8M • LEVEL 03 DECK
                </span>
              </div>

              {/* Interactive Slot Grid Container */}
              <div className="relative z-10 my-auto py-space-md">
                {/* Car Bays Section */}
                <div className="mb-space-sm">
                  <span className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1 font-bold">
                    Row A — Premium Car &amp; EV Bays
                  </span>
                  <div className="grid grid-cols-8 gap-1.5" id="car-slots-grid">
                    {[
                      { slot: 'A-01', status: 'Available', type: 'Car', rate: '₹50', ev: 'Yes (350kW)', sensor: '891' },
                      { slot: 'A-02', status: 'Occupied', type: 'Car', rate: '₹50', ev: 'Standard', sensor: '892' },
                      { slot: 'A-03', status: 'Available', type: 'Car', rate: '₹50', ev: 'Standard', sensor: '893' },
                      { slot: 'A-04', status: 'Occupied', type: 'Car', rate: '₹50', ev: 'Standard', sensor: '894' },
                      { slot: 'A-05', status: 'Occupied', type: 'Car', rate: '₹50', ev: 'Standard', sensor: '895' },
                      { slot: 'A-06', status: 'Available', type: 'Car', rate: '₹60', ev: 'Ultra EV 150kW', sensor: '896' },
                      { slot: 'A-07', status: 'Occupied', type: 'Car', rate: '₹50', ev: 'Standard', sensor: '897' },
                      { slot: 'A-12', status: 'Available', type: 'Car', rate: '₹50', ev: 'Yes (Level 2 DC)', sensor: '904' }
                    ].map(bay => {
                      const isSelected = selectedSlot.slot === bay.slot;
                      const isOccupied = bay.status === 'Occupied';
                      return (
                        <button
                          key={bay.slot}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSlotClick(bay.slot, bay.type, bay.rate, bay.ev, bay.sensor, bay.status)}
                          className={`slot-node py-2 px-1 rounded text-xs font-data-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-on-primary font-bold shadow-[0_0_12px_#f6c162]'
                              : isOccupied
                              ? 'bg-surface-container-highest opacity-50 cursor-not-allowed text-on-surface-variant'
                              : 'bg-surface-container-high ring-1 ring-tertiary/60 hover:scale-105 text-on-surface'
                          }`}
                        >
                          {bay.slot.replace('-', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dedicated Bike Bays Section */}
                <div>
                  <span className="font-label-caps text-[10px] uppercase text-on-surface-variant block mb-1 font-bold">
                    Row B — High-Density Bike &amp; Two-Wheeler Bays
                  </span>
                  <div className="grid grid-cols-12 gap-1" id="bike-slots-grid">
                    {[
                      { slot: 'B-01', status: 'Available', ev: 'No' },
                      { slot: 'B-02', status: 'Available', ev: 'No' },
                      { slot: 'B-03', status: 'Occupied', ev: 'No' },
                      { slot: 'B-04', status: 'Occupied', ev: 'No' },
                      { slot: 'B-05', status: 'Available', ev: 'No' },
                      { slot: 'B-06', status: 'Available', ev: 'No' },
                      { slot: 'B-07', status: 'Occupied', ev: 'No' },
                      { slot: 'B-08', status: 'Available', ev: 'No' },
                      { slot: 'B-09', status: 'Available', ev: 'No' },
                      { slot: 'B-10', status: 'Occupied', ev: 'No' },
                      { slot: 'B-11', status: 'Occupied', ev: 'No' },
                      { slot: 'B-12', status: 'Available', ev: 'Yes' }
                    ].map(b => {
                      const isSelected = selectedSlot.slot === b.slot;
                      const isOccupied = b.status === 'Occupied';
                      return (
                        <button
                          key={b.slot}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSlotClick(b.slot, 'Bike', '₹20', b.ev, '710', b.status)}
                          className={`slot-node py-1.5 px-0.5 rounded text-[10px] font-data-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-on-primary font-bold shadow-[0_0_12px_#f6c162]'
                              : isOccupied
                              ? 'bg-surface-container-highest opacity-50 cursor-not-allowed text-on-surface-variant'
                              : 'bg-surface-container-high ring-1 ring-tertiary/60 hover:scale-105 text-on-surface'
                          }`}
                        >
                          {b.slot.replace('B-0', 'B').replace('B-', 'B')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Swipe or click any cell to update telemetry</span>
                <span className="font-data-mono text-primary font-bold">ENCRYPTED RFID ENTRY LINK</span>
              </div>
            </div>

            {/* Right Side: Live Inspector Panel */}
            <div className="lg:col-span-4 p-space-lg rounded-2xl bg-surface-container-high shadow-xl flex flex-col justify-between space-y-space-md">
              <div className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-caps text-[10px] uppercase tracking-wider font-bold">
                    SELECTED BAY
                  </span>
                  <span className="font-data-mono text-xs text-tertiary flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> ACTIVE RADAR
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface" id="inspector-slot-id">
                  Bay {selectedSlot.slot} (Sensor #{selectedSlot.sensor})
                </h3>
                <div className="p-space-sm rounded-xl bg-surface-container text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Bay Type</span>
                    <span className="font-semibold text-on-surface" id="inspector-slot-type">
                      {selectedSlot.type === 'Car' ? `🚗 Wide Car + Level 2 DC EV` : `🏍️ Dedicated 2-Wheeler Lock`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Clearance</span>
                    <span className="text-on-surface font-data-mono">2.80 Meters (SUV OK)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Hourly Tariff</span>
                    <span className="font-bold text-primary" id="inspector-slot-rate">
                      {selectedSlot.rate} / hr (Max ₹350/day)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Host Facility</span>
                    <span className="text-on-surface font-data-mono">Nexus Mall Indore Core</span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-1.5 pt-1 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-tertiary font-bold">check</span>
                    <span>Immediate automated barrier sync with QR pass</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-tertiary font-bold">check</span>
                    <span>Covered weather-sealed subterranean basement</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-tertiary font-bold">check</span>
                    <span>Includes ₹5,00,000 accidental damage shield</span>
                  </div>
                </div>
              </div>

              <button
                id="inspector-reserve-btn"
                type="button"
                onClick={() => openReservationModal('Nexus Mall Indore', `${selectedSlot.rate}/hr`, `Bay ${selectedSlot.slot}`)}
                className="w-full py-space-sm rounded-xl bg-primary-container text-on-primary font-headline-sm text-body-md font-semibold hover:bg-primary shadow-[0_0_20px_rgba(216,166,74,0.3)] transition-all flex items-center justify-center gap-space-xs cursor-pointer"
              >
                <span>Reserve Spot {selectedSlot.slot}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS (Precision 4-Step Flow) */}
      <section className="w-full px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-space-xl">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high mb-space-xs">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">EFFORTLESS JOURNEY</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
            HOW SPACE2PARK WORKS
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            From destination query to private barrier clearance in under four calibrated steps.
          </p>
        </div>

        {/* 4 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md relative">
          {/* Step 01 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between space-y-space-md shadow-sm">
            <div>
              <span className="font-headline-lg text-display text-primary/30 font-bold block mb-space-xs">01</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block mb-1">SEARCH</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Enter your destination or event venue. Filter instantaneously by Car, Bike, or DC EV fast charging.
              </p>
            </div>
            <div className="pt-space-sm flex items-center gap-1 text-xs text-on-surface-variant font-data-mono">
              <span className="material-symbols-outlined text-[16px] text-primary">search</span>
              <span>Hyperlocal Radar</span>
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between space-y-space-md shadow-sm">
            <div>
              <span className="font-headline-lg text-display text-primary/30 font-bold block mb-space-xs">02</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block mb-1">CHOOSE</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Compare walking distance, upfront transparent tariffs, user ratings, and certified security protocols.
              </p>
            </div>
            <div className="pt-space-sm flex items-center gap-1 text-xs text-on-surface-variant font-data-mono">
              <span className="material-symbols-outlined text-[16px] text-tertiary">tune</span>
              <span>Clearance Filters</span>
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between space-y-space-md shadow-sm">
            <div>
              <span className="font-headline-lg text-display text-primary/30 font-bold block mb-space-xs">03</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block mb-1">RESERVE</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Lock your bay with instant UPI, Apple Pay, or credit card escrow. Receive a frictionless digital QR pass.
              </p>
            </div>
            <div className="pt-space-sm flex items-center gap-1 text-xs text-on-surface-variant font-data-mono">
              <span className="material-symbols-outlined text-[16px] text-primary">qr_code_2</span>
              <span>Instant Pass</span>
            </div>
          </div>

          {/* Step 04 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low flex flex-col justify-between space-y-space-md shadow-sm">
            <div>
              <span className="font-headline-lg text-display text-primary/30 font-bold block mb-space-xs">04</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block mb-1">PARK &amp; ARRIVE</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Automated ANPR camera scans your vehicle or present QR at barrier. Glide directly into your slot.
              </p>
            </div>
            <div className="pt-space-sm flex items-center gap-1 text-xs text-on-surface-variant font-data-mono">
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
              <span>Guaranteed Space</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. "LIST YOUR SPACE" (Monetization & Host Supply Section) */}
      <section className="w-full px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto" id="list-space">
        <div className="rounded-3xl bg-surface-container-high p-space-lg md:p-space-xl relative overflow-hidden shadow-2xl">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center relative z-10">
            <div className="lg:col-span-7 space-y-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container">
                <span className="material-symbols-outlined text-[14px] text-primary">payments</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
                  HOST MONETIZATION PLATFORM
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-on-surface tracking-tight uppercase">
                YOUR UNUSED SPACE<br />
                <span className="text-primary">CAN EARN.</span>
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Turn your residential driveway, commercial tower basement, or empty plot along AB Road or Bypass into recurring monthly income. Space2Park automates smart barrier access, guest verification, instant UPI payouts, and ₹5,00,000 property protection.
              </p>

              {/* Host Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                <div className="p-space-sm rounded-xl bg-surface-container text-center">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary block">₹28,500</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Avg. Indore Monthly Host Net
                  </span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container text-center">
                  <span className="font-headline-sm text-headline-sm font-bold text-tertiary block">₹0</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Zero Hardware Setup Cost
                  </span>
                </div>
                <div className="p-space-sm rounded-xl bg-surface-container text-center">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">100%</span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Automated Digital Barrier
                  </span>
                </div>
              </div>

              <div className="pt-space-sm flex flex-wrap items-center gap-space-md">
                <button
                  type="button"
                  onClick={() => setHostModalOpen(true)}
                  className="px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm text-label-md font-semibold hover:bg-primary shadow-[0_0_24px_rgba(216,166,74,0.3)] transition-all cursor-pointer"
                >
                  LIST YOUR SPACE NOW →
                </button>
                <span className="text-xs text-on-surface-variant font-data-mono">Takes only 3 minutes to activate</span>
              </div>
            </div>

            {/* Host Visual Calculator Widget */}
            <div className="lg:col-span-5 p-space-lg rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl space-y-space-md">
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider block font-bold">
                POTENTIAL EARNINGS ESTIMATOR
              </span>
              <div className="space-y-space-sm">
                <div>
                  <div className="flex justify-between text-xs text-on-surface mb-1">
                    <span>Number of Car Bays</span>
                    <span className="font-bold text-primary" id="calc-car-val">
                      {calcCars} Bay{calcCars > 1 ? 's' : ''}
                    </span>
                  </div>
                  <input
                    className="w-full accent-primary cursor-pointer"
                    id="calc-car-range"
                    max="10"
                    min="1"
                    type="range"
                    value={calcCars}
                    onChange={e => setCalcCars(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-on-surface mb-1">
                    <span>Number of Bike Bays</span>
                    <span className="font-bold text-tertiary" id="calc-bike-val">
                      {calcBikes} Bay{calcBikes > 1 ? 's' : ''}
                    </span>
                  </div>
                  <input
                    className="w-full accent-tertiary cursor-pointer"
                    id="calc-bike-range"
                    max="30"
                    min="0"
                    type="range"
                    value={calcBikes}
                    onChange={e => setCalcBikes(parseInt(e.target.value))}
                  />
                </div>
                <div className="pt-space-sm p-space-sm rounded-xl bg-surface-container flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-label-caps text-on-surface-variant block">
                      Estimated Payout
                    </span>
                    <span className="font-headline-md text-headline-md font-bold text-primary" id="calc-total-earnings">
                      ₹{monthlyEarnings.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">/ month</span>
                  </div>
                  <span className="material-symbols-outlined text-[32px] text-tertiary">account_balance_wallet</span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                *Based on standard 8-hour occupancy at Vijay Nagar / Palasia median rates. Payouts credited weekly to your bank account via automated IMPS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TRUST & SECURITY PROTOCOLS */}
      <section className="w-full px-margin-mobile md:px-margin py-space-lg max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-md p-space-md rounded-2xl bg-surface-container-low shadow-sm">
          <div className="flex items-center gap-space-sm p-space-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            <div>
              <span className="block text-xs font-semibold text-on-surface">100% Audited</span>
              <span className="block text-[10px] text-on-surface-variant">Physical verification</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm p-space-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">lock_reset</span>
            <div>
              <span className="block text-xs font-semibold text-on-surface">Zero Surge</span>
              <span className="block text-[10px] text-on-surface-variant">Locked upfront rates</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm p-space-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">qr_code_scanner</span>
            <div>
              <span className="block text-xs font-semibold text-on-surface">Digital Barrier</span>
              <span className="block text-[10px] text-on-surface-variant">Contactless QR Pass</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm p-space-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">ev_charger</span>
            <div>
              <span className="block text-xs font-semibold text-on-surface">EV Support</span>
              <span className="block text-[10px] text-on-surface-variant">On-site charging help</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm p-space-xs col-span-2 sm:col-span-1">
            <span className="material-symbols-outlined text-tertiary text-[24px]">support_agent</span>
            <div>
              <span className="block text-xs font-semibold text-on-surface">24/7 On-Ground</span>
              <span className="block text-[10px] text-on-surface-variant">Indore field response</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CONVERSION BANNER */}
      <section className="w-full px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto mb-space-xl">
        <div className="rounded-3xl bg-surface-container-lowest p-space-lg md:p-space-xl text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute -bottom-24 w-96 h-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-space-xs font-bold">
            NO DELAYS. NO PARKING HEADACHES.
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface tracking-tight uppercase mb-space-sm max-w-3xl">
            NEVER CIRCLE FOR PARKING AGAIN.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-lg">
            Join over 18,000+ drivers and riders in Indore enjoying seamless reserved arrivals at work, events, and shopping hubs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-md">
            <a
              className="px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm text-label-md font-semibold hover:bg-primary shadow-[0_0_24px_rgba(216,166,74,0.3)] transition-all cursor-pointer"
              href="#search-section"
            >
              Find Parking Now
            </a>
            <Link
              to="/events"
              className="px-space-lg py-space-sm rounded-full bg-surface-container-high text-on-surface font-headline-sm text-label-md hover:bg-surface-bright transition-all cursor-pointer"
            >
              Explore Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE RESERVATION MODAL (Vanilla JS/React Controlled) */}
      {reservationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xl p-margin-mobile animate-fadeIn">
          <div className="w-full max-w-md p-space-lg rounded-3xl glass-panel-elevated shadow-2xl space-y-space-md border border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold tracking-wider">
                  INSTANT RESERVATION PASS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReservationModal(prev => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full glass-pill text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface" id="modal-venue-name">
                {reservationModal.venue}
              </h4>
              <p className="font-data-mono text-xs text-primary font-bold" id="modal-bay-code">
                Allocated Bay: {reservationModal.bay}
              </p>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container-low text-xs space-y-2 font-data-mono">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Arrival Schedule:</span>
                <span className="text-on-surface font-semibold">Today, Immediate Entry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Allocated Tariff:</span>
                <span className="text-primary font-bold" id="modal-rate">
                  {reservationModal.rate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ANPR Barrier Pass:</span>
                <span className="text-tertiary font-bold">Digital QR Ready</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-space-xs">
              <span className="font-label-caps text-[10px] uppercase text-on-surface-variant font-bold">
                Select Payment
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  className="p-2.5 rounded-lg bg-surface-container-high text-on-surface font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-primary/40 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
                  UPI / GPay
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                  Credit Card
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmBooking}
              className="w-full py-space-sm rounded-xl bg-primary-container text-on-primary font-headline-sm text-body-md font-semibold hover:bg-primary shadow-[0_0_20px_rgba(216,166,74,0.3)] transition-all flex items-center justify-center gap-space-xs cursor-pointer"
            >
              {bookingConfirmed ? (
                <>
                  <span className="material-symbols-outlined text-[18px] text-on-primary animate-spin">autorenew</span>
                  <span>Syncing Pass to Radar...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Confirm &amp; Generate QR Pass</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE HOST REGISTRATION MODAL */}
      {hostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xl p-margin-mobile animate-fadeIn">
          <div className="w-full max-w-md p-space-lg rounded-3xl glass-panel-elevated shadow-2xl space-y-space-md border border-tertiary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">garage</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold tracking-wider">
                  ONBOARD YOUR SPACE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHostModalOpen(false)}
                className="w-8 h-8 rounded-full glass-pill text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleHostSubmit} className="space-y-space-sm text-xs">
              <div className="space-y-space-xs">
                <label className="block text-on-surface font-semibold">Location Address in Indore</label>
                <input
                  required
                  defaultValue="Near Vijay Nagar Square, Scheme 54, Indore"
                  className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40"
                  placeholder="e.g. Near Vijay Nagar Square, Scheme 54"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-xs">
                <div>
                  <label className="block text-on-surface font-semibold mb-1">Car Spaces</label>
                  <input
                    className="w-full p-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40"
                    min="1"
                    type="number"
                    defaultValue="2"
                  />
                </div>
                <div>
                  <label className="block text-on-surface font-semibold mb-1">Bike Spaces</label>
                  <input
                    className="w-full p-2 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40"
                    min="0"
                    type="number"
                    defaultValue="5"
                  />
                </div>
              </div>

              <div className="space-y-space-xs">
                <label className="block text-on-surface font-semibold">Mobile Number (for UPI Payouts)</label>
                <input
                  required
                  defaultValue="+91 98260 12345"
                  className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40"
                  placeholder="+91 98XXX XXXXX"
                  type="tel"
                />
              </div>

              <button
                type="submit"
                disabled={hostFormSubmitted}
                className="w-full py-space-sm rounded-xl bg-primary-container text-on-primary font-headline-sm text-body-md font-semibold hover:bg-primary shadow-[0_0_20px_rgba(216,166,74,0.3)] transition-all cursor-pointer"
              >
                {hostFormSubmitted ? 'Registering with Indore Municipal Survey...' : 'Submit for Free Inspection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
