import { test, describe } from 'node:test';
import assert from 'node:assert';
import { estimateEventDemand, EVENT_PARAMETERS } from '../src/core/demandEstimator.js';
import { scoreAndRankSpaces } from '../src/core/allocationEngine.js';
import { signQRPayload, verifyQRPayload } from '../src/core/qrSigner.js';
import { lockStore } from '../src/db/redis.js';

describe('Phase 2 & 3: Core Logic & Acceptance Tests', () => {
  // Test 1: Hybrid Demand Estimator Worked Example
  test('Hybrid Demand Estimator calculates worked example correctly', () => {
    // Spec worked example: 20,000 * 0.45 / 2.5 = 3,600; minus 1,200 official = 2,400 slots
    const result = estimateEventDemand({
      attendance: 20000,
      eventType: 'stadium_match',
      officialCapacity: 1200,
      customParams: {
        privateVehicleShare: 0.45,
        personsPerVehicle: 2.5,
        peakFactor: 1.0 // for direct worked example baseline
      }
    });

    assert.strictEqual(result.predictedDemand, 2400);
    assert.ok(result.confidenceInterval.p10 > 0);
    assert.ok(result.confidenceInterval.p90 > result.confidenceInterval.p10);
    assert.strictEqual(result.recommendations.reservePoolTarget, 240); // 10% reserve pool
  });

  // Test 2: Smart Allocation Engine and Σ x_i · c_i >= D constraint
  test('Smart Allocation Engine satisfies Σ x_i · c_i >= D and 10% reserve pool', () => {
    const venueCoords = { lat: 22.7244, lng: 75.8839 };
    const mockSpaces = [
      { id: 's1', name: 'Space 1', location: { lat: 22.7250, lng: 75.8845 }, pricePerHour: 40, totalCapacity: 50, availableSlots: 50, reliabilityScore: 0.95 },
      { id: 's2', name: 'Space 2', location: { lat: 22.7270, lng: 75.8860 }, pricePerHour: 50, totalCapacity: 40, availableSlots: 40, reliabilityScore: 0.90 },
      { id: 's3', name: 'Space 3', location: { lat: 22.7290, lng: 75.8880 }, pricePerHour: 30, totalCapacity: 60, availableSlots: 60, reliabilityScore: 0.85 },
      { id: 's4', name: 'Space 4', location: { lat: 22.7310, lng: 75.8900 }, pricePerHour: 35, totalCapacity: 45, availableSlots: 45, reliabilityScore: 0.80 }
    ];

    const result = scoreAndRankSpaces({
      venueCoords,
      spaces: mockSpaces,
      eventType: 'stadium_match',
      predictedDemand: 100
    });

    assert.ok(result.constraintSatisfied, 'Constraint Σ x_i · c_i >= D must be satisfied');
    assert.ok(result.totalActivatedCapacity >= 100);
    assert.ok(result.reservePoolSpaces.length > 0, 'Must have spaces allocated to reserve pool');
    assert.ok(result.activatedSpaces.length > 0, 'Must have activated public spaces');
  });

  // Test 3: Signed QR Generation and Tamper-Proof Detection
  test('Signed QR verification passes valid pass and rejects tampered signature', () => {
    const original = {
      bookingId: 'bkg_12345',
      spaceId: 'space_holkar_west',
      slotCode: 'A-04',
      vehicleNumber: 'MP 09 AB 1234',
      validFrom: '2026-10-12T18:00:00Z',
      validUntil: '2026-10-12T22:00:00Z'
    };

    const signed = signQRPayload(original);
    assert.ok(signed.qrData.sig, 'Must generate HMAC signature');

    // Verification of unmodified pass
    const validCheck = verifyQRPayload(signed.qrString, 'MP 09 AB 1234');
    assert.strictEqual(validCheck.valid, true);

    // Tampered payload (altered slotCode)
    const tamperedPayload = { ...signed.qrData, slotCode: 'VIP-99' };
    const tamperCheck = verifyQRPayload(tamperedPayload);
    assert.strictEqual(tamperCheck.valid, false);
    assert.ok(tamperCheck.error.includes('TAMPER_DETECTED'));

    // Tampered vehicle
    const vehicleMismatch = verifyQRPayload(signed.qrString, 'MP 09 FAKE 9999');
    assert.strictEqual(vehicleMismatch.valid, false);
    assert.ok(vehicleMismatch.error.includes('VEHICLE_MISMATCH'));
  });

  // Test 4: Redis Lock TTL & Expiry
  test('Atomic LockStore acquires, rejects concurrent, and expires correctly', async () => {
    const key = `test_lock_${Date.now()}`;
    const user1 = 'user_seeker_1';
    const user2 = 'user_seeker_2';

    // User 1 acquires lock
    const res1 = await lockStore.acquireLock(key, user1, 100); // 100ms TTL for test
    assert.strictEqual(res1.success, true);

    // User 2 tries to acquire same lock immediately -> rejected
    const res2 = await lockStore.acquireLock(key, user2, 100);
    assert.strictEqual(res2.success, false);

    // Wait 120ms for lock to expire
    await new Promise(resolve => setTimeout(resolve, 120));

    // User 2 tries after expiration -> succeeds
    const res3 = await lockStore.acquireLock(key, user2, 100);
    assert.strictEqual(res3.success, true);

    // Release lock
    await lockStore.releaseLock(key, user2);
    const lockCheck = await lockStore.getLock(key);
    assert.strictEqual(lockCheck, null);
  });
});
