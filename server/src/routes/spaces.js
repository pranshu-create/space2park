import express from 'express';
import { db } from '../db/index.js';
import { lockStore } from '../db/redis.js';
import { calculateWalkingDistance } from '../adapters/mapsAdapter.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Get spaces with query filters (venue, EV, accessibility, search)
router.get('/', (req, res) => {
  const { venueId, vehicle, ev, accessible, search, sort } = req.query;
  let spaces = db.getAllSpaces();

  // Exclude reserve pool from general public discovery
  spaces = spaces.filter(s => !s.isReservePool);

  if (venueId) {
    spaces = spaces.filter(s => s.venueId === venueId);
  }

  if (ev === 'true') {
    spaces = spaces.filter(s => s.hasEVCharging);
  }

  if (accessible === 'true') {
    spaces = spaces.filter(s => s.isAccessible);
  }

  if (search) {
    const q = search.toLowerCase();
    spaces = spaces.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
  }

  // Calculate real walking distance to target venue if venueId provided
  if (venueId) {
    const venue = db.getEventById(venueId);
    if (venue) {
      spaces = spaces.map(space => {
        const route = calculateWalkingDistance(
          venue.location.lat,
          venue.location.lng,
          space.location.lat,
          space.location.lng
        );
        return {
          ...space,
          walkingDistance: route.distanceKm,
          walkingMinutes: route.walkingMinutes,
          drivingMinutes: route.drivingMinutes
        };
      });
    }
  }

  // Sorting
  if (sort === 'price') {
    spaces.sort((a, b) => a.pricePerHour - b.pricePerHour);
  } else if (sort === 'distance' && spaces[0]?.walkingDistance !== undefined) {
    spaces.sort((a, b) => parseFloat(a.walkingDistance) - parseFloat(b.walkingDistance));
  } else if (sort === 'capacity') {
    spaces.sort((a, b) => b.availableSlots - a.availableSlots);
  } else {
    // Default sort by rating / reliability
    spaces.sort((a, b) => (b.allocationScore || b.reliabilityScore) - (a.allocationScore || a.reliabilityScore));
  }

  res.json(spaces);
});

// 2. Get space detail by ID
router.get('/:id', (req, res) => {
  const space = db.getSpaceById(req.params.id);
  if (!space) return res.status(404).json({ error: 'Parking space not found' });

  // Generate simulated slots matrix for 3D allocator
  const carSlots = [];
  const bikeSlots = [];

  for (let i = 1; i <= space.totalCapacity; i++) {
    const code = `A-${i < 10 ? '0' + i : i}`;
    const isOccupied = i <= space.occupiedSlots;
    carSlots.push({
      code,
      status: isOccupied ? 'occupied' : 'available',
      powerKW: space.hasEVCharging && i % 2 === 0 ? 60 : null,
      isAccessible: space.isAccessible && i === 1
    });
  }

  for (let i = 1; i <= (space.bikeCapacity || 12); i++) {
    const code = `B-${i < 10 ? '0' + i : i}`;
    bikeSlots.push({
      code,
      status: i % 3 === 0 ? 'occupied' : 'available'
    });
  }

  res.json({
    ...space,
    slots: {
      cars: carSlots,
      bikes: bikeSlots
    }
  });
});

// 3. Owner adds a new space listing
router.post('/', authenticateToken, requireRole(['owner', 'admin']), (req, res) => {
  const {
    name,
    type,
    address,
    location,
    venueId,
    totalCapacity,
    bikeCapacity,
    hasEVCharging,
    hasCoveredRoof,
    hasCCTV,
    isAccessible,
    userPriceFloor,
    ownerDeclaration
  } = req.body;

  if (!name || !address || !location) {
    return res.status(400).json({ error: 'Name, address, and GPS coordinates are required' });
  }

  if (!ownerDeclaration) {
    return res.status(400).json({ error: 'Owner declaration (right to let the space) is required' });
  }

  // AI-suggested pricing logic based on location, type and facilities
  const baseRate = type === 'Commercial Plaza Basement' ? 50 : type === 'Hotel Subterranean Garage' ? 60 : 35;
  const evPremium = hasEVCharging ? 10 : 0;
  const aiSuggestedPrice = baseRate + evPremium;
  const floorPrice = userPriceFloor ? Math.max(20, parseInt(userPriceFloor)) : baseRate - 10;
  const capPrice = Math.round(aiSuggestedPrice * 1.8);

  const newSpace = {
    id: `space_owner_${Date.now()}`,
    ownerId: req.user.id,
    venueId: venueId || 'venue_holkar',
    name,
    type: type || 'Private Residential Driveway',
    address,
    location,
    totalCapacity: parseInt(totalCapacity) || 10,
    availableSlots: parseInt(totalCapacity) || 10,
    occupiedSlots: 0,
    bikeCapacity: parseInt(bikeCapacity) || 15,
    availableBikes: parseInt(bikeCapacity) || 15,
    pricePerHour: aiSuggestedPrice,
    floorPrice,
    capPrice,
    pricingReasoning: 'AI baseline based on central Indore proximity and active event demand parameters',
    hasEVCharging: Boolean(hasEVCharging),
    hasCoveredRoof: Boolean(hasCoveredRoof),
    hasCCTV: Boolean(hasCCTV),
    isAccessible: Boolean(isAccessible),
    anprEnabled: true,
    reliabilityScore: 0.90,
    verificationStatus: 'pending_verification',
    verificationTier: 'Tier 0 (Phone Verified)',
    rating: 5.0,
    reviewCount: 0,
    photos: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: new Date().toISOString()
  };

  db.saveSpace(newSpace);
  res.status(201).json(newSpace);
});

// 4. Atomic 5-Minute Slot Lock endpoint on Space
router.post('/:id/lock', authenticateToken, async (req, res) => {
  const spaceId = req.params.id;
  const { slotCode = 'A-12', vehicleMode = 'car' } = req.body;

  const space = db.getSpaceById(spaceId);
  if (!space) return res.status(404).json({ error: 'Space not found' });

  const lockKey = `lock:${spaceId}:${slotCode}`;
  const lockResult = await lockStore.acquireLock(lockKey, req.user?.id || 'seeker_demo', 300000);

  if (!lockResult.success) {
    return res.status(409).json({
      error: 'SLOT_LOCKED: Another driver is currently holding an atomic lock on this bay.',
      expiresAt: new Date(lockResult.expiresAt).toISOString()
    });
  }

  const temporaryBooking = {
    id: `bkg_temp_${Date.now()}`,
    userId: req.user?.id || 'seeker_demo',
    spaceId,
    slotCode,
    vehicleMode,
    lockToken: `tok_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    lockExpiresAt: lockResult.expiresAt
  };

  if (req.app.get('io')) {
    req.app.get('io').emit('slot:locked', {
      spaceId,
      slotCode,
      expiresAt: lockResult.expiresAt
    });
  }

  res.json({
    message: 'Slot successfully locked for 5 minutes',
    booking: temporaryBooking,
    lockToken: temporaryBooking.lockToken,
    expiresAt: new Date(lockResult.expiresAt).toISOString(),
    remainingSeconds: Math.round(lockResult.remainingMs / 1000)
  });
});

export default router;
