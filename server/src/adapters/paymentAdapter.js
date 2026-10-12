import crypto from 'crypto';

class PaymentAdapter {
  constructor() {
    this.processedIdempotencyKeys = new Set();
  }

  // Simulated Payment Checkout
  // mode: 'success' | 'failure' | 'timeout'
  async processPayment({ bookingId, amount, paymentMethod, idempotencyKey, mode = 'success' }) {
    if (idempotencyKey && this.processedIdempotencyKeys.has(idempotencyKey)) {
      return {
        status: 'duplicate',
        message: 'Transaction already processed for this idempotency key',
        transactionId: `txn_idem_${idempotencyKey.slice(0, 10)}`
      };
    }

    const transactionId = `TXN_S2P_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Handle Demo Scenarios
    if (mode === 'failure') {
      return {
        status: 'failed',
        error: 'Simulated payment rejection: Insufficient balance or bank decline',
        transactionId
      };
    }

    if (mode === 'timeout') {
      return {
        status: 'timeout',
        error: 'Simulated gateway timeout: Gateway timed out after 30000ms',
        transactionId
      };
    }

    // Default Success
    if (idempotencyKey) {
      this.processedIdempotencyKeys.add(idempotencyKey);
    }

    return {
      status: 'confirmed',
      transactionId,
      amount,
      paymentMethod: paymentMethod || 'UPI',
      paidAt: new Date().toISOString()
    };
  }
}

export const paymentAdapter = new PaymentAdapter();
