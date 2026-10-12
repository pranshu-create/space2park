import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';

export default function OwnerPortal() {
  const { user, token } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('/new') ? 'add' : 'dashboard'
  );
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Listing Form State
  const [formData, setFormData] = useState({
    name: 'Vijay Nagar Gated Driveway',
    venueId: 'venue_bcc',
    address: 'Scheme 78, Part II, Vijay Nagar, Indore',
    spaceType: 'home_driveway',
    carSlots: 4,
    bikeSlots: 8,
    facilities: ['24/7 Security CCTV', 'Covered Subterranean'],
    declarationAccepted: true,
    isAccessible: true,
    ownerFloorPrice: 30,
    platformCapPrice: 80,
    suggestedPrice: 45
  });
  const [listingSuccess, setListingSuccess] = useState(false);

  // Scanner state
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    fetch('/api/owner/spaces', {
      headers: {
        Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setSpaces(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load owner spaces:', err);
        setLoading(false);
      });
  }, []);

  // Initialize html5-qrcode scanner when on 'scan' tab
  useEffect(() => {
    if (activeTab !== 'scan') {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
        scannerRef.current = null;
      }
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      decodedText => {
        handleValidateQrPayload(decodedText);
      },
      error => {
        // quiet scan frame errors
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [activeTab]);

  // Validate QR payload on backend
  const handleValidateQrPayload = async payload => {
    setValidating(true);
    setScanError('');
    try {
      const res = await fetch('/api/owner/scan-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({
          qrPayload: payload,
          scanAction: 'check_in'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'QR validation failed');

      setScanResult(data);
    } catch (err) {
      setScanError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleManualCodeSubmit = e => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleValidateQrPayload(manualCode.trim());
  };

  const handleCreateSpace = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/owner/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('s2p_token')}`
        },
        body: JSON.stringify({
          ...formData,
          totalCapacity: Number(formData.carSlots) + Number(formData.bikeSlots),
          pricePerHour: formData.suggestedPrice
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to list space');

      setListingSuccess(true);
      setSpaces(prev => [data, ...prev]);
      setActiveTab('dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full pt-24 pb-24 min-h-screen bg-surface text-on-surface px-margin-mobile md:px-margin max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg border-b border-outline-variant/30 gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Space Owner & Host Network
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
            OWNER COMMAND HUB
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
            Monetize private residential driveways, retail lots, and office basements during Indore high-volume events.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-surface-container-low border border-outline-variant/40">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-label-caps uppercase font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            My Listings & Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-4 py-1.5 rounded-full text-xs font-label-caps uppercase font-bold transition-all ${
              activeTab === 'add'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            + List Space Wizard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-1.5 rounded-full text-xs font-label-caps uppercase font-bold transition-all ${
              activeTab === 'scan'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            📷 QR Gate Scanner
          </button>
        </div>
      </div>

      {/* Nearby Event Proximity Alert Banner */}
      <div className="mb-space-lg p-space-md rounded-2xl bg-surface-container-high border border-primary/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[24px]">notifications_active</span>
          <div>
            <span className="font-label-caps text-xs text-primary uppercase font-bold block">
              Event Spike Nearby • Holkar Stadium vs Brilliant Convention Centre
            </span>
            <p className="text-xs text-on-surface-variant">
              High-volume concert expected in 2 days. AI projected earnings for your Vijay Nagar slots: ₹1,200 - ₹1,800/day.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('add')}
          className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-label-caps uppercase font-bold shrink-0"
        >
          Activate Extra Slots
        </button>
      </div>

      {/* TAB 1: DASHBOARD & ACTIVE LISTINGS */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-space-xl">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">Total Managed Bays</span>
              <span className="font-headline-lg text-2xl font-bold text-on-surface">14 Slots</span>
              <span className="text-xs font-data-mono text-tertiary block mt-1">Car: 8 • Bike: 6</span>
            </div>
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">Live Occupancy</span>
              <span className="font-headline-lg text-2xl font-bold text-primary">78.5%</span>
              <span className="text-xs font-data-mono text-on-surface-variant block mt-1">11 vehicles parked</span>
            </div>
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">Monthly Earnings</span>
              <span className="font-headline-lg text-2xl font-bold text-on-surface">₹18,450</span>
              <span className="text-xs font-data-mono text-tertiary block mt-1">+14.2% event surge</span>
            </div>
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">Reliability Score</span>
              <span className="font-headline-lg text-2xl font-bold text-tertiary">99.2%</span>
              <span className="text-xs font-data-mono text-on-surface-variant block mt-1">Tier 2 Admin Verified</span>
            </div>
          </div>

          {/* Active Listings Grid */}
          <div className="flex flex-col gap-space-md">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
              Configured Spaces in Indore
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {spaces.map(space => (
                <div
                  key={space.id}
                  className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-space-md shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {space.verificationStatus || 'Tier 2 Verified'}
                      </span>
                      <span className="font-data-mono text-xs font-bold text-primary">
                        ₹{space.pricePerHour}/hr
                      </span>
                    </div>

                    <h4 className="font-headline-sm text-lg font-bold text-on-surface">{space.name}</h4>
                    <p className="text-xs text-on-surface-variant">{space.address}</p>

                    <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-surface-container text-xs font-data-mono">
                      <div>
                        <span className="text-on-surface-variant block text-[10px]">Car Bays:</span>
                        <span className="font-bold text-on-surface">{space.carSlots} slots</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[10px]">Bike Bays:</span>
                        <span className="font-bold text-on-surface">{space.bikeSlots} slots</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                    <span className="text-tertiary font-data-mono flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                      Ultrasonic Sync Active
                    </span>
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="text-primary hover:underline font-label-md font-semibold"
                    >
                      Scan QR Check-In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADD-LISTING WIZARD */}
      {activeTab === 'add' && (
        <div className="max-w-3xl mx-auto p-space-xl rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-xl">
          <div className="mb-space-lg pb-space-sm border-b border-outline-variant/30">
            <h3 className="font-headline-md text-2xl font-bold text-on-surface">List A New Parking Facility</h3>
            <p className="text-xs text-on-surface-variant">
              Connect your driveway, commercial plot, or basement with the SPACE2PARK Smart Allocation Engine.
            </p>
          </div>

          <form onSubmit={handleCreateSpace} className="flex flex-col gap-space-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Space Display Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Proximity Event Hub
                </label>
                <select
                  value={formData.venueId}
                  onChange={e => setFormData({ ...formData, venueId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="venue_bcc">Brilliant Convention Centre (Vijay Nagar)</option>
                  <option value="venue_citadel">Phoenix Citadel Mall (Bypass Rd)</option>
                  <option value="venue_holkar">Holkar Cricket Stadium (Race Course)</option>
                  <option value="venue_chappan">56 Dukan Culinary Hub (Palasia)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Space Type
                </label>
                <select
                  value={formData.spaceType}
                  onChange={e => setFormData({ ...formData, spaceType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm focus:outline-none focus:border-primary"
                >
                  <option value="home_driveway">Home Driveway</option>
                  <option value="shop_forecourt">Shop / Commercial Forecourt</option>
                  <option value="office_basement">Office Subterranean Deck</option>
                  <option value="open_plot">Open Fenced Plot</option>
                  <option value="college_campus">College / Institution Campus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Car Slots
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.carSlots}
                  onChange={e => setFormData({ ...formData, carSlots: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm font-data-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Bike / 2W Slots
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bikeSlots}
                  onChange={e => setFormData({ ...formData, bikeSlots: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-sm font-data-mono"
                />
              </div>
            </div>

            {/* AI Dynamic Price Advisor */}
            <div className="p-space-md rounded-2xl bg-surface-container border border-primary/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-xs uppercase text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AI Dynamic Price Suggester
                </span>
                <span className="text-xs font-data-mono text-tertiary">Recommended: ₹{formData.suggestedPrice}/hr</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Calculated dynamically from nearby venue demand curves, walking distance, and historical occupancy. You set your minimum floor price.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
                    Owner Floor Price (Min)
                  </span>
                  <input
                    type="number"
                    value={formData.ownerFloorPrice}
                    onChange={e => setFormData({ ...formData, ownerFloorPrice: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-xs font-data-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-label-caps uppercase text-on-surface-variant block">
                    Platform Cap Price (Max)
                  </span>
                  <input
                    type="number"
                    value={formData.platformCapPrice}
                    onChange={e => setFormData({ ...formData, platformCapPrice: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-xs font-data-mono"
                  />
                </div>
              </div>
            </div>

            {/* Declaration & Accessibility */}
            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.declarationAccepted}
                  onChange={e => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-on-surface">
                  I declare that I own or have legal leasehold right to let this parking space.
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAccessible}
                  onChange={e => setFormData({ ...formData, isAccessible: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-on-surface">
                  This facility includes an Accessible / ADA compliant step-free parking bay.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-sm font-bold shadow-[0_0_20px_rgba(216,166,74,0.3)] transition-all"
            >
              Submit Space & Activate Telemetry
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: QR SCANNER STATION */}
      {activeTab === 'scan' && (
        <div className="max-w-2xl mx-auto flex flex-col gap-space-lg">
          <div className="p-space-lg rounded-3xl bg-surface-container-low border border-outline-variant/40 shadow-xl flex flex-col items-center">
            <span className="text-[10px] font-label-caps uppercase px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 mb-2 font-bold">
              OFFLINE-READY GATE SCANNER
            </span>
            <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-1 text-center">
              Scan Seeker QR Ingress Pass
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 text-center max-w-md">
              Validates cryptographically signed HMAC token against cached public key. Operates even when cell coverage drops in basements.
            </p>

            {/* Camera Viewport Mount */}
            <div
              id="qr-reader-container"
              className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-primary/40 bg-black shadow-inner"
            ></div>

            {/* Manual Code Entry Fallback */}
            <form onSubmit={handleManualCodeSubmit} className="w-full max-w-sm mt-6 flex flex-col gap-2">
              <span className="text-[10px] font-label-caps uppercase text-on-surface-variant">
                Manual Pass / Vehicle Code Entry
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="e.g. bkg_sim_1772... or MP 09 AB 4021"
                  className="flex-1 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-xs text-on-surface font-data-mono"
                />
                <button
                  type="submit"
                  disabled={validating}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-bold font-label-caps uppercase"
                >
                  Verify
                </button>
              </div>
            </form>

            {scanError && (
              <div className="mt-4 p-3 rounded-xl bg-error-container/30 border border-error text-error text-xs font-data-mono w-full max-w-sm">
                {scanError}
              </div>
            )}

            {scanResult && (
              <div className="mt-6 p-space-md rounded-2xl bg-tertiary-container/20 border-2 border-tertiary text-on-surface w-full max-w-sm space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-tertiary">
                  <span className="material-symbols-outlined text-[24px]">check_circle</span>
                  <span className="font-headline-sm text-sm font-bold">BARRIER OPEN: PASS VALID</span>
                </div>
                <div className="text-xs font-data-mono space-y-1 text-on-surface-variant">
                  <div>Vehicle: <strong className="text-on-surface">{scanResult.vehicleNumber}</strong></div>
                  <div>Bay Slot: <strong className="text-primary">{scanResult.slotCode}</strong></div>
                  <div>Status: <strong className="text-tertiary">CHECKED-IN</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
