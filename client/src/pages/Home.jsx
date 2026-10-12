import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IndoreMapCanvas from '../components/IndoreMapCanvas';
import { useAuth } from '../context/AuthContext';

export default function Home({ vehicleMode, setVehicleMode }) {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [selectedDestination, setSelectedDestination] = useState('citadel');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  const handleSearchSubmit = () => {
    navigate(`/explore?hub=${selectedDestination}`);
  };

  return (
    <div className="flex flex-col w-full text-on-surface">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest">
        {/* Cinematic Visual Background with Ambient Scrims */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury automobile parked in hyper-luxurious ambient illuminated parking facility"
            className="w-full h-full object-cover object-center opacity-40 transform scale-105 motion-safe:transition-transform duration-1000"
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

          {/* Hero Main Copy & Floating HUD Sensor Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-end my-auto">
            <div className="lg:col-span-8 flex flex-col">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-tight text-on-surface font-headline-lg uppercase mb-space-md">
                PARK SMART.<br />
                <span className="text-primary selection:text-surface">LIVE EVENTS BETTER.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-xl leading-relaxed">
                Find and reserve guaranteed parking for cars and two-wheelers with calibrated sensor precision — wherever Indore takes you.
              </p>

              {/* Primary / Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-space-md">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-space-sm px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary font-headline-sm text-label-md font-semibold hover:bg-primary shadow-[0_0_24px_rgba(216,166,74,0.3)] transition-all"
                >
                  <span>Find Parking</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link
                  to="/owner/spaces/new"
                  className="inline-flex items-center gap-space-sm px-space-lg py-space-sm rounded-full bg-surface-container-high text-on-surface font-headline-sm text-label-md hover:bg-surface-bright shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">garage_home</span>
                  <span>List Your Space</span>
                </Link>
              </div>
            </div>

            {/* Cockpit HUD Floating Sensor Card */}
            <div className="lg:col-span-4 flex flex-col gap-space-sm">
              <div className="p-space-lg rounded-xl bg-surface-container-high/90 backdrop-blur-2xl shadow-xl flex flex-col gap-space-md relative overflow-hidden border border-outline-variant/40">
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

                {/* Telemetry Strip */}
                <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
                  <div className="p-space-xs rounded bg-surface-container text-center">
                    <span className="block font-data-mono text-data-mono text-xs text-primary font-bold">28 SPOTS</span>
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
                  <span className="font-data-mono text-data-mono text-primary">99.8% Match</span>
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
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">315+</span>
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
        <div className="w-full bg-surface-container-high/95 backdrop-blur-2xl rounded-2xl p-space-md md:p-space-lg shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-outline-variant/40">
          
          {/* Vehicle Mode Segmented Switch */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md pb-space-sm bg-surface-container-lowest/40 p-1.5 rounded-xl">
            <div className="inline-flex p-1 rounded-lg bg-surface-container-low gap-1">
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('car')}
                className={`inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-md text-label-md font-label-md transition-all ${
                  vehicleMode === 'car' ? 'bg-primary-container text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">directions_car</span>
                <span>Car Parking</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('bike')}
                className={`inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-md text-label-md font-label-md transition-all ${
                  vehicleMode === 'bike' ? 'bg-primary-container text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
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
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus-within:ring-1 focus-within:ring-primary/40 transition-all">
              <div className="flex items-center gap-space-xs text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">search</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">Destination Hub</span>
              </div>
              <select
                id="destination-select"
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
                className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none cursor-pointer"
              >
                <option value="citadel" className="bg-surface-container text-on-surface">Phoenix Citadel Mall, Bypass Rd</option>
                <option value="brilliant" className="bg-surface-container text-on-surface">Brilliant Convention Centre, Vijay Nagar</option>
                <option value="dukan" className="bg-surface-container text-on-surface">56 Dukan Culinary Zone, Palasia</option>
                <option value="holkar" className="bg-surface-container text-on-surface">Holkar Cricket Stadium, Race Course</option>
              </select>
            </div>

            {/* Bay Class */}
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus-within:ring-1 focus-within:ring-primary/40 transition-all">
              <div className="flex items-center gap-space-xs text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">Bay Class</span>
              </div>
              <select className="bg-transparent text-on-surface font-body-md text-body-md focus:outline-none cursor-pointer">
                <option className="bg-surface-container text-on-surface">Standard Sedan / Hatchback</option>
                <option className="bg-surface-container text-on-surface">Large SUV / Premium 4x4</option>
                <option className="bg-surface-container text-on-surface">EV Fast Charging Dock (CCS2)</option>
                <option className="bg-surface-container text-on-surface">Premium Superbike Bay</option>
              </select>
            </div>

            {/* Duration */}
            <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus-within:ring-1 focus-within:ring-primary/40 transition-all">
              <div className="flex items-center gap-space-xs text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">Arrival & Duration</span>
              </div>
              <div className="flex items-center justify-between text-on-surface font-body-md text-body-md">
                <span>Today, Immediate</span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-data-mono">2 Hours</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="h-full min-h-[52px] rounded-xl bg-primary-container text-on-primary font-headline-sm text-body-md font-semibold flex items-center justify-center gap-space-xs hover:bg-primary shadow-[0_0_20px_rgba(216,166,74,0.25)] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">radar</span>
              <span>SEARCH SPACES</span>
            </button>
          </div>

          {/* Filter Subline quick tags */}
          <div className="flex flex-wrap items-center gap-2 mt-space-sm pt-space-xs text-xs text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase text-secondary">Instant Filters:</span>
            <button type="button" onClick={() => navigate('/explore?ev=true')} className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface-variant transition-colors">
              ⚡ EV Fast Charge
            </button>
            <button type="button" onClick={() => navigate('/explore')} className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface-variant transition-colors">
              🛡️ Covered Basement
            </button>
            <button type="button" onClick={() => navigate('/explore')} className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface-variant transition-colors">
              📹 24/7 CCTV Guard
            </button>
            <button type="button" onClick={() => navigate('/explore')} className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface-variant transition-colors">
              ♿ Accessible Space
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all flex flex-col justify-between group shadow-sm">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all">
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
          <div className="p-space-lg rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all flex flex-col justify-between group shadow-sm">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all">
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
          <div className="p-space-lg rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all flex flex-col justify-between group shadow-sm">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-[26px]">stadium</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">Event Lock Pass</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Pre-book secured bays for stadium matches, fests, and cultural expos with expedited departure corridors.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-data-mono">
              <span>PRIORITY PASS</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 transition-all flex flex-col justify-between group shadow-sm">
            <div className="space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-[26px]">verified</span>
              </div>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block">10% Reserve Pool</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Hidden reserve capacity ensures instant zero-friction re-assignment if an owner cancels or slot is occupied.
              </p>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-xs text-on-surface-variant font-data-mono">
              <span>FAILSAFE RE-ROUTE</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE PARKING RADAR & MAP */}
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
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => setSelectedDestination('citadel')} className={`px-space-sm py-1 rounded-full font-label-md text-xs transition-all ${selectedDestination === 'citadel' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>Bypass Road</button>
            <button type="button" onClick={() => setSelectedDestination('brilliant')} className={`px-space-sm py-1 rounded-full font-label-md text-xs transition-all ${selectedDestination === 'brilliant' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>Vijay Nagar</button>
            <button type="button" onClick={() => setSelectedDestination('dukan')} className={`px-space-sm py-1 rounded-full font-label-md text-xs transition-all ${selectedDestination === 'dukan' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>Palasia</button>
            <button type="button" onClick={() => setSelectedDestination('holkar')} className={`px-space-sm py-1 rounded-full font-label-md text-xs transition-all ${selectedDestination === 'holkar' ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>Race Course</button>
          </div>
        </div>

        {/* Split Asymmetrical Layout: Stylized Tech Map + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Map Column */}
          <div className="lg:col-span-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden shadow-inner min-h-[460px]">
            <IndoreMapCanvas selectedHub={selectedDestination} onSelectHub={hub => setSelectedDestination(hub)} />
          </div>

          {/* Real-Time Parking Hubs List */}
          <div className="lg:col-span-6 flex flex-col gap-space-sm">
            
            {/* Hub 1: Phoenix Citadel */}
            <div className={`p-space-md rounded-xl bg-surface-container-low border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm ${selectedDestination === 'citadel' ? 'border-primary shadow-[0_0_20px_rgba(216,166,74,0.2)]' : 'border-outline-variant/30'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Phoenix Citadel Grand Deck</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-data-mono">0.8 KM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Bypass Road, High-Volume Multi-Level Garage</p>
                <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                  <span className="flex items-center gap-1"><span className="text-primary font-bold">🚗 45</span> available</span>
                  <span className="flex items-center gap-1"><span className="text-tertiary font-bold">🏍️ 72</span> available</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">₹50<span className="text-xs text-on-surface-variant font-normal">/hr</span></span>
                <Link to="/explore?hub=citadel" className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm">
                  Reserve Spot
                </Link>
              </div>
            </div>

            {/* Hub 2: Brilliant Convention Centre */}
            <div className={`p-space-md rounded-xl bg-surface-container-low border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm ${selectedDestination === 'brilliant' ? 'border-primary shadow-[0_0_20px_rgba(216,166,74,0.2)]' : 'border-outline-variant/30'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Brilliant Convention Centre</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-data-mono">1.4 KM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Scheme 78, Vijay Nagar • Fast EV Charging Hub</p>
                <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                  <span className="flex items-center gap-1"><span className="text-primary font-bold">🚗 28</span> available</span>
                  <span className="flex items-center gap-1"><span className="text-tertiary font-bold">🏍️ 110</span> available</span>
                  <span className="text-tertiary flex items-center gap-0.5 text-[11px]"><span className="material-symbols-outlined text-[13px]">bolt</span> EV Ready</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">₹40<span className="text-xs text-on-surface-variant font-normal">/hr</span></span>
                <Link to="/explore?hub=brilliant" className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm">
                  Reserve Spot
                </Link>
              </div>
            </div>

            {/* Hub 3: 56 Dukan */}
            <div className={`p-space-md rounded-xl bg-surface-container-low border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm ${selectedDestination === 'dukan' ? 'border-primary shadow-[0_0_20px_rgba(216,166,74,0.2)]' : 'border-outline-variant/30'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">56 Dukan Culinary Hub</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-data-mono">2.1 KM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">New Palasia, Automated Valet & High-Density Bay</p>
                <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                  <span className="flex items-center gap-1"><span className="text-primary font-bold">🚗 12</span> available</span>
                  <span className="flex items-center gap-1"><span className="text-tertiary font-bold">🏍️ 85</span> available</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">₹35<span className="text-xs text-on-surface-variant font-normal">/hr</span></span>
                <Link to="/explore?hub=dukan" className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm">
                  Reserve Spot
                </Link>
              </div>
            </div>

            {/* Hub 4: Holkar Stadium */}
            <div className={`p-space-md rounded-xl bg-surface-container-low border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm ${selectedDestination === 'holkar' ? 'border-primary shadow-[0_0_20px_rgba(216,166,74,0.2)]' : 'border-outline-variant/30'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Holkar Cricket Stadium</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-data-mono">3.2 KM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Race Course Road • VIP & General Gate Corridors</p>
                <div className="flex items-center gap-space-md pt-1 text-xs font-data-mono text-on-surface">
                  <span className="flex items-center gap-1"><span className="text-primary font-bold">🚗 60</span> available</span>
                  <span className="flex items-center gap-1"><span className="text-tertiary font-bold">🏍️ 140</span> available</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-space-xs shrink-0">
                <span className="font-headline-md text-headline-md font-bold text-primary">₹80<span className="text-xs text-on-surface-variant font-normal">/hr</span></span>
                <Link to="/explore?hub=holkar" className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-fixed-dim transition-all shadow-sm">
                  Reserve Spot
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. HIGH CAPACITY EVENT CORRIDORS */}
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
              Never miss kickoff or the opening beat. Pre-allocated private supply activated before congestion forms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-label-caps text-tertiary uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              Demand Surge Protection Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {events.slice(0, 4).map(event => (
            <div key={event.id} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden flex flex-col justify-between hover:bg-surface-container transition-all group shadow-sm">
              <div className="p-space-lg space-y-space-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-caps text-[10px] uppercase">
                    {event.category}
                  </span>
                  <span className="font-data-mono text-xs text-on-surface-variant">UPCOMING</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block group-hover:text-primary transition-colors">
                  {event.name}
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-outline">location_on</span>
                  {event.location.address.split(',')[0]}
                </p>
                <div className="pt-space-xs font-data-mono text-xs text-secondary-fixed-dim">
                  <span>Crowd: ~{event.expectedAttendance.toLocaleString()} attendees</span>
                </div>
                <div className="pt-space-xs flex items-center justify-between text-xs font-data-mono">
                  <span className="text-primary">Deficit: {event.demandEstimate?.predictedDemand} slots</span>
                  <span className="text-tertiary">Readiness: {event.nearbyStats?.supplyCoveragePct}%</span>
                </div>
              </div>
              <div className="p-space-md bg-surface-container-lowest/50 border-t border-outline-variant/30">
                <Link
                  to={`/explore?venueId=${event.id}`}
                  className="w-full py-2 rounded-lg bg-surface-container-high text-on-surface group-hover:bg-primary-container group-hover:text-on-primary font-label-md text-xs font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <span>View Ranked Bays</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
