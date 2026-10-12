import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function BookingCheckout() {
  const { spaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const space = location.state?.space;
  const lockData = location.state?.lockData;
  const slotCode = location.state?.slotCode || 'A-12';
  const vehicleMode = location.state?.vehicleMode || 'car';

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(300); // 5 minutes default
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiApp, setUpiApp] = useState('gpay');
  const [vehicleNumber, setVehicleNumber] = useState('MP 09 Z 4812');
  const [demoOutcome, setDemoOutcome] = useState('success'); // 'success' | 'failure' | 'timeout'
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockExpired, setLockExpired] = useState(false);

  // Synchronize lock timer with expiresAt
  useEffect(() => {
    if (!lockData?.expiresAt) return;
    const expiresTimestamp = new Date(lockData.expiresAt).getTime();

    const interval = setInterval(() => {
      const remainingMs = expiresTimestamp - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSeconds(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(interval);
        setLockExpired(true);
        setErrorMessage('Atomic slot lock has expired. Slot returned to public pool.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockData]);

  const baseRate = vehicleMode === 'car' ? (space?.pricePerHour || 50) : Math.round((space?.pricePerHour || 50) * 0.4);
  const hours = 2;
  const subtotal = baseRate * hours;
  const platformFee = 5;
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + platformFee + gst;

  const handlePayAndConfirm = async e => {
    e.preventDefault();
    if (lockExpired) {
      setErrorMessage('Slot lock has expired. Please return to map and re-select.');
      return;
    }

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
          spaceId: space?.id || spaceId,
          slotCode,
          lockToken: lockData?.lockToken || `token_${Date.now()}`,
          vehicleNumber,
          vehicleType: vehicleMode,
          hours,
          demoOutcome // simulated payment outcome for SIH judges
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment and booking failed.');
      }

      // If demoOutcome is failure or timeout
      if (data.status === 'failed' || data.status === 'cancelled') {
        setErrorMessage(`Simulation outcome: ${data.message || 'Payment rejected'}. Lock automatically released.`);
        setProcessing(false);
        return;
      }

      // Success! Celebrate with confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Navigate to my bookings pass
      setTimeout(() => {
        navigate('/my-bookings', { state: { newBooking: data.booking } });
      }, 900);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatTimer = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!space) {
    return (
      <div className="w-full pt-28 pb-20 min-h-screen bg-surface flex flex-col items-center justify-center text-on-surface">
        <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center max-w-md">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">error</span>
          <h2 className="text-xl font-bold font-headline-sm mb-2">No Active Slot Lock Session</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Please pick a parking bay from the Radar Map Explorer to begin an atomic reservation.
          </p>
          <Link
            to="/explore"
            className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-bold text-sm inline-flex items-center gap-2"
          >
            <span>Explore Parking Grid</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-24 pb-20 min-h-screen bg-surface text-on-surface px-margin-mobile md:px-margin max-w-5xl mx-auto">
      {/* 1. LOCK COUNTDOWN BANNER (Judge-Wow Feature) */}
      <div
        className={`w-full p-space-md rounded-2xl border mb-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm backdrop-blur-xl ${
          timeLeftSeconds < 60
            ? 'bg-error-container/20 border-error text-error animate-pulse'
            : 'bg-surface-container-low border-primary/40'
        }`}
      >
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">lock_clock</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                Atomic Server Lock Active
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-data-mono">
                Bay {slotCode}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Slot held exclusively in Redis. Other drivers see this slot locked in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/40">
          <span className="text-xs text-on-surface-variant font-label-caps uppercase">Time Left:</span>
          <span className="font-data-mono text-xl font-bold text-primary tracking-wider">
            {formatTimer(timeLeftSeconds)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column: Checkout & Payment Details */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <form onSubmit={handlePayAndConfirm} className="flex flex-col gap-space-lg">
            {/* Vehicle Number & Category */}
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Vehicle Details
                </span>
                <span className="font-data-mono text-xs text-tertiary uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  {vehicleMode === 'car' ? 'Car / SUV Bay' : 'Two-Wheeler Dock'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                  Vehicle Registration Number (for ANPR & Barrier)
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. MP 09 AB 1234"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface font-data-mono font-bold tracking-widest text-lg focus:outline-none focus:border-primary uppercase"
                />
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-md">
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Select Payment Method
              </span>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-container-lowest">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 rounded-lg text-xs font-label-md font-semibold transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  ⚡ Instant UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 rounded-lg text-xs font-label-md font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`py-2 rounded-lg text-xs font-label-md font-semibold transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  🏦 NetBanking
                </button>
              </div>

              {/* UPI Options */}
              {paymentMethod === 'upi' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'gpay', label: 'Google Pay', icon: 'payments' },
                    { id: 'phonepe', label: 'PhonePe', icon: 'account_balance_wallet' },
                    { id: 'paytm', label: 'Paytm UPI', icon: 'qr_code_2' },
                    { id: 'bhim', label: 'BHIM UPI', icon: 'currency_rupee' }
                  ].map(app => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        upiApp === app.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant/40 bg-surface-container hover:bg-surface-bright text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{app.icon}</span>
                      <span className="text-[11px] font-label-caps uppercase font-bold">{app.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Simulated Platinum Card)"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface-variant font-data-mono text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface-variant font-data-mono text-sm"
                    />
                    <input
                      type="text"
                      disabled
                      value="•••"
                      className="px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface-variant font-data-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DEMO SCENARIO SELECTOR (Section 5.2.6 Required for SIH Judges) */}
            <div className="p-space-md rounded-2xl bg-surface-container-highest/60 border border-primary/50 flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps uppercase text-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">science</span>
                  SIH Judge Test Scenario Selector
                </span>
                <span className="text-[10px] font-data-mono text-on-surface-variant">
                  DEMO_MODE=true
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Simulate different payment engine outcomes to verify transactional atomic consistency.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoOutcome('success')}
                  className={`py-2 px-3 rounded-lg text-xs font-label-caps uppercase font-bold transition-all border ${
                    demoOutcome === 'success'
                      ? 'bg-tertiary-container/30 border-tertiary text-tertiary ring-1 ring-tertiary'
                      : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'
                  }`}
                >
                  ✓ Success
                </button>
                <button
                  type="button"
                  onClick={() => setDemoOutcome('failure')}
                  className={`py-2 px-3 rounded-lg text-xs font-label-caps uppercase font-bold transition-all border ${
                    demoOutcome === 'failure'
                      ? 'bg-error-container/30 border-error text-error ring-1 ring-error'
                      : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'
                  }`}
                >
                  ✗ Failure
                </button>
                <button
                  type="button"
                  onClick={() => setDemoOutcome('timeout')}
                  className={`py-2 px-3 rounded-lg text-xs font-label-caps uppercase font-bold transition-all border ${
                    demoOutcome === 'timeout'
                      ? 'bg-primary-container/30 border-primary text-primary ring-1 ring-primary'
                      : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'
                  }`}
                >
                  ⏱ Timeout
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-space-md rounded-xl bg-error-container/30 border border-error text-error text-xs font-data-mono">
                {errorMessage}
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={processing || lockExpired}
              className="w-full py-3.5 rounded-full bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-base font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(216,166,74,0.35)] transition-all disabled:opacity-50"
            >
              {processing ? (
                <span>Authorizing Atomic Transaction...</span>
              ) : (
                <>
                  <span>Pay ₹{totalAmount} & Generate Signed Pass</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary & Space Snapshot */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Space Info Card */}
          <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-space-md shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                  Confirmed Bay Ingress
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                  {space.name}
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant">{space.address}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-outline-variant/40">
                <span className="font-data-mono text-xs font-bold text-primary">{slotCode}</span>
                <span className="text-[9px] font-label-caps text-on-surface-variant">BAY</span>
              </div>
            </div>

            <div className="p-space-sm rounded-xl bg-surface-container-lowest flex items-center justify-between text-xs font-data-mono">
              <span className="text-on-surface-variant">Walking to Venue:</span>
              <span className="text-tertiary font-bold">
                {(space.walkingDistanceMeters / 1000).toFixed(1)} km (~{Math.round(space.walkingDistanceMeters / 80)} min)
              </span>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-space-xs text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Parking Base Rate ({hours}h @ ₹{baseRate}/h)</span>
                <span className="font-data-mono text-on-surface font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Platform Facilitation & Telemetry Fee</span>
                <span className="font-data-mono text-on-surface font-semibold">₹{platformFee}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>GST (18% Statutory)</span>
                <span className="font-data-mono text-on-surface font-semibold">₹{gst}</span>
              </div>
              <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-sm">
                <span className="font-bold text-on-surface">Total Guaranteed Amount</span>
                <span className="font-data-mono text-lg font-bold text-primary">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Failsafe Guarantee Notice */}
          <div className="p-space-md rounded-2xl bg-surface-container-low border border-tertiary/30 flex items-start gap-space-sm text-xs">
            <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">verified</span>
            <div className="space-y-1">
              <span className="font-label-caps uppercase text-tertiary font-bold block">
                10% Reserve Pool Guarantee
              </span>
              <p className="text-on-surface-variant leading-relaxed">
                If the allocated bay is obstructed upon arrival, tap "Report Problem" in your pass for instant automated reassignment to a priority reserve bay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
