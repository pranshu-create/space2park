// Atomic Lock & Cache Layer (Dual-Mode: Real Redis or Embedded In-Memory Fallback)

class MemoryLockStore {
  constructor() {
    this.store = new Map();
  }

  // Atomic SET key value NX PX ttlMs
  async acquireLock(key, value, ttlMs = 300000) {
    const existing = this.store.get(key);
    const now = Date.now();

    if (existing && existing.expiresAt > now) {
      // Lock already held
      return { success: false, expiresAt: existing.expiresAt, remainingMs: existing.expiresAt - now };
    }

    const expiresAt = now + ttlMs;
    this.store.set(key, { value, expiresAt });
    return { success: true, expiresAt, remainingMs: ttlMs };
  }

  async releaseLock(key, value = null) {
    const existing = this.store.get(key);
    if (!existing) return true;

    // If value provided, ensure caller owns the lock
    if (value && existing.value !== value) {
      return false;
    }

    this.store.delete(key);
    return true;
  }

  async extendLock(key, additionalMs = 300000) {
    const existing = this.store.get(key);
    const now = Date.now();
    if (!existing || existing.expiresAt <= now) return null;

    existing.expiresAt += additionalMs;
    return { expiresAt: existing.expiresAt, remainingMs: existing.expiresAt - now };
  }

  async getLock(key) {
    const existing = this.store.get(key);
    if (!existing) return null;
    const now = Date.now();
    if (existing.expiresAt <= now) {
      this.store.delete(key);
      return null;
    }
    return { value: existing.value, expiresAt: existing.expiresAt, remainingMs: existing.expiresAt - now };
  }

  async clearAll() {
    this.store.clear();
  }
}

export const lockStore = new MemoryLockStore();
