import { createInitialHmsState } from '../data/mockData';
import type { HmsState } from '../types/hms';

const STORAGE_KEY = 'sunshine_homestay_malvan_hms_demo_v1';

/**
 * Local demo persistence adapter.
 *
 * Phase 2 Integration Notes (Python FastAPI + PostgreSQL):
 * Replace localStorage calls with typed async fetch/axios requests to:
 *   - GET    /api/v1/rooms              (rooms table 101-115)
 *   - PATCH  /api/v1/rooms/:roomNumber  (status, tariff updates)
 *   - GET    /api/v1/bookings           (date-range overlap exclusion via PostgreSQL tstzrange/daterange)
 *   - POST   /api/v1/bookings
 *   - POST   /api/v1/bookings/:id/check-in
 *   - POST   /api/v1/bookings/:id/check-out
 *   - GET    /api/v1/bills
 *   - PUT    /api/v1/bills/:id
 *   - GET    /api/v1/reports/summary
 */
export function loadHmsState(): HmsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialHmsState();
    }
    const parsed = JSON.parse(raw) as Partial<HmsState>;
    const fallback = createInitialHmsState();
    const sanitizedBookings = (Array.isArray(parsed.bookings) ? parsed.bookings : fallback.bookings).filter(
      (b) => b && b.guest && b.guest.fullName && b.guest.fullName !== 'fgghjdd' && b.guest.fullName.trim().length >= 2
    );
    const sanitizedBills = (Array.isArray(parsed.bills) ? parsed.bills : fallback.bills).filter(
      (bl) => bl && bl.guestName && bl.guestName !== 'fgghjdd'
    );
    return {
      rooms: Array.isArray(parsed.rooms) && parsed.rooms.length === 15 ? parsed.rooms : fallback.rooms,
      bookings: sanitizedBookings.length > 0 ? sanitizedBookings : fallback.bookings,
      bills: sanitizedBills.length > 0 ? sanitizedBills : fallback.bills,
      foodMenu: Array.isArray(parsed.foodMenu) && parsed.foodMenu.length > 0 ? parsed.foodMenu : fallback.foodMenu,
      settings: parsed.settings ? { ...fallback.settings, ...parsed.settings } : fallback.settings,
      customPhotoOverrides: parsed.customPhotoOverrides ?? {},
    };
  } catch {
    return createInitialHmsState();
  }
}

export function saveHmsState(state: HmsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in demo mode
  }
}

export function resetHmsState(): HmsState {
  const fresh = createInitialHmsState();
  saveHmsState(fresh);
  return fresh;
}

