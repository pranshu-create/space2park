import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ThreeCanvas from '../components/ThreeCanvas';
import IndoreMapCanvas from '../components/IndoreMapCanvas';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function Explore({ vehicleMode = 'car', setVehicleMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialHub = queryParams.get('hub') || 'citadel';

  const [selectedHub, setSelectedHub] = useState(initialHub);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortOption, setSortOption] = useState('distance');
  const [selectedModalSpace, setSelectedModalSpace] = useState(null);
  const [selectedBayCode, setSelectedBayCode] = useState('A-12');
  const [lockCountdown, setLockCountdown] = useState(null);
  const [lockingSlot, setLockingSlot] = useState(false);
  const [lockError, setLockError] = useState('');

  // Fetch spaces from backend
  useEffect(() => {
    fetch('/api/spaces')
      .then(res => res.json())
      .then(data => {
        setSpaces(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load spaces:', err);
        setLoading(false);
      });
  }, []);

  // Listen to live socket events for real-time slot state changes
  useEffect(() => {
    if (!socket) return;

    const handleSlotLocked = data => {
      setSpaces(prev =>
        prev.map(s => {
          if (s.id === data.spaceId) {
            return { ...s, availableSlots: Math.max(0, s.availableSlots - 1) };
          }
          return s;
        })
      );
    };

    const handleSlotReleased = data => {
      setSpaces(prev =>
        prev.map(s => {
          if (s.id === data.spaceId) {
            return { ...s, availableSlots: s.availableSlots + 1 };
          }
          return s;
        })
      );
    };

    const handleOccupancyUpdate = data => {
      setSpaces(prev =>
        prev.map(s => {
          if (s.id === data.spaceId) {
            return {
              ...s,
              occupiedSlots: data.occupiedSlots,
              availableSlots: data.availableSlots
            };
          }
          return s;
        })
      );
    };

    socket.on('slot:locked', handleSlotLocked);
    socket.on('slot:released', handleSlotReleased);
    socket.on('occupancy:update', handleOccupancyUpdate);

    return () => {
      socket.off('slot:locked', handleSlotLocked);
      socket.off('slot:released', handleSlotReleased);
      socket.off('occupancy:update', handleOccupancyUpdate);
    };
  }, [socket]);

  // Lock countdown timer if active
  useEffect(() => {
    if (!lockCountdown) return;
    const interval = setInterval(() => {
      setLockCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setLockError('Lock expired. Slot returned to public pool.');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockCountdown]);

  // Filter & sort logic
  const filteredSpaces = spaces.filter(space => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        space.name.toLowerCase().includes(q) ||
        space.address.toLowerCase().includes(q) ||
        space.venueName?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterTag === 'ev' && !space.facilities?.includes('EV Charging (60kW CCS2)')) return false;
    if (filterTag === 'cctv' && !space.facilities?.includes('24/7 Security CCTV')) return false;
    if (filterTag === 'covered' && space.spaceType !== 'basement_garage') return false;
    if (filterTag === 'valet' && !space.facilities?.includes('Valet Ingress Option')) return false;
    return true;
  });

  const sortedSpaces = [...filteredSpaces].sort((a, b) => {
    if (sortOption === 'price') return a.pricePerHour - b.pricePerHour;
    if (sortOption === 'capacity') return b.availableSlots - a.availableSlots;
    return (a.walkingDistanceMeters || 400) - (b.walkingDistanceMeters || 400);
  });

  // Handle slot lock & booking progression
  const handleLockSlotAndProceed = async space => {
    setLockingSlot(true);
    setLockError('');
    try {
      const res = await fetch(`/api/spaces/${space.id}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({
          slotCode: selectedBayCode,
          durationHours: 2,
          vehicleMode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to lock slot');

      // Navigate to checkout with lock token
      navigate(`/book/${space.id}`, {
        state: {
          space,
          lockData: data,
          slotCode: selectedBayCode,
          vehicleMode
        }
      });
    } catch (err) {
      setLockError(err.message);
    } finally {
      setLockingSlot(false);
    }
  };

  return (
    <div className="w-full pt-20 bg-surface min-h-screen text-on-surface">
      {/* 1. TOP TELEMETRY & CONTROL RIBBON */}
      <section className="w-full bg-surface-container-lowest px-margin-mobile md:px-margin py-space-sm shadow-xl border-b border-outline-variant/30 sticky top-16 md:top-20 z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          {/* Segmented Mode & Search Input */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-space-sm flex-1">
            {/* Vehicle Mode Toggle */}
            <div className="flex items-center p-1 rounded-full bg-surface-container-low border border-outline-variant/40">
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('car')}
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-caps text-label-caps transition-all ${
                  vehicleMode === 'car'
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                <span>Car / SUV</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('bike')}
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-caps text-label-caps transition-all ${
                  vehicleMode === 'bike'
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                <span>Bike / Moto</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1 min-w-[280px]">
              <div className="flex items-center px-space-md py-2 rounded-full bg-surface-container-low focus-within:ring-1 focus-within:ring-primary border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[20px] mr-2">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search address, corridor or venue (e.g. Citadel, Holkar, Vijay Nagar)..."
                  className="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-on-surface-variant"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-on-surface px-1">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Time & Duration Pill */}
            <div className="hidden sm:flex items-center gap-2 px-space-md py-2 rounded-full bg-surface-container-low text-on-surface border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary-container text-[18px]">schedule</span>
              <div className="flex flex-col">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase leading-none">Arrival • Slot</span>
                <span className="font-data-mono text-body-sm text-on-surface font-medium leading-tight">Now (2h Lock)</span>
              </div>
            </div>
          </div>

          {/* Quick Sorting */}
          <div className="flex items-center gap-space-sm shrink-0 self-end xl:self-auto">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Sort By:</span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="appearance-none bg-surface-container-high text-on-surface font-label-md text-label-md py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-outline-variant/40"
              >
                <option value="distance">Distance (Nearest First)</option>
                <option value="price">Price (Lowest First)</option>
                <option value="capacity">Highest Capacity</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
                unfold_more
              </span>
            </div>
          </div>
        </div>

        {/* Filter Attribute Badges Ribbon */}
        <div className="flex items-center gap-2 pt-space-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterTag(filterTag === 'ev' ? '' : 'ev')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-[10px] tracking-wider uppercase transition-all ${
              filterTag === 'ev'
                ? 'bg-primary-container text-on-primary font-bold border border-primary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
            <span>EV DC Fast Charge</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTag(filterTag === 'cctv' ? '' : 'cctv')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-[10px] tracking-wider uppercase transition-all ${
              filterTag === 'cctv'
                ? 'bg-primary-container text-on-primary font-bold border border-primary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] text-tertiary">shield</span>
            <span>24/7 Security CCTV</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTag(filterTag === 'covered' ? '' : 'covered')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-[10px] tracking-wider uppercase transition-all ${
              filterTag === 'covered'
                ? 'bg-primary-container text-on-primary font-bold border border-primary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] text-secondary">roofing</span>
            <span>Covered Subterranean</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTag(filterTag === 'valet' ? '' : 'valet')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-[10px] tracking-wider uppercase transition-all ${
              filterTag === 'valet'
                ? 'bg-primary-container text-on-primary font-bold border border-primary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] text-primary">key</span>
            <span>Valet Option</span>
          </button>
          {filterTag && (
            <button
              type="button"
              onClick={() => setFilterTag('')}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface text-[10px] font-label-caps uppercase"
            >
              <span className="material-symbols-outlined text-[12px]">restart_alt</span>
              <span>Reset</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. DUAL WORKSPACE: 45% SCROLLABLE FEED | 55% SPATIAL RADAR MAP */}
      <div className="relative w-full flex flex-col lg:flex-row items-stretch flex-1 min-h-[calc(100vh-144px)]">
        {/* LEFT PANE: Scrollable Radar Feed */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col bg-surface-container-lowest p-margin-mobile md:p-space-lg overflow-y-auto max-h-none lg:max-h-[calc(100vh-144px)] z-10 shadow-2xl border-r border-outline-variant/30">
          <div className="flex flex-col gap-1 pb-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Indore Live Grid</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-data-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                  98.4% Sync
                </span>
              </div>
              <span className="font-data-mono text-body-sm text-primary font-semibold">
                {sortedSpaces.length} Spaces Calibrated
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Ultrasonic telemetry & AI allocation score for Indore event corridors.
            </p>
          </div>

          {/* Indore Zone Filter Pills */}
          <div className="flex items-center gap-1.5 py-space-xs overflow-x-auto no-scrollbar mb-space-sm">
            <button
              onClick={() => setSelectedHub('all')}
              className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-semibold transition-all ${
                selectedHub === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Indore
            </button>
            <button
              onClick={() => setSelectedHub('citadel')}
              className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-semibold transition-all ${
                selectedHub === 'citadel'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Bypass Rd
            </button>
            <button
              onClick={() => setSelectedHub('brilliant')}
              className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-semibold transition-all ${
                selectedHub === 'brilliant'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Vijay Nagar
            </button>
            <button
              onClick={() => setSelectedHub('dukan')}
              className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-semibold transition-all ${
                selectedHub === 'dukan'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Palasia
            </button>
            <button
              onClick={() => setSelectedHub('holkar')}
              className={`px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-semibold transition-all ${
                selectedHub === 'holkar'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Race Course
            </button>
          </div>

          {/* Cards List */}
          <div className="flex flex-col gap-space-md">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant font-data-mono">
                Loading ultrasonic grid telemetry...
              </div>
            ) : sortedSpaces.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                No parking spaces found matching your search.
              </div>
            ) : (
              sortedSpaces.map(space => {
                const isSelected = selectedHub === space.venueId;
                const capacity = vehicleMode === 'car' ? space.carSlots : space.bikeSlots;
                const rate = vehicleMode === 'car' ? space.pricePerHour : Math.round(space.pricePerHour * 0.4);

                return (
                  <article
                    key={space.id}
                    onClick={() => setSelectedHub(space.venueId || 'citadel')}
                    className={`relative flex flex-col p-space-md rounded-xl bg-surface-container-low border-2 transition-all cursor-pointer group hover:border-outline-variant/60 ${
                      isSelected
                        ? 'border-primary shadow-[0_0_24px_rgba(216,166,74,0.18)]'
                        : 'border-transparent'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-space-sm mb-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors font-bold">
                            {space.name}
                          </span>
                          {space.allocationScore && (
                            <span className="px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary font-label-caps text-[10px] tracking-wider uppercase border border-tertiary/40">
                              AI Score: {space.allocationScore}
                            </span>
                          )}
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-tertiary">location_on</span>
                          {space.address}
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-headline-md text-headline-md text-primary font-bold">
                          ₹{rate}
                          <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/hr</span>
                        </span>
                        <span className="font-data-mono text-[11px] text-on-surface-variant">Max ₹{rate * 6}/day</span>
                      </div>
                    </div>

                    {/* Proximity & Bays Strip */}
                    <div className="grid grid-cols-3 gap-2 my-2 py-2 px-3 rounded-lg bg-surface-container">
                      <div className="flex flex-col">
                        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Walk Distance</span>
                        <span className="font-data-mono text-body-md text-on-surface font-semibold">
                          {(space.walkingDistanceMeters / 1000).toFixed(1)} km{' '}
                          <span className="text-tertiary font-normal">· {Math.round(space.walkingDistanceMeters / 80)}m</span>
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                          {vehicleMode === 'car' ? 'Car Bays' : 'Bike Bays'}
                        </span>
                        <span className="font-data-mono text-body-md text-tertiary font-semibold">
                          {space.availableSlots} / {capacity} Free
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Bay Type</span>
                        <span className="font-data-mono text-body-md text-on-surface font-semibold capitalize">
                          {space.spaceType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Feature Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 my-2">
                      {space.facilities?.map(fac => (
                        <span
                          key={fac}
                          className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-caps text-[10px] uppercase tracking-wider"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between gap-space-sm pt-2 mt-1 border-t border-outline-variant/30">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedModalSpace(space);
                        }}
                        className="inline-flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all shadow-[0_0_16px_rgba(216,166,74,0.25)]"
                      >
                        <span>Select & View 3D Deck</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Precision Spatial Radar & Interactive Map Canvas */}
        <div className="w-full lg:w-[55%] xl:w-[58%] relative min-h-[560px] lg:min-h-full bg-surface-container-lowest overflow-hidden flex items-center justify-center">
          <IndoreMapCanvas selectedHub={selectedHub} onSelectHub={hub => setSelectedHub(hub)} />
        </div>
      </div>

      {/* 3. 3D DECK ALLOCATOR & BOOKING MODAL */}
      {selectedModalSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">view_in_ar</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {selectedModalSpace.name} • 3D Slot Allocator
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {selectedModalSpace.address} • Calibrated Ultrasonic Precision
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedModalSpace(null);
                  setLockError('');
                }}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-space-md overflow-y-auto flex flex-col gap-space-md">
              {/* WebGL 3D Interactive Canvas */}
              <div className="w-full rounded-xl overflow-hidden border border-outline-variant/40 relative">
                <ThreeCanvas selectedBay={selectedBayCode} height={320} />
              </div>

              {/* Bay Picker Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface font-semibold">
                    Select Parking Bay Slot
                  </span>
                  <div className="flex items-center gap-3 text-xs font-data-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-primary/30 border border-primary"></span>
                      <span>Selected ({selectedBayCode})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-surface-container-high"></span>
                      <span>Available</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-surface-container-highest opacity-50"></span>
                      <span>Occupied</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08', 'A-09', 'A-10', 'A-11', 'A-12'].map(
                    (bay, idx) => {
                      const isOccupied = idx === 1 || idx === 3 || idx === 7;
                      const isSelected = selectedBayCode === bay;

                      return (
                        <button
                          key={bay}
                          disabled={isOccupied}
                          onClick={() => setSelectedBayCode(bay)}
                          className={`py-2 rounded-lg text-xs font-data-mono font-bold transition-all ${
                            isSelected
                              ? 'bg-primary-container text-on-primary ring-2 ring-primary shadow-lg scale-105'
                              : isOccupied
                              ? 'bg-surface-container-highest/40 text-outline line-through cursor-not-allowed'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                          }`}
                        >
                          {bay}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Price & Guarantee Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant uppercase font-label-caps">Hourly Rate</span>
                  <span className="font-data-mono text-base font-bold text-primary">
                    ₹{vehicleMode === 'car' ? selectedModalSpace.pricePerHour : Math.round(selectedModalSpace.pricePerHour * 0.4)}/hr
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant uppercase font-label-caps">2-Hour Total</span>
                  <span className="font-data-mono text-base font-bold text-on-surface">
                    ₹{(vehicleMode === 'car' ? selectedModalSpace.pricePerHour : Math.round(selectedModalSpace.pricePerHour * 0.4)) * 2}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant uppercase font-label-caps">Reservation Guarantee</span>
                  <span className="font-data-mono text-base font-bold text-tertiary">100% Sensor Backed</span>
                </div>
              </div>

              {lockError && (
                <div className="p-space-sm rounded-lg bg-error-container/30 border border-error text-error text-xs font-data-mono">
                  {lockError}
                </div>
              )}
            </div>

            {/* Modal Footer / Lock CTA */}
            <div className="p-space-md border-t border-outline-variant/40 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-data-mono">
                <span className="material-symbols-outlined text-[16px] text-tertiary">lock_clock</span>
                <span>5-Minute Server-Authoritative Lock initiates on progression.</span>
              </div>
              <button
                type="button"
                disabled={lockingSlot}
                onClick={() => handleLockSlotAndProceed(selectedModalSpace)}
                className="w-full sm:w-auto px-space-xl py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(216,166,74,0.3)] transition-all"
              >
                {lockingSlot ? (
                  <span>Securing Atomic Lock...</span>
                ) : (
                  <>
                    <span>Confirm Bay {selectedBayCode} & Pay</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
