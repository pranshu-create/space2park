import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { app, server } from '../src/index.js';

describe('Phase 4–7: End-to-End API Integration & Role Verification', () => {
  let baseUrl;
  let testServer;
  let seekerToken;
  let adminToken;
  let ownerToken;

  before(async () => {
    // Start test server on dynamic free port
    testServer = http.createServer(app);
    await new Promise(resolve => testServer.listen(0, resolve));
    const port = testServer.address().port;
    baseUrl = `http://localhost:${port}`;

    // Obtain demo JWT tokens for roles
    const seekerRes = await fetch(`${baseUrl}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'seeker' })
    });
    const seekerData = await seekerRes.json();
    seekerToken = seekerData.token;

    const adminRes = await fetch(`${baseUrl}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' })
    });
    const adminData = await adminRes.json();
    adminToken = adminData.token;

    const ownerRes = await fetch(`${baseUrl}/api/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'owner' })
    });
    const ownerData = await ownerRes.json();
    ownerToken = ownerData.token;
  });

  after(() => {
    testServer.close();
  });

  // 1. Health check
  test('GET /api/health returns 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.platform, 'SPACE2PARK');
    assert.ok(data.totalSpaces > 0);
  });

  // 2. Events discovery & demand readiness
  test('GET /api/events returns enriched Indore venues with readiness percentages', async () => {
    const res = await fetch(`${baseUrl}/api/events`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 4);

    const holkar = data.find(e => e.id === 'venue_holkar' || e.name.includes('Holkar'));
    assert.ok(holkar);
    assert.ok(holkar.demandEstimate);
    assert.ok(holkar.nearbyStats);
    assert.ok(holkar.nearbyStats.supplyCoveragePct !== undefined);
  });

  // 3. Spaces discovery & filtering
  test('GET /api/spaces returns candidate spaces with prices and facilities', async () => {
    const res = await fetch(`${baseUrl}/api/spaces`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);

    const sample = data[0];
    assert.ok(sample.pricePerHour > 0);
    assert.ok(sample.totalCapacity > 0);
    assert.strictEqual(sample.isReservePool, false, 'Reserve pool must be hidden from public list');
  });

  // 4. Seeker Flow: Lock slot, Book slot, Generate Signed QR, and Retrieve Pass
  test('Seeker Flow: Atomic slot lock -> Booking creation -> Signed QR issuance', async () => {
    const spacesRes = await fetch(`${baseUrl}/api/spaces`);
    const spaces = await spacesRes.json();
    const testSpace = spaces[0];

    // Step A: Lock slot on space
    const lockRes = await fetch(`${baseUrl}/api/spaces/${testSpace.id}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`
      },
      body: JSON.stringify({ slotCode: 'A-01', vehicleMode: 'car' })
    });

    assert.strictEqual(lockRes.status, 200);
    const lockData = await lockRes.json();
    assert.ok(lockData.lockToken);
    assert.ok(lockData.expiresAt);

    // Step B: Create booking with signed QR
    const bookRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`
      },
      body: JSON.stringify({
        spaceId: testSpace.id,
        slotCode: 'A-01',
        vehicleNumber: 'MP 09 TC 9999',
        vehicleType: 'car',
        hours: 2,
        demoOutcome: 'success'
      })
    });

    assert.strictEqual(bookRes.status, 201);
    const bookData = await bookRes.json();
    assert.strictEqual(bookData.booking.status, 'confirmed');
    assert.ok(bookData.booking.qrSignature, 'Booking must have HMAC signature');
    assert.ok(bookData.booking.qrString, 'Booking must have QR data payload string');

    const createdBookingId = bookData.booking.id;

    // Step C: Retrieve user's bookings
    const myRes = await fetch(`${baseUrl}/api/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert.strictEqual(myRes.status, 200);
    const myBookings = await myRes.json();
    const found = myBookings.find(b => b.id === createdBookingId);
    assert.ok(found);

    // Step D: Report problem and verify automated 10% reserve pool re-assignment
    const reportRes = await fetch(`${baseUrl}/api/bookings/${createdBookingId}/report-occupied`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`
      },
      body: JSON.stringify({ reason: 'Obstruction at bay' })
    });
    assert.strictEqual(reportRes.status, 200);
    const reportData = await reportRes.json();
    assert.ok(reportData.newSpace);
    assert.ok(reportData.booking.reallocatedAt);
  });

  // 5. Owner Flow: QR Scanner Check-in
  test('Owner Flow: Scans seeker QR pass to validate and trigger check-in', async () => {
    // Create a fresh booking for check-in test
    const spacesRes = await fetch(`${baseUrl}/api/spaces`);
    const spaces = await spacesRes.json();
    const space = spaces[1] || spaces[0];

    const bookRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`
      },
      body: JSON.stringify({
        spaceId: space.id,
        slotCode: 'A-05',
        vehicleNumber: 'MP 09 CHECK 1',
        hours: 2,
        demoOutcome: 'success'
      })
    });
    const bookData = await bookRes.json();
    const qrPayload = bookData.booking.qrString;

    // Owner scans QR code
    const scanRes = await fetch(`${baseUrl}/api/owner/scan-checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        qrPayload,
        scanAction: 'check_in'
      })
    });

    assert.strictEqual(scanRes.status, 200);
    const scanData = await scanRes.json();
    assert.strictEqual(scanData.status, 'checked_in');
    assert.strictEqual(scanData.slotCode, 'A-05');
  });

  // 6. Admin Authority Flow: KPIs, Hotspots & Verification Queue
  test('Admin Flow: Retrieves Authority KPIs, cruising distance saved, CO2 proxy, and queue', async () => {
    const authRes = await fetch(`${baseUrl}/api/admin/authority`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(authRes.status, 200);
    const authData = await authRes.json();
    assert.ok(authData.metrics);
    assert.ok(authData.metrics.networkUtilisationPct !== undefined);
    assert.ok(authData.metrics.estimatedCruisingKmSaved > 0);
    assert.ok(authData.metrics.estimatedCO2SavedKg > 0);
    assert.ok(authData.honestyCaveat.includes('Impact is measured through platform KPIs'));

    // Verification Queue with Risk Flags
    const queueRes = await fetch(`${baseUrl}/api/admin/verifications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(queueRes.status, 200);
    const queueData = await queueRes.json();
    assert.ok(Array.isArray(queueData.pendingItems));
    assert.ok(queueData.pendingItems.length > 0);
  });

  // 7. RBAC Security: Non-admin denied from admin authority endpoints
  test('RBAC: Seeker token is denied access to admin authority endpoints (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/authority`, {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes('Unauthorized role'));
  });
});
