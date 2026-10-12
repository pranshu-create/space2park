// Hybrid Demand Estimator (Stage A: Rule-Based Baseline with P10–P90 Confidence Bands)

export const EVENT_PARAMETERS = {
  stadium_match: {
    name: 'Stadium Match',
    privateVehicleShare: 0.45,
    personsPerVehicle: 2.5,
    peakFactor: 1.35,
    description: 'High burst ingress 90 mins before start; heavy distance-sensitive demand'
  },
  concert: {
    name: 'Concert / Music Fest',
    privateVehicleShare: 0.50,
    personsPerVehicle: 2.4,
    peakFactor: 1.40,
    description: 'Intense evening surge with late-night egress traffic'
  },
  college_fest: {
    name: 'College / Campus Fest',
    privateVehicleShare: 0.35,
    personsPerVehicle: 2.2,
    peakFactor: 1.25,
    description: 'High two-wheeler share (65%) and distributed multi-day attendance'
  },
  exhibition: {
    name: 'Exhibition / Expo / Convention',
    privateVehicleShare: 0.40,
    personsPerVehicle: 2.0,
    peakFactor: 1.20,
    description: 'Steady all-day commercial footfall; high business traveler vehicle share'
  },
  food_bazaar: {
    name: 'Food Bazaar / Night Market',
    privateVehicleShare: 0.55,
    personsPerVehicle: 2.6,
    peakFactor: 1.30,
    description: 'High weekend peak with rapid slot turnover cycles (~90 min stay)'
  },
  cultural_festival: {
    name: 'Cultural Festival / Fair',
    privateVehicleShare: 0.42,
    personsPerVehicle: 2.8,
    peakFactor: 1.25,
    description: 'Multi-generational family vehicle mix with higher persons per vehicle'
  }
};

export function estimateEventDemand({
  attendance,
  eventType = 'concert',
  officialCapacity = 0,
  customParams = null
}) {
  const baseParams = EVENT_PARAMETERS[eventType] || EVENT_PARAMETERS.concert;
  const p = customParams ? { ...baseParams, ...customParams } : baseParams;

  // Baseline Stage A Formula:
  // D = Attendance * PrivateVehicleShare / PersonsPerVehicle * PeakFactor - ExistingOfficialCapacity
  const rawVehicles = (attendance * p.privateVehicleShare) / p.personsPerVehicle;
  const peakDemand = Math.round(rawVehicles * p.peakFactor);
  const netDeficit = Math.max(0, peakDemand - officialCapacity);

  // Confidence Bands: P10 (conservative/favorable transit) and P90 (high private vehicle surge)
  const p10Share = Math.max(0.2, p.privateVehicleShare - 0.06);
  const p10Persons = p.personsPerVehicle + 0.3;
  const p10Peak = Math.max(1.0, p.peakFactor - 0.1);
  const p10Demand = Math.max(0, Math.round(((attendance * p10Share) / p10Persons) * p10Peak) - officialCapacity);

  const p90Share = Math.min(0.85, p.privateVehicleShare + 0.08);
  const p90Persons = Math.max(1.5, p.personsPerVehicle - 0.3);
  const p90Peak = p.peakFactor + 0.15;
  const p90Demand = Math.max(0, Math.round(((attendance * p90Share) / p90Persons) * p90Peak) - officialCapacity);

  // 10% Reserve Pool allocation
  const reservePoolSlots = Math.round(netDeficit * 0.10);
  const publicAllocatedSlots = netDeficit;
  const totalRecommendedCapacity = netDeficit + reservePoolSlots;

  return {
    eventType,
    attendance,
    officialCapacity,
    parametersUsed: p,
    stage: 'Stage A: Rule-Based Baseline',
    predictedDemand: netDeficit,
    confidenceInterval: {
      p10: p10Demand,
      p50: netDeficit,
      p90: p90Demand,
      confidenceScore: 0.88
    },
    recommendations: {
      publicCapacityTarget: publicAllocatedSlots,
      reservePoolTarget: reservePoolSlots,
      totalCapacityTarget: totalRecommendedCapacity,
      carShareSlots: Math.round(netDeficit * 0.70),
      bikeShareSlots: Math.round(netDeficit * 0.30)
    },
    roadmap: 'rule-based baseline → gradient boosting after 20 to 50 events → LSTM as data grows'
  };
}
