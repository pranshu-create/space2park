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
          // If came from checkout, pick the new one, else first active
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

      alert(data.message || 'Booking cancelled and slot released.');
      setCancelModal(false);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full pt-24 pb-24 min-h-screen bg-surface text-on-surface px-margin-mobile md:px-margin max-w-6xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-lg border-b border-outline-variant/30 gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold">
              Real-Time Ingress HUD
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight uppercase">
            MY BOOKING PASSES
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            Cryptographically signed passes, live barrier credentials, and walking telemetry.
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-space-md py-2 rounded-full bg-surface-container-high hover:bg-surface-bright text-xs font-label-caps uppercase text-on-surface border border-outline-variant/50 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">add_location_alt</span>
          <span>Book Another Space</span>
        </Link>
      </div>

      {reassignSuccessMsg && (
        <div className="mb-space-lg p-space-md rounded-2xl bg-tertiary-container/20 border border-tertiary text-tertiary flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[24px]">verified</span>
            <span className="text-sm font-semibold font-body-md">{reassignSuccessMsg}</span>
          </div>
          <button
            onClick={() => setReassignSuccessMsg('')}
            className="text-on-surface hover:text-tertiary"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant font-data-mono">
          Loading signed passes...
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center max-w-md mx-auto">
          <span className="material-symbols-outlined text-4xl text-primary mb-2">confirmation_number</span>
          <h3 className="font-headline-sm font-bold text-lg mb-1">No Active Passes Found</h3>
          <p className="text-xs text-on-surface-variant mb-6">
            Reserve parking near any Indore event or commercial hub to unlock your signed QR pass.
          </p>
          <Link
            to="/explore"
            className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-bold text-xs inline-flex items-center gap-2"
          >
            <span>Explore Indore Grid</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Left Column: Pass Selection List */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold">
              Active & Past Reservations ({bookings.length})
            </span>

            <div className="flex flex-col gap-space-sm max-h-[640px] overflow-y-auto pr-1">
              {bookings.map(b => {
                const isSelected = selectedBooking?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className={`p-space-md rounded-2xl border transition-all cursor-pointer flex flex-col gap-space-xs ${
                      isSelected
                        ? 'bg-surface-container-high border-primary shadow-[0_0_20px_rgba(216,166,74,0.2)]'
                        : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-data-mono text-xs text-primary font-bold">
                        {b.id}
                      </span>
                      <span
                        className={`text-[10px] font-label-caps uppercase px-2 py-0.5 rounded-full font-bold ${
                          b.status === 'confirmed'
                            ? 'bg-tertiary-container/20 text-tertiary border border-tertiary/40'
                            : b.status === 'checked_in'
                            ? 'bg-primary/20 text-primary border border-primary/40'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-headline-sm text-base font-semibold text-on-surface">
                      {b.spaceName || 'Indore Parking Bay'}
                    </h4>
                    <p className="text-xs text-on-surface-variant truncate">
                      {b.spaceAddress || 'Corridor Venue'}
                    </p>

                    <div className="pt-2 mt-1 border-t border-outline-variant/30 flex items-center justify-between text-xs font-data-mono">
                      <span className="text-on-surface-variant">
                        Bay: <strong className="text-primary">{b.slotCode || 'A-12'}</strong>
                      </span>
                      <span className="text-on-surface-variant">{b.vehicleNumber}</span>
                      <span className="font-bold text-on-surface">₹{b.amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Pass Details & Signed QR Card */}
          {selectedBooking && (
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {/* Main Obsidian Orbit Digital Ticket */}
              <div className="p-space-lg rounded-3xl bg-surface-container-low border-2 border-primary/50 shadow-2xl relative overflow-hidden flex flex-col gap-space-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Ticket Header */}
                <div className="flex items-start justify-between pb-space-md border-b border-outline-variant/40">
                  <div>
                    <span className="text-[10px] font-label-caps uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold">
                      SMART BARRIER INGRESS PASS
                    </span>
                    <h2 className="font-headline-md text-2xl font-bold text-on-surface mt-1">
                      {selectedBooking.spaceName || 'Indore Parking Facility'}
                    </h2>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      {selectedBooking.spaceAddress || 'MP-09 Event Corridor'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-label-caps text-on-surface-variant uppercase block">
                      Allocated Bay
                    </span>
                    <span className="font-data-mono text-3xl font-extrabold text-primary">
                      {selectedBooking.slotCode || 'A-12'}
                    </span>
                  </div>
                </div>

                {/* Central QR Code Display */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-space-lg p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/40">
                  {/* Signed QR Visual */}
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                      {selectedBooking.qrCodeDataUrl ? (
                        <img
                          src={selectedBooking.qrCodeDataUrl}
                          alt="Signed Parking QR"
                          className="w-40 h-40 object-contain"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-zinc-900 rounded-lg flex flex-col items-center justify-center text-primary text-xs font-data-mono p-2 text-center">
                          <span className="material-symbols-outlined text-4xl mb-1">qr_code_2</span>
                          <span>HMAC SIGNED</span>
                        </div>
                      )}
                    </div>
                    <span className="font-data-mono text-[10px] text-tertiary mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      SHA-256 Signed Credentials
                    </span>
                  </div>

                  {/* Telemetry Strip & Instructions */}
                  <div className="flex-1 space-y-3 text-xs font-data-mono">
                    <div className="p-2 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
                      <span className="text-on-surface-variant uppercase font-label-caps">Vehicle Reg:</span>
                      <span className="text-on-surface font-bold text-sm">{selectedBooking.vehicleNumber}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
                      <span className="text-on-surface-variant uppercase font-label-caps">Pass Duration:</span>
                      <span className="text-on-surface">{selectedBooking.hours || 2} Hours (Guaranteed)</span>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between">
                      <span className="text-on-surface-variant uppercase font-label-caps">Paid Total:</span>
                      <span className="text-primary font-bold">₹{selectedBooking.amount}</span>
                    </div>

                    <div className="pt-1 text-[11px] text-on-surface-variant font-body-sm leading-relaxed">
                      Present QR at gate or sensor bay. Owner scans with offline-validated key to open barrier.
                    </div>
                  </div>
                </div>

                {/* Gate Navigation HUD Strip */}
                <div className="p-space-md rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">navigation</span>
                      Gate Ingress & Navigation HUD
                    </span>
                    <span className="font-data-mono text-xs text-tertiary">ETA: 3 min (0.8 km)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded bg-surface-container-low">
                      <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Lane</span>
                      <span className="font-data-mono text-sm font-bold text-on-surface">Lane 2 (East)</span>
                    </div>
                    <div className="p-2 rounded bg-surface-container-low">
                      <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Barrier</span>
                      <span className="font-data-mono text-sm font-bold text-tertiary">RFID Auto</span>
                    </div>
                    <div className="p-2 rounded bg-surface-container-low">
                      <span className="text-[10px] font-label-caps text-on-surface-variant block uppercase">Deck Floor</span>
                      <span className="font-data-mono text-sm font-bold text-primary">Level -1 (B1)</span>
                    </div>
                  </div>

                  {/* Google Maps Deep Link */}
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedBooking.spaceAddress || 'Indore'
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-xs font-label-caps uppercase text-on-surface flex items-center justify-center gap-1 border border-outline-variant/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">directions</span>
                      <span>Open in Google Maps</span>
                    </a>
                  </div>
                </div>

                {/* Actions: Problem Reporting & Cancellation */}
                <div className="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={handleReportOccupied}
                    disabled={reportingProblem}
                    className="px-4 py-2 rounded-xl bg-error-container/30 hover:bg-error-container text-error text-xs font-label-caps uppercase font-bold flex items-center gap-1.5 border border-error/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">report_problem</span>
                    <span>{reportingProblem ? 'Triggering Re-allocation...' : 'Report Space Occupied'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCancelModal(true)}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-label-caps uppercase transition-colors"
                  >
                    <span>Cancel Pass</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-space-md">
            <h3 className="font-headline-sm font-bold text-lg text-on-surface">Confirm Cancellation</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Cancelling your reservation will instantly release Bay {selectedBooking?.slotCode} back to the public pool and trigger automated re-allocation.
            </p>
            <div className="p-3 rounded-xl bg-surface-container text-xs font-data-mono text-tertiary">
              Refund Policy: 100% Instant refund credited to original payment source.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-label-md text-on-surface-variant hover:text-on-surface"
              >
                Keep Pass
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-bold text-xs font-label-md"
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
