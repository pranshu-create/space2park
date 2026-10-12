// Maps Adapter: Distance Matrix & Walking Route calculation with server caching

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Great circle distance in meters
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in metres
}

// Estimates actual walking distance by applying urban street grid factor (1.32x)
export function calculateWalkingDistance(lat1, lon1, lat2, lon2) {
  const straightDistanceMeters = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  const walkingDistanceMeters = Math.round(straightDistanceMeters * 1.32);
  
  // Average walking speed ~ 4.8 km/h = 80 metres/minute
  const walkingMinutes = Math.max(1, Math.round(walkingDistanceMeters / 80));
  
  // Average city drive speed ~ 24 km/h = 400 metres/minute
  const drivingMinutes = Math.max(1, Math.round(walkingDistanceMeters / 400));

  return {
    distanceMeters: walkingDistanceMeters,
    distanceKm: (walkingDistanceMeters / 1000).toFixed(2),
    walkingMinutes,
    drivingMinutes
  };
}
