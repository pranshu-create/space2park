import express from 'express';
import { db } from '../db/index.js';
import { estimateEventDemand } from '../core/demandEstimator.js';
import { scoreAndRankSpaces } from '../core/allocationEngine.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Get all events with parking readiness score
router.get('/', (req, res) => {
  const events = db.getAllEvents();
  const allSpaces = db.getAllSpaces();

  const enrichedEvents = events.map(event => {
    // Calculate candidate supply around venue
    const nearbySpaces = allSpaces.filter(s => s.venueId === event.id);
    const totalNearbySlots = nearbySpaces.reduce((acc, s) => acc + s.totalCapacity, 0);
    const availableSlots = nearbySpaces.reduce((acc, s) => acc + s.availableSlots, 0);

    // Calculate baseline demand
    const estimate = estimateEventDemand({
      attendance: event.expectedAttendance || 10000,
      eventType: event.eventType || 'concert',
      officialCapacity: event.officialCapacity || 0
    });

    const supplyCoveragePct = Math.min(
      100,
      Math.round((totalNearbySlots / Math.max(1, estimate.predictedDemand)) * 100)
    );

    return {
      ...event,
      demandEstimate: estimate,
      nearbyStats: {
        totalCandidateSpaces: nearbySpaces.length,
        totalCapacity: totalNearbySlots,
        availableSlots,
        supplyCoveragePct,
        readinessStatus:
          supplyCoveragePct >= 80 ? 'Optimal' : supplyCoveragePct >= 50 ? 'Moderate' : 'Critical Deficit'
      }
    };
  });

  res.json(enrichedEvents);
});

// 2. Get specific event
router.get('/:id', (req, res) => {
  const event = db.getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const nearbySpaces = db.getAllSpaces().filter(s => s.venueId === event.id);
  const estimate = estimateEventDemand({
    attendance: event.expectedAttendance,
    eventType: event.eventType,
    officialCapacity: event.officialCapacity
  });

  res.json({
    ...event,
    demandEstimate: estimate,
    candidateSpacesCount: nearbySpaces.length
  });
});

// 3. Demand Estimator calculation endpoint
router.get('/:id/estimate', (req, res) => {
  const event = db.getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const customAttendance = req.query.attendance ? parseInt(req.query.attendance) : event.expectedAttendance;
  const customCapacity = req.query.officialCapacity ? parseInt(req.query.officialCapacity) : event.officialCapacity;

  const estimate = estimateEventDemand({
    attendance: customAttendance,
    eventType: event.eventType,
    officialCapacity: customCapacity
  });

  res.json(estimate);
});

// 4. Activate Supply via Smart Allocation Engine
router.post('/:id/activate', authenticateToken, (req, res) => {
  const event = db.getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const candidateSpaces = db.getAllSpaces().filter(s => s.venueId === event.id);
  const estimate = estimateEventDemand({
    attendance: event.expectedAttendance,
    eventType: event.eventType,
    officialCapacity: event.officialCapacity
  });

  const allocationResult = scoreAndRankSpaces({
    venueCoords: event.location,
    spaces: candidateSpaces,
    eventType: event.eventType,
    predictedDemand: estimate.predictedDemand
  });

  // Update space statuses in database
  allocationResult.activatedSpaces.forEach(s => {
    const dbSpace = db.getSpaceById(s.id);
    if (dbSpace) {
      dbSpace.isActivated = true;
      dbSpace.isReservePool = false;
      dbSpace.allocationScore = s.allocationScore;
    }
  });

  allocationResult.reservePoolSpaces.forEach(s => {
    const dbSpace = db.getSpaceById(s.id);
    if (dbSpace) {
      dbSpace.isActivated = true;
      dbSpace.isReservePool = true;
      dbSpace.allocationScore = s.allocationScore;
    }
  });

  // Emit real-time Socket.io notification if socket is attached
  if (req.app.get('io')) {
    req.app.get('io').emit('allocation:activated', {
      eventId: event.id,
      activatedCount: allocationResult.activatedSpaces.length,
      reserveCount: allocationResult.reservePoolSpaces.length,
      totalCapacity: allocationResult.totalActivatedCapacity
    });
  }

  res.json({
    message: 'Supply activated successfully via Smart Allocation Engine',
    allocationResult
  });
});

// 5. Host creates new event
router.post('/', authenticateToken, requireRole(['host', 'admin']), (req, res) => {
  const { name, eventType, location, expectedAttendance, officialCapacity, startDate, endDate, description } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  const newEvent = {
    id: `venue_${Date.now()}`,
    name,
    eventType: eventType || 'concert',
    category: eventType ? eventType.replace('_', ' ').toUpperCase() : 'CONCERT',
    location,
    expectedAttendance: parseInt(expectedAttendance) || 5000,
    officialCapacity: parseInt(officialCapacity) || 200,
    startDate: startDate || new Date(Date.now() + 86400000).toISOString(),
    endDate: endDate || new Date(Date.now() + 86400000 + 14400000).toISOString(),
    description: description || 'Community and city event',
    status: 'pending_approval',
    hostId: req.user.id,
    createdAt: new Date().toISOString()
  };

  db.saveEvent(newEvent);
  res.status(201).json(newEvent);
});

export default router;
