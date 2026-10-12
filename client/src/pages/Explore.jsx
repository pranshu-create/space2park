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
  const [searchQuery, setSearchQuery] = useState('Phoenix Citadel, Bypass Rd, Indore');
  const [filterTag, setFilterTag] = useState('ev');
  const [sortOption, setSortOption] = useState('distance');
  const [areaFilter, setAreaFilter] = useState('all');
  const [bookmarkedHubs, setBookmarkedHubs] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  // 3D Deck Modal & Slot Allocation
  const [selectedModalSpace, setSelectedModalSpace] = useState(null);
  const [selectedBayCode, setSelectedBayCode] = useState('A-12');
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

  // Update selectedHub if query param changes
  useEffect(() => {
    const hub = queryParams.get('hub');
    if (hub) setSelectedHub(hub);
  }, [location.search]);

  // Socket updates
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
    socket.on('slot:locked', handleSlotLocked);
    socket.on('slot:released', handleSlotReleased);
    return () => {
      socket.off('slot:locked', handleSlotLocked);
      socket.off('slot:released', handleSlotReleased);
    };
  }, [socket]);

  const showToast = msg => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleBookmark = hubKey => {
    setBookmarkedHubs(prev => {
      const updated = { ...prev, [hubKey]: !prev[hubKey] };
      showToast(updated[hubKey] ? `Bookmarked ${hubKey.toUpperCase()} Hub` : `Removed bookmark`);
      return updated;
    });
  };

  // Static Stitch Hub Profiles with Real-time Binding
  const stitchHubs = [
    {
      id: 'space_citadel_01',
      hubKey: 'citadel',
      name: 'Phoenix Citadel Grand Deck',
      locationDesc: 'MR-10 Junction, Bypass Rd, Indore',
      area: 'bypass',
      rateCar: 50,
      rateBike: 20,
      maxRate: 350,
      distance: '0.8 km · 3m',
      carFree: 45,
      carTotal: 120,
      carPercent: '38%',
      bikeFree: 72,
      tags: ['ANPR Contactless', '60kW CCS2 EV', 'Valet Option'],
      syncText: 'Sensor Sync 12s ago',
      features: ['ev', 'cctv', 'covered', 'valet'],
      spaceType: 'basement_garage'
    },
    {
      id: 'space_brilliant_01',
      hubKey: 'brilliant',
      name: 'Brilliant Convention Centre',
      locationDesc: 'Scheme 78, Vijay Nagar, Indore',
      area: 'vijay-nagar',
      rateCar: 40,
      rateBike: 15,
      maxRate: 280,
      distance: '1.4 km · 5m',
      carFree: 28,
      carTotal: 80,
      carPercent: '35%',
      bikeFree: 110,
      badgeText: 'Express Pass',
      tags: ['Covered B2', 'Heavy EV Hub'],
      syncText: 'Sensor Sync 18s ago',
      features: ['ev', 'cctv', 'covered'],
      spaceType: 'basement_garage'
    },
    {
      id: 'space_dukan_01',
      hubKey: 'dukan',
      name: '56 Dukan Culinary Multi-Deck',
      locationDesc: '56 Shops Arcade, New Palasia',
      area: 'palasia',
      rateCar: 35,
      rateBike: 15,
      maxRate: 240,
      distance: '2.1 km · 8m',
      carFree: 12,
      carTotal: 60,
      carPercent: '20%',
      bikeFree: 85,
      trafficNote: 'High Evening Traffic',
      tags: ['Automated Lift', 'Gourmet Ingress'],
      syncText: 'Sensor Sync 4s ago',
      features: ['cctv', 'valet'],
      spaceType: 'multi_story'
    },
    {
      id: 'space_holkar_01',
      hubKey: 'holkar',
      name: 'Holkar Stadium VIP & General Ring',
      locationDesc: 'Race Course Road, New Palasia',
      area: 'palasia',
      rateCar: 80,
      rateBike: 30,
      maxRate: 500,
      distance: '3.2 km · 11m',
      carFree: 60,
      carTotal: 250,
      carPercent: '24%',
      bikeFree: 140,
      surgeBadge: 'Event Surge',
      badgeText: 'Pre-Match Lock',
      tags: ['VIP Corridor', 'Rapid Outflow'],
      syncText: 'Sensor Sync 8s ago',
      features: ['event', 'cctv'],
      spaceType: 'open_ground'
    }
  ];

  // Filtering Logic
  const filteredHubs = stitchHubs.filter(hub => {
    if (areaFilter !== 'all' && hub.area !== areaFilter) return false;
    if (filterTag && !hub.features.includes(filterTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        hub.name.toLowerCase().includes(q) ||
        hub.locationDesc.toLowerCase().includes(q) ||
        hub.area.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const sortedHubs = [...filteredHubs].sort((a, b) => {
    if (sortOption === 'price') return a.rateCar - b.rateCar;
    if (sortOption === 'capacity') return b.carFree - a.carFree;
    return 0; // default distance
  });

  // Handle Proceeding to Lock & Booking
  const handleProceedToLock = async hub => {
    setLockingSlot(true);
    setLockError('');
    try {
      const res = await fetch(`/api/spaces/${hub.id}/lock`, {
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

      navigate(`/book/${hub.id}`, {
        state: {
          space: {
            id: hub.id,
            name: hub.name,
            address: hub.locationDesc,
            pricePerHour: hub.rateCar,
            walkingDistanceMeters: parseInt(hub.distance) * 1000 || 800,
            spaceType: hub.spaceType
          },
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
    <div className="w-full pt-16 md:pt-20 bg-surface min-h-screen text-on-surface">
      {/* 1. TOP TELEMETRY & CONTROL RIBBON */}
      <section className="w-full bg-surface-container-lowest px-margin-mobile md:px-margin py-space-sm shadow-xl border-b border-outline-variant/30 sticky top-16 md:top-20 z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          {/* Segmented Mode & Search Crosshairs */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-space-sm flex-1">
            {/* Vehicle Mode Toggle */}
            <div className="flex items-center p-1 rounded-full bg-surface-container-low" id="vehicle-toggle-group">
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('car')}
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-caps text-label-caps transition-all cursor-pointer ${
                  vehicleMode === 'car'
                    ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                <span>Car / SUV</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('bike')}
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-label-caps text-label-caps transition-all cursor-pointer ${
                  vehicleMode === 'bike'
                    ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                <span>Bike / Moto</span>
              </button>
            </div>

            {/* Search Input Bar with Live Filtering */}
            <div className="relative flex-1 min-w-[280px]">
              <div className="flex items-center px-space-md py-2 rounded-full bg-surface-container-low focus-within:ring-1 focus-within:ring-primary border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[20px] mr-2">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search address, corridor or venue (e.g. Citadel, Vijay Nagar)..."
                  className="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-on-surface-variant"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Phoenix Citadel, Bypass Rd, Indore');
                    setSelectedHub('citadel');
                    showToast('GPS Recentered: Phoenix Citadel Junction');
                  }}
                  className="flex items-center gap-1 pl-2 text-tertiary hover:text-tertiary-fixed transition-colors cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">my_location</span>
                  <span className="font-data-mono text-body-sm text-tertiary hidden sm:inline font-bold">GPS: ACTIVE</span>
                </button>
              </div>
            </div>

            {/* Time & Duration Selector */}
            <div
              onClick={() => showToast('Time slot set: Today, Immediate Arrival (2h Lock)')}
              className="flex items-center gap-2 px-space-md py-2 rounded-full bg-surface-container-low text-on-surface shrink-0 cursor-pointer hover:bg-surface-container border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-primary-container text-[18px]">schedule</span>
              <div className="flex flex-col">
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase leading-none">Arrival • Slot</span>
                <span className="font-data-mono text-body-sm text-on-surface font-medium leading-tight">Today, Now (2h Reserve)</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Quick Sorting Action */}
          <div className="flex items-center gap-space-sm shrink-0 self-end xl:self-auto">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Sort By</span>
            <div className="relative">
              <select
                aria-label="Sort parking options"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="appearance-none bg-surface-container-high text-on-surface font-label-md text-label-md py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-outline-variant/40"
              >
                <option value="distance">Distance (Nearest First)</option>
                <option value="price">Price (Lowest First)</option>
                <option value="capacity">Highest Available Capacity</option>
                <option value="ev">EV Ultra-Fast Rated</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
                unfold_more
              </span>
            </div>
          </div>
        </div>

        {/* Filter Attribute Badges Ribbon */}
        <div className="flex items-center gap-2 pt-space-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'ev', label: 'EV DC Fast Charge', icon: 'bolt', color: 'text-primary' },
            { id: 'cctv', label: '24/7 CCTV & Security', icon: 'shield', color: 'text-tertiary' },
            { id: 'covered', label: 'Covered Subterranean', icon: 'roofing', color: 'text-secondary' },
            { id: 'valet', label: 'Valet Ingress', icon: 'key', color: 'text-primary' },
            { id: 'event', label: 'Event Corridor', icon: 'confirmation_number', color: 'text-error' }
          ].map(f => {
            const isActive = filterTag === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterTag(isActive ? '' : f.id)}
                className={`filter-pill shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container/20 text-primary border border-primary/40 font-bold'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-transparent'
                }`}
              >
                <span className={`material-symbols-outlined text-[14px] ${f.color}`}>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setFilterTag('');
              setSearchQuery('');
              setAreaFilter('all');
            }}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-[10px] font-label-caps uppercase transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[12px]">restart_alt</span>
            <span>Reset Filters</span>
          </button>
        </div>
      </section>

      {/* 2. MAIN EXPLORATION WORKSPACE: 42% FEED | 58% SPATIAL CANVAS */}
      <div className="relative w-full flex flex-col lg:flex-row items-stretch flex-1 min-h-[calc(100vh-144px)]">
        {/* LEFT PANE: Scrollable Radar Feed */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col bg-surface-container-lowest p-margin-mobile md:p-space-lg overflow-y-auto max-h-none lg:max-h-[calc(100vh-144px)] z-10 shadow-2xl border-r border-outline-variant/30">
          {/* Sector Header */}
          <div className="flex flex-col gap-1 pb-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Indore Live Grid</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-data-mono text-body-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                  98.4% Sync
                </span>
              </div>
              <span className="font-data-mono text-body-sm text-primary font-semibold" id="hubs-count-label">
                {sortedHubs.length} Hubs Active
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Real-time ultrasonic bay status calibrated for MP-09 high-density corridors.
            </p>
          </div>

          {/* Corridor Navigation Pills */}
          <div className="flex items-center gap-2 py-space-xs overflow-x-auto no-scrollbar mb-space-sm" id="area-filter-row">
            {[
              { id: 'all', label: 'All Indore' },
              { id: 'vijay-nagar', label: 'Vijay Nagar' },
              { id: 'bypass', label: 'Bypass Road' },
              { id: 'palasia', label: 'Palasia' },
              { id: 'super-corridor', label: 'Super Corridor' }
            ].map(area => {
              const isActive = areaFilter === area.id;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setAreaFilter(area.id)}
                  className={`area-btn px-3 py-1 rounded-full font-label-caps text-label-caps tracking-wider uppercase font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {area.label}
                </button>
              );
            })}
          </div>

          {/* Feed Location Cards Stack */}
          <div className="flex flex-col gap-space-md" id="cards-stack">
            {sortedHubs.map(hub => {
              const isSelected = selectedHub === hub.hubKey;
              const rate = vehicleMode === 'car' ? hub.rateCar : hub.rateBike;
              const isBookmarked = bookmarkedHubs[hub.hubKey];

              return (
                <article
                  key={hub.hubKey}
                  onClick={() => setSelectedHub(hub.hubKey)}
                  className={`hub-card relative flex flex-col p-space-md rounded-xl bg-surface-container-low border-2 transition-all transform hover:-translate-y-0.5 group cursor-pointer ${
                    isSelected
                      ? 'border-primary shadow-[0_0_24px_rgba(216,166,74,0.18)]'
                      : 'border-transparent hover:border-outline-variant/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-space-sm mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors font-bold">
                          {hub.name}
                        </span>
                        {isSelected && (
                          <span className="badge-status px-1.5 py-0.5 rounded bg-primary/20 text-primary font-label-caps text-[10px] tracking-wider uppercase border border-primary/40 font-semibold">
                            Selected Ingress
                          </span>
                        )}
                        {hub.surgeBadge && (
                          <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-label-caps text-[10px] uppercase border border-error/40 font-bold">
                            {hub.surgeBadge}
                          </span>
                        )}
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">location_on</span>
                        {hub.locationDesc}
                      </span>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-md text-headline-md text-primary font-bold">
                        <span>₹{rate}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/hr</span>
                      </span>
                      <span className="font-data-mono text-[11px] text-on-surface-variant">
                        {hub.badgeText || `Max ₹${hub.maxRate}/day`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-2 py-2 px-3 rounded-lg bg-surface-container">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Proximity</span>
                      <span className="font-data-mono text-body-md text-on-surface font-semibold">{hub.distance}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Car Bays</span>
                      <span className="font-data-mono text-body-md text-tertiary font-semibold">
                        {hub.carFree} / {hub.carTotal} <span className="text-on-surface-variant text-[11px]">({hub.carPercent})</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Bike Bays</span>
                      <span className="font-data-mono text-body-md text-on-surface font-semibold">{hub.bikeFree} Free</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 my-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {hub.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-caps text-[10px] uppercase tracking-wider"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-tertiary font-data-mono text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                      <span>{hub.syncText}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-space-sm pt-2 mt-1 border-t border-outline-variant/30">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedModalSpace(hub);
                      }}
                      className="inline-flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all shadow-[0_0_16px_rgba(216,166,74,0.3)] cursor-pointer"
                    >
                      <span>Select &amp; View 3D Deck</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Bookmark Bay"
                      onClick={e => {
                        e.stopPropagation();
                        toggleBookmark(hub.hubKey);
                      }}
                      className={`bookmark-btn p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer ${
                        isBookmarked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isBookmarked ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Precision Spatial Radar & Interactive Map Canvas */}
        <div className="w-full lg:w-[55%] xl:w-[58%] relative min-h-[560px] lg:min-h-full bg-surface-container-lowest overflow-hidden flex items-center justify-center select-none" id="map-viewport">
          <IndoreMapCanvas selectedHub={selectedHub} onSelectHub={hub => setSelectedHub(hub)} />
        </div>
      </div>

      {/* 3. 3D DECK ALLOCATOR MODAL */}
      {selectedModalSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="w-full max-w-4xl bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-space-md border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">view_in_ar</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {selectedModalSpace.name} — Level 03
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {selectedModalSpace.locationDesc} • CAD Sync: 80ms Ultra-Wideband
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedModalSpace(null);
                  setLockError('');
                }}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-space-md overflow-y-auto flex flex-col gap-space-md">
              <div className="w-full rounded-xl overflow-hidden border border-outline-variant/40 relative">
                <ThreeCanvas selectedBay={selectedBayCode} height={320} />
              </div>

              {/* Bay Picker Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface font-semibold">
                    Row A — High-Capacity DC Fast Charge Bays (Up to 4.9m)
                  </span>
                  <div className="flex items-center gap-3 text-xs font-data-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-primary"></span>
                      <span>Selected ({selectedBayCode})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-surface-container-high ring-1 ring-tertiary/60"></span>
                      <span>Available</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-surface-container-highest opacity-50"></span>
                      <span>Occupied</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-12'].map((bay, idx) => {
                    const isOccupied = idx === 0 || idx === 1 || idx === 3 || idx === 6;
                    const isSelected = selectedBayCode === bay;
                    return (
                      <button
                        key={bay}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedBayCode(bay)}
                        className={`py-2.5 rounded-lg text-xs font-data-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-on-primary ring-2 ring-primary shadow-lg scale-105'
                            : isOccupied
                            ? 'bg-surface-container-highest/50 text-on-surface-variant/40 line-through cursor-not-allowed'
                            : 'bg-surface-container-high ring-1 ring-tertiary/60 hover:bg-surface-bright text-on-surface'
                        }`}
                      >
                        {bay}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Guarantee Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant uppercase font-label-caps">Hourly Rate</span>
                  <span className="font-data-mono text-base font-bold text-primary">
                    ₹{selectedModalSpace.rateCar}/hr
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant uppercase font-label-caps">2-Hour Total (Escrow)</span>
                  <span className="font-data-mono text-base font-bold text-on-surface">
                    ₹{selectedModalSpace.rateCar * 2 + 30}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant uppercase font-label-caps">ANPR Access Link</span>
                  <span className="font-data-mono text-base font-bold text-tertiary">
                    Instant Barrier QR Sync
                  </span>
                </div>
              </div>

              {lockError && (
                <div className="p-space-sm rounded-lg bg-error-container/30 border border-error text-error text-xs font-data-mono">
                  {lockError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-space-md border-t border-outline-variant/40 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-data-mono">
                <span className="material-symbols-outlined text-[16px] text-tertiary">lock_clock</span>
                <span>5-Minute Server-Authoritative Lock initiates on progression.</span>
              </div>
              <button
                type="button"
                disabled={lockingSlot}
                onClick={() => handleProceedToLock(selectedModalSpace)}
                className="w-full sm:w-auto px-space-xl py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(216,166,74,0.3)] transition-all cursor-pointer"
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

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-highest text-on-surface px-space-md py-space-sm rounded-lg shadow-2xl flex items-center gap-3 border border-primary/40 animate-fadeIn">
          <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          <span className="font-body-sm text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
