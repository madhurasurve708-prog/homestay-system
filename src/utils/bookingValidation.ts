import type { Booking, Room } from '../types/hms';

/**
 * Checks whether two date ranges [startA, endA) and [startB, endB) overlap.
 * Same-day turnover (endA === startB) is allowed and does NOT overlap.
 */
export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}

export function findOverlappingBooking(
  bookings: Booking[],
  roomNumber: string,
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: string
): Booking | undefined {
  return bookings.find((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.roomNumber !== roomNumber) return false;
    if (b.status === 'Cancelled' || b.status === 'Checked-out') return false;
    return datesOverlap(checkInDate, checkOutDate, b.checkInDate, b.checkOutDate);
  });
}

export interface BookingValidationResult {
  valid: boolean;
  error?: string;
}

export function validateNewBooking(params: {
  guestName: string;
  guestPhone: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  rooms: Room[];
  bookings: Booking[];
  excludeBookingId?: string;
}): BookingValidationResult {
  const {
    guestName,
    guestPhone,
    roomNumber,
    checkInDate,
    checkOutDate,
    guestsCount,
    rooms,
    bookings,
    excludeBookingId,
  } = params;

  if (!guestName.trim()) {
    return { valid: false, error: 'Please enter the guest full name.' };
  }

  const digits = guestPhone.replace(/\D/g, '');
  if (digits.length < 10) {
    return {
      valid: false,
      error: 'Please enter a valid 10-digit contact number.',
    };
  }

  if (!checkInDate || !checkOutDate) {
    return { valid: false, error: 'Both check-in and check-out dates are required.' };
  }

  if (checkOutDate <= checkInDate) {
    return {
      valid: false,
      error: 'Check-out date must be at least 1 night after check-in date.',
    };
  }

  const room = rooms.find((r) => r.roomNumber === roomNumber);
  if (!room) {
    return { valid: false, error: 'Please select a valid room (101–115).' };
  }

  if (room.status === 'Maintenance') {
    return {
      valid: false,
      error: `Room ${roomNumber} is currently marked under Maintenance. Please pick another room or update room status first.`,
    };
  }

  if (guestsCount < 1 || guestsCount > room.capacity + 1) {
    return {
      valid: false,
      error: `Guest count for Room ${roomNumber} must be between 1 and ${room.capacity + 1}.`,
    };
  }

  const conflict = findOverlappingBooking(
    bookings,
    roomNumber,
    checkInDate,
    checkOutDate,
    excludeBookingId
  );

  if (conflict) {
    return {
      valid: false,
      error: `Room ${roomNumber} is already booked for ${conflict.guest.fullName} from ${conflict.checkInDate} to ${conflict.checkOutDate}. Double booking is not allowed. Please pick another room.`,
    };
  }

  return { valid: true };
}

