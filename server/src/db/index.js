// Dual-Mode Database Layer: In-Memory ACID Store with Exclusion Constraint Emulation

class Database {
  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.spaces = new Map();
    this.bookings = new Map();
    this.verifications = new Map();
    this.logs = [];
    this.initialized = false;
  }

  // Exclusion Constraint Check (equivalent to PostgreSQL btree_gist exclusion on space_id + time_range)
  hasOverlappingBooking(spaceId, slotCode, startTime, endTime, excludeBookingId = null) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    for (const booking of this.bookings.values()) {
      if (excludeBookingId && booking.id === excludeBookingId) continue;
      if (booking.spaceId === spaceId && booking.slotCode === slotCode) {
        if (booking.status === 'confirmed' || booking.status === 'locked') {
          const bStart = new Date(booking.startTime).getTime();
          const bEnd = new Date(booking.endTime).getTime();

          // Time range overlap: [start, end) overlaps [bStart, bEnd) if start < bEnd && end > bStart
          if (start < bEnd && end > bStart) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Find methods
  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) return user;
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  // CRUD Helpers
  saveUser(user) {
    this.users.set(user.id, user);
    return user;
  }

  getAllEvents() {
    return Array.from(this.events.values());
  }

  getEventById(id) {
    return this.events.get(id) || null;
  }

  saveEvent(event) {
    this.events.set(event.id, event);
    return event;
  }

  getAllSpaces() {
    return Array.from(this.spaces.values());
  }

  getSpaceById(id) {
    return this.spaces.get(id) || null;
  }

  saveSpace(space) {
    this.spaces.set(space.id, space);
    return space;
  }

  getAllBookings() {
    return Array.from(this.bookings.values());
  }

  getBookingById(id) {
    return this.bookings.get(id) || null;
  }

  saveBooking(booking) {
    this.bookings.set(booking.id, booking);
    return booking;
  }

  getBookingsByUserId(userId) {
    return Array.from(this.bookings.values()).filter(b => b.userId === userId);
  }

  getBookingsBySpaceId(spaceId) {
    return Array.from(this.bookings.values()).filter(b => b.spaceId === spaceId);
  }

  getBookingsByOwnerId(ownerId) {
    const ownerSpaces = Array.from(this.spaces.values())
      .filter(s => s.ownerId === ownerId)
      .map(s => s.id);
    return Array.from(this.bookings.values()).filter(b => ownerSpaces.includes(b.spaceId));
  }
}

export const db = new Database();
