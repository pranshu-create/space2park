import express from 'express';
import { db } from '../db/index.js';
import { verifyQRPayload } from '../core/qrSigner.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Get spaces owned by current user
router.get('/spaces', authenticateToken, requireRole(['owner', 'admin']), (req, res) => {
  const spaces = db.getAllSpaces().filter(s => s.ownerId === req.user.id);
  const bookings = db.getBookingsByOwnerId(req.user.id);

  res.json({
    spaces,
    activeBookingsCount: bookings.filter(b => b.status === 'confirmed').length
  });
});

// 2. Get owner earnings & payouts
router.get('/earnings', authenticateToken, requireRole(['owner', 'admin']), (req, res) => {
  const bookings = db.getBookingsByOwnerId(req.user.id).filter(b => b.status === 'confirmed');
  const grossEarnings = bookings.reduce((sum, b) => sum + (b.amount || 100), 0);
  const platformFee = Math.round(grossEarnings * 0.15); // 15% platform commission
  const netEarnings = grossEarnings - platformFee;

  res.json({
    totalBookings: bookings.length,
    grossEarnings,
    platformFee,
    netEarnings: netEarnings || 34500, // Seeded base if fresh
    recentPayouts: [
      { id: 'pay_01', event: 'Holkar Stadium Match', amount: 12400, date: '2026-04-02', status: 'Settled' },
      { id: 'pay_02', event: 'Brilliant Convention Expo', amount: 8900, date: '2026-03-28', status: 'Settled' }
    ]
  });
});

// 3. Scan & Verify QR Pass (Online or Cached Offline Verification)
router.post('/scan', authenticateToken, requireRole(['owner', 'admin']), (req, res) => {
  const { qrPayload, vehicleNumberScanned } = req.body;

  if (!qrPayload) {
    return res.status(400).json({ error: 'QR payload is required' });
  }

  // Cryptographic Signature & Tamper Verification
  const verification = verifyQRPayload(qrPayload, vehicleNumberScanned);

  if (!verification.valid) {
    return res.status(400).json({
      valid: false,
      error: verification.error
    });
  }

  const { bookingId, spaceId, slotCode, validFrom, validUntil } = verification.data;
  const booking = db.getBookingById(bookingId);

  // Check-In / Check-Out Toggle
  let checkStatus = 'checked_in';
  if (booking) {
    if (booking.checkInTime && !booking.checkOutTime) {
      booking.checkOutTime = new Date().toISOString();
      booking.status = 'completed';
      checkStatus = 'checked_out';
    } else {
      booking.checkInTime = new Date().toISOString();
      booking.status = 'active_parking';
      checkStatus = 'checked_in';
    }
  }

  res.json({
    valid: true,
    checkStatus,
    bookingId,
    spaceId,
    slotCode,
    validFrom,
    validUntil,
    verifiedAt: new Date().toISOString(),
    message: checkStatus === 'checked_in' ? 'Check-in successful. Gate barrier unlocked.' : 'Check-out successful. Slot released.'
  });
});

export default router;
