// Smart Allocation Engine (Multi-criteria Normalized Scoring & Capacity Coverage)
import { calculateWalkingDistance } from '../adapters/mapsAdapter.js';

export const ALLOCATION_WEIGHTS = {
  stadium_match: { w_d: 0.40, w_p: 0.15, w_a: 0.20, w_c: 0.15, w_h: 0.10 },
  concert: { w_d: 0.30, w_p: 0.25, w_a: 0.20, w_c: 0.15, w_h: 0.10 },
  college_fest: { w_d: 0.20, w_p: 0.40, w_a: 0.15, w_c: 0.15, w_h: 0.10 },
  exhibition: { w_d: 0.30, w_p: 0.20, w_a: 0.25, w_c: 0.15, w_h: 0.10 },
  food_bazaar: { w_d: 0.35, w_p: 0.20, w_a: 0.25, w_c: 0.10, w_h: 0.10 },
  cultural_festival: { w_d: 0.30, w_p: 0.20, w_a: 0.20, w_c: 0.20, w_h: 0.10 }
};

export function scoreAndRankSpaces({
  venueCoords,
  spaces,
  eventType = 'concert',
  predictedDemand = 100
}) {
  const weights = ALLOCATION_WEIGHTS[eventType] || ALLOCATION_WEIGHTS.concert;

  // 1. Calculate raw terms for each candidate space
  const processed = spaces.map(space => {
    const route = calculateWalkingDistance(
      venueCoords.lat,
      venueCoords.lng,
      space.location.lat,
      space.location.lng
    );

    const distanceKm = parseFloat(route.distanceKm);
    const price = Math.max(10, space.pricePerHour || 40);
    const availabilityRate = Math.min(1.0, Math.max(0.0, (space.availableSlots || 1) / (space.totalCapacity || 1)));
    const capacity = space.totalCapacity || 1;
    const historyPreference = space.reliabilityScore || 0.85;

    return {
      space,
      route,
      raw: {
        invDistance: 1 / (1 + distanceKm),
        invPrice: 1 / price,
        availability: availabilityRate,
        capacity,
        history: historyPreference
      }
    };
  });

  if (processed.length === 0) return { activated: [], reserve: [], allRanked: [] };

  // 2. Min-Max Normalisation of all terms to [0, 1]
  const minMax = {
    invDistMin: Math.min(...processed.map(p => p.raw.invDistance)),
    invDistMax: Math.max(...processed.map(p => p.raw.invDistance)),
    invPriceMin: Math.min(...processed.map(p => p.raw.invPrice)),
    invPriceMax: Math.max(...processed.map(p => p.raw.invPrice)),
    capMax: Math.max(...processed.map(p => p.raw.capacity)),
  };

  const scoredSpaces = processed.map(item => {
    const normDist =
      minMax.invDistMax === minMax.invDistMin
        ? 1.0
        : (item.raw.invDistance - minMax.invDistMin) / (minMax.invDistMax - minMax.invDistMin);

    const normPrice =
      minMax.invPriceMax === minMax.invPriceMin
        ? 1.0
        : (item.raw.invPrice - minMax.invPriceMin) / (minMax.invPriceMax - minMax.invPriceMin);

    const normCap = minMax.capMax > 0 ? item.raw.capacity / minMax.capMax : 1.0;
    const normAvail = item.raw.availability;
    const normHist = item.raw.history;

    const totalScore =
      weights.w_d * normDist +
      weights.w_p * normPrice +
      weights.w_a * normAvail +
      weights.w_c * normCap +
      weights.w_h * normHist;

    return {
      ...item.space,
      route: item.route,
      allocationScore: parseFloat(totalScore.toFixed(4)),
      scoreBreakdown: {
        distanceScore: parseFloat((weights.w_d * normDist).toFixed(3)),
        priceScore: parseFloat((weights.w_p * normPrice).toFixed(3)),
        availabilityScore: parseFloat((weights.w_a * normAvail).toFixed(3)),
        capacityScore: parseFloat((weights.w_c * normCap).toFixed(3)),
        reliabilityScore: parseFloat((weights.w_h * normHist).toFixed(3))
      }
    };
  });

  // Sort descending by score
  scoredSpaces.sort((a, b) => b.allocationScore - a.allocationScore);

  // 3. Supply Activation: Select top-k spaces subject to Sum(x_i * c_i) >= predictedDemand
  let accumulatedCapacity = 0;
  const activatedSpaces = [];
  const reservePoolSpaces = [];

  const targetWithReserve = Math.round(predictedDemand * 1.10);

  for (const space of scoredSpaces) {
    if (accumulatedCapacity < targetWithReserve) {
      accumulatedCapacity += space.totalCapacity;
      
      // If we are within the top 90% of required demand, it's public
      if (accumulatedCapacity <= predictedDemand) {
        activatedSpaces.push({ ...space, pool: 'public', isActivated: true });
      } else {
        // Last 10% overflow is assigned to the reserve pool
        reservePoolSpaces.push({ ...space, pool: 'reserve', isActivated: true });
      }
    } else {
      break;
    }
  }

  // If candidate supply was smaller than demand, ensure at least one space is in reserve
  if (reservePoolSpaces.length === 0 && activatedSpaces.length > 1) {
    reservePoolSpaces.push(activatedSpaces.pop());
  }

  return {
    allRanked: scoredSpaces,
    activatedSpaces,
    reservePoolSpaces,
    totalActivatedCapacity: accumulatedCapacity,
    targetDemand: predictedDemand,
    constraintSatisfied: accumulatedCapacity >= predictedDemand
  };
}
