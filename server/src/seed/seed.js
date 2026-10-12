// Synthetic Seed Data: Indore, MP (Clearly marked SYNTHETIC DEMO DATA)
import { db } from '../db/index.js';
import { hashPassword } from '../middleware/auth.js';

export const VENUES = [
  {
    id: 'venue_holkar',
    name: 'Holkar Cricket Stadium',
    eventType: 'stadium_match',
    category: 'Stadium Match',
    location: { lat: 22.7244, lng: 75.8752, address: 'Race Course Road, New Palasia, Indore, MP 452001' },
    officialCapacity: 1200,
    expectedAttendance: 25000,
    description: 'Premier international cricket stadium with heavy multi-gate influx',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'venue_brilliant',
    name: 'Brilliant Convention Centre',
    eventType: 'concert',
    category: 'Concert & Expo',
    location: { lat: 22.7608, lng: 75.8894, address: 'Scheme 78, Vijay Nagar, Indore, MP 452010' },
    officialCapacity: 600,
    expectedAttendance: 14000,
    description: 'High-volume international exhibition and live music pavilion in Vijay Nagar',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'venue_chappan',
    name: 'Chappan Dukan',
    eventType: 'food_bazaar',
    category: 'Food Bazaar',
    location: { lat: 22.7236, lng: 75.8821, address: '56 Shops Arcade, New Palasia, Indore, MP 452001' },
    officialCapacity: 80,
    expectedAttendance: 4500,
    description: 'Famous culinary destination featuring high customer turnover and pedestrian streets',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'venue_sarafa',
    name: 'Sarafa Night Bazaar',
    eventType: 'food_bazaar',
    category: 'Night Food Market',
    location: { lat: 22.7188, lng: 75.8548, address: 'Sarafa Jewellers Market, Old Indore, MP 452002' },
    officialCapacity: 60,
    expectedAttendance: 6000,
    description: 'Late night vibrant street food haven in the historic jewellery district',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'venue_rajwada',
    name: 'Rajwada Palace Cultural Square',
    eventType: 'cultural_festival',
    category: 'Cultural Festival',
    location: { lat: 22.7180, lng: 75.8552, address: 'Rajwada, M.G. Road, Indore, MP 452004' },
    officialCapacity: 150,
    expectedAttendance: 12000,
    description: 'Seven-story historic Holkar palace plaza hosting cultural fairs and celebrations',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'venue_iit',
    name: 'IIT Indore Campus Quad',
    eventType: 'college_fest',
    category: 'College Fest',
    location: { lat: 22.7801, lng: 75.8202, address: 'Super Corridor Innovation Corridor, Indore, MP' },
    officialCapacity: 300,
    expectedAttendance: 8500,
    description: 'Flagship annual technical and cultural fest with university student turnout',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'venue_lalbagh',
    name: 'Lalbagh Palace Grounds',
    eventType: 'exhibition',
    category: 'Exhibition & Fair',
    location: { lat: 22.7001, lng: 75.8454, address: 'Kesar Bagh Road, Lal Bagh, Indore, MP 452006' },
    officialCapacity: 400,
    expectedAttendance: 10000,
    description: 'Sprawling European-style palace grounds hosting handicraft fairs and trade expos',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=1200&q=80'
  }
];

export const DEMO_USERS = [
  {
    id: 'user_seeker_1',
    name: 'Arjun Mehta',
    email: 'seeker@space2park.com',
    role: 'seeker',
    phone: '+91 98260 11223',
    vehicleNumber: 'MP 09 WZ 4821',
    vehicleType: 'Car',
    vehicleModel: 'Porsche Taycan EV',
    walletBalance: 4200
  },
  {
    id: 'user_owner_1',
    name: 'Vikramaditya Solanki',
    email: 'owner@space2park.com',
    role: 'owner',
    phone: '+91 98260 44556',
    trustScore: 4.92,
    verificationTier: 'Tier 2 (Admin Verified)',
    totalEarnings: 34500
  },
  {
    id: 'user_host_1',
    name: 'Indore Events Authority (Ramesh Vyas)',
    email: 'host@space2park.com',
    role: 'host',
    phone: '+91 98260 77889',
    organization: 'Indore Mega Fests & Sports Council'
  },
  {
    id: 'user_admin_1',
    name: 'Admin Desk (Syntax Error)',
    email: 'admin@space2park.com',
    role: 'admin',
    phone: '+91 98260 99000',
    department: 'Smart Mobility Taskforce, MP-09'
  }
];

export function generateSyntheticSpaces() {
  const spaces = [];
  let spaceIndex = 1;

  const spaceTypes = [
    { type: 'Commercial Plaza Basement', prefix: 'Grand Deck', fee: 50, carCap: 30, bikeCap: 50 },
    { type: 'Private Residential Driveway', prefix: 'Society Gate', fee: 35, carCap: 8, bikeCap: 15 },
    { type: 'School / College Forecourt', prefix: 'Campus Ground', fee: 30, carCap: 40, bikeCap: 80 },
    { type: 'Shop & Office Forecourt', prefix: 'Commercial Arcade', fee: 40, carCap: 12, bikeCap: 25 },
    { type: 'Hotel Subterranean Garage', prefix: 'Pavilion Deck', fee: 60, carCap: 25, bikeCap: 30 },
    { type: 'Secured Empty Commercial Plot', prefix: 'Enclosed Ground', fee: 25, carCap: 35, bikeCap: 60 }
  ];

  // Distribute 40-50 spaces around each of the 7 venues (within 0.2 km - 1.8 km radius)
  for (const venue of VENUES) {
    for (let i = 0; i < 45; i++) {
      const typeConfig = spaceTypes[i % spaceTypes.length];
      
      // Jitter coordinates realistically by ~0.002 to ~0.015 degrees (~200m to 1.6km)
      const angle = (i * 37) * (Math.PI / 180);
      const distanceFraction = 0.003 + (i % 7) * 0.0018;
      const lat = venue.location.lat + Math.sin(angle) * distanceFraction;
      const lng = venue.location.lng + Math.cos(angle) * distanceFraction;

      const spaceId = `space_ind_${venue.id.replace('venue_', '')}_${i + 1}`;
      const totalCap = typeConfig.carCap;
      const occupied = Math.floor(totalCap * (0.2 + (i % 5) * 0.12));
      const available = Math.max(1, totalCap - occupied);

      spaces.push({
        id: spaceId,
        venueId: venue.id,
        ownerId: 'user_owner_1',
        name: `${venue.name.split(' ')[0]} ${typeConfig.prefix} Bay #${i + 1}`,
        type: typeConfig.type,
        address: `${venue.location.address.split(',')[0]} Sector ${String.fromCharCode(65 + (i % 4))}, Indore`,
        location: { lat, lng },
        pricePerHour: typeConfig.fee + ((i % 3) * 5),
        floorPrice: typeConfig.fee - 5,
        capPrice: (typeConfig.fee + 15) * 1.5,
        totalCapacity: totalCap,
        availableSlots: available,
        occupiedSlots: occupied,
        bikeCapacity: typeConfig.bikeCap,
        availableBikes: Math.floor(typeConfig.bikeCap * 0.7),
        isAccessible: i % 4 === 0,
        hasEVCharging: i % 3 === 0,
        hasCCTV: true,
        hasCoveredRoof: i % 2 === 0,
        hasValet: i % 5 === 0,
        reliabilityScore: parseFloat((0.85 + (i % 15) * 0.01).toFixed(2)),
        verificationStatus: 'verified',
        verificationTier: 'Tier 1 Auto-Checked',
        anprEnabled: true,
        isReservePool: false, // Updated dynamically by allocation engine
        rating: parseFloat((4.5 + (i % 5) * 0.1).toFixed(1)),
        reviewCount: 45 + (i * 7),
        photos: [
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
        ]
      });
      spaceIndex++;
    }
  }

  return spaces;
}

export function seedDatabase() {
  console.log('🌱 Seeding SPACE2PARK Database (Indore Synthetic Dataset)...');

  // 1. Seed Users
  const defaultPasswordHash = hashPassword('password123');
  for (const user of DEMO_USERS) {
    db.saveUser({
      ...user,
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString()
    });
  }

  // 2. Seed Venues / Events
  for (const venue of VENUES) {
    db.saveEvent({
      ...venue,
      status: 'active',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000 + 14400000).toISOString(),
      createdAt: new Date().toISOString()
    });
  }

  // 3. Seed Spaces
  const spaces = generateSyntheticSpaces();
  for (const space of spaces) {
    db.saveSpace(space);
  }

  // 4. Seed sample past bookings for demo realism
  const sampleBookings = [
    {
      id: 'bkg_ind_884920',
      userId: 'user_seeker_1',
      spaceId: spaces[0].id,
      venueId: VENUES[0].id,
      slotCode: 'A-12',
      vehicleNumber: 'MP 09 WZ 4821',
      amount: 130,
      status: 'confirmed',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
      qrSignature: '0x8849-TAYCAN-INDORE',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  for (const booking of sampleBookings) {
    db.saveBooking(booking);
  }

  db.initialized = true;
  console.log(`✅ Seeded ${DEMO_USERS.length} Demo Users, ${VENUES.length} Venues, and ${spaces.length} Nearby Parking Spaces!`);
}
