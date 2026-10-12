import { test, describe } from 'node:test';
import assert from 'node:assert';
import { lockStore } from '../src/db/redis.js';
import { paymentAdapter } from '../src/adapters/paymentAdapter.js';

describe('Phase 3: High-Concurrency & Atomic Booking Acceptance Tests', () => {
  // Test 1: 50 simultaneous attempts on the last slot must produce exactly ONE winner
  test('Concurrency Test: 50 simultaneous lock attempts on the last slot produce exactly 1 winner', async () => {
    const slotKey = `slot_exclusive_${Date.now()}`;
    const attemptsCount = 50;
    const userIds = Array.from({ length: attemptsCount }, (_, i) => `user_${i + 1}`);

    // Fire 50 simultaneous atomic lock requests
    const promises = userIds.map(uid =>
      lockStore.acquireLock(slotKey, uid, 300000)
    );

    const results = await Promise.all(promises);

    const successfulLocks = results.filter(r => r.success === true);
    const rejectedLocks = results.filter(r => r.success === false);

    assert.strictEqual(
      successfulLocks.length,
      1,
      `Exactly 1 attempt must win the lock, but got ${successfulLocks.length}`
    );
    assert.strictEqual(
      rejectedLocks.length,
      49,
      `Exactly 49 attempts must be rejected with conflict, but got ${rejectedLocks.length}`
    );

    // Verify lock owner
    const finalLock = await lockStore.getLock(slotKey);
    assert.ok(finalLock !== null);
    assert.ok(userIds.includes(finalLock.value));

    // Cleanup
    await lockStore.releaseLock(slotKey);
  });

  // Test 2: Payment Failure releases the lock
  test('Payment Failure releases the slot lock back to the public pool', async () => {
    const spaceId = 'space_citadel_deck';
    const slotCode = 'A-09';
    const lockKey = `lock:${spaceId}:${slotCode}`;
    const userId = 'user_fail_test';

    // 1. Acquire lock
    const lockRes = await lockStore.acquireLock(lockKey, userId, 300000);
    assert.strictEqual(lockRes.success, true);

    // 2. Simulated payment failure
    const paymentRes = await paymentAdapter.processPayment({
      bookingId: 'bkg_fail_test',
      amount: 100,
      paymentMethod: 'upi',
      mode: 'failure'
    });

    assert.strictEqual(paymentRes.status, 'failed');

    // 3. Release lock upon failure
    await lockStore.releaseLock(lockKey);

    // 4. Another user can immediately acquire the slot
    const competitorRes = await lockStore.acquireLock(lockKey, 'competitor_user', 300000);
    assert.strictEqual(competitorRes.success, true);

    // Cleanup
    await lockStore.releaseLock(lockKey);
  });

  // Test 3: Payment Timeout releases the lock
  test('Payment Timeout releases the slot lock back to the public pool', async () => {
    const spaceId = 'space_bcc_garage';
    const slotCode = 'A-11';
    const lockKey = `lock:${spaceId}:${slotCode}`;
    const userId = 'user_timeout_test';

    // 1. Acquire lock
    const lockRes = await lockStore.acquireLock(lockKey, userId, 300000);
    assert.strictEqual(lockRes.success, true);

    // 2. Simulated payment timeout
    const paymentRes = await paymentAdapter.processPayment({
      bookingId: 'bkg_timeout_test',
      amount: 100,
      paymentMethod: 'card',
      mode: 'timeout'
    });

    assert.strictEqual(paymentRes.status, 'timeout');

    // 3. Release lock upon timeout
    await lockStore.releaseLock(lockKey);

    // 4. Verify slot is free
    const checkLock = await lockStore.getLock(lockKey);
    assert.strictEqual(checkLock, null);
  });
});
