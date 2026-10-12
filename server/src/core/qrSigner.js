import crypto from 'crypto';

const QR_SIGNING_SECRET = process.env.QR_SECRET || 'space2park-sih26205-tamperproof-hmac-key';

export function signQRPayload({ bookingId, spaceId, slotCode, vehicleNumber, validFrom, validUntil }) {
  // Hash the vehicle number to preserve privacy while enabling offline matching
  const vehicleHash = crypto
    .createHash('sha256')
    .update((vehicleNumber || '').toUpperCase().trim())
    .digest('hex')
    .slice(0, 16);

  const payloadString = `${bookingId}|${spaceId}|${slotCode}|${vehicleHash}|${validFrom}|${validUntil}`;
  
  const signature = crypto
    .createHmac('sha256', QR_SIGNING_SECRET)
    .update(payloadString)
    .digest('hex');

  const qrData = {
    bookingId,
    spaceId,
    slotCode,
    vehicleHash,
    validFrom,
    validUntil,
    sig: signature.slice(0, 32)
  };

  return {
    qrString: JSON.stringify(qrData),
    qrData
  };
}

export function verifyQRPayload(qrInput, rawVehicleNumber = null) {
  try {
    const data = typeof qrInput === 'string' ? JSON.parse(qrInput) : qrInput;
    const { bookingId, spaceId, slotCode, vehicleHash, validFrom, validUntil, sig } = data;

    const payloadString = `${bookingId}|${spaceId}|${slotCode}|${vehicleHash}|${validFrom}|${validUntil}`;
    const expectedSignature = crypto
      .createHmac('sha256', QR_SIGNING_SECRET)
      .update(payloadString)
      .digest('hex')
      .slice(0, 32);

    if (sig !== expectedSignature) {
      return { valid: false, error: 'TAMPER_DETECTED: Cryptographic signature mismatch' };
    }

    // Optional Vehicle match check
    if (rawVehicleNumber) {
      const computedHash = crypto
        .createHash('sha256')
        .update(rawVehicleNumber.toUpperCase().trim())
        .digest('hex')
        .slice(0, 16);

      if (computedHash !== vehicleHash) {
        return { valid: false, error: 'VEHICLE_MISMATCH: Scanned vehicle does not match pass registration' };
      }
    }

    return { valid: true, data };
  } catch (err) {
    return { valid: false, error: `INVALID_PAYLOAD: ${err.message}` };
  }
}
