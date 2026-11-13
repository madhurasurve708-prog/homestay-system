import { useCallback, useEffect, useState } from 'react';
import { loadHmsState, resetHmsState, saveHmsState } from '../services/hmsStore';
import type {
  Bill,
  Booking,
  BookingSource,
  BookingStatus,
  FoodMenuItem,
  GuestDetails,
  HmsState,
  PropertySettings,
  RoomCategory,
  RoomStatus,
} from '../types/hms';
import { calculateBillTotals } from '../utils/billingUtils';
import { diffNights, getTodayISO } from '../utils/dateUtils';

export interface NewBookingInput {
  roomNumber: string;
  roomCategory: RoomCategory;
  guest: GuestDetails;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  source: BookingSource;
  status: BookingStatus;
}

export function useHmsState() {
  const [state, setState] = useState<HmsState>(() => loadHmsState());

  useEffect(() => {
    saveHmsState(state);
  }, [state]);

  const updateRoomStatus = useCallback((roomNumber: string, status: RoomStatus) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) =>
        r.roomNumber === roomNumber ? { ...r, status } : r
      ),
    }));
  }, []);

  const updateRoomRate = useCallback((roomNumber: string, rate: number) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) =>
        r.roomNumber === roomNumber ? { ...r, sampleRatePerNight: Math.max(0, rate) } : r
      ),
    }));
  }, []);

  const addBooking = useCallback((input: NewBookingInput): Booking => {
    const newId = `bkg-${Date.now()}`;
    const bookingCode = `SHS-${Math.floor(2050 + Math.random() * 7900)}`;
    const today = getTodayISO();

    let createdBooking: Booking | null = null;

    setState((prev) => {
      const room = prev.rooms.find((r) => r.roomNumber === input.roomNumber);
      const rate = room?.sampleRatePerNight ?? prev.settings.defaultAcRate;

      const booking: Booking = {
        id: newId,
        bookingCode,
        roomNumber: input.roomNumber,
        roomCategory: room?.category ?? input.roomCategory,
        guest: input.guest,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        guestsCount: input.guestsCount,
        source: input.source,
        status: input.status,
        nightlyRateSnapshot: rate,
        createdAt: today,
        checkedInAt: input.status === 'Checked-in' ? today : undefined,
      };
      createdBooking = booking;

      const updatedRooms = prev.rooms.map((r) => {
        if (r.roomNumber !== input.roomNumber) return r;
        if (input.status === 'Checked-in') return { ...r, status: 'Occupied' as RoomStatus };
        if (
          (input.status === 'Confirmed' || input.status === 'Pending') &&
          r.status === 'Available'
        ) {
          return { ...r, status: 'Booked' as RoomStatus };
        }
        return r;
      });

      const nights = Math.max(1, diffNights(input.checkInDate, input.checkOutDate));
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        invoiceNumber: `DEMO-INV-${Math.floor(1005 + Math.random() * 8900)}`,
        bookingId: booking.id,
        roomNumber: booking.roomNumber,
        guestName: booking.guest.fullName,
        guestPhone: booking.guest.phone,
        billDate: today,
        nights,
        roomRatePerNight: rate,
        items: [],
        discountAmount: 0,
        taxPercent: prev.settings.defaultTaxPercent,
        amountPaid: 0,
        paymentStatus: 'Pending',
        notes: `Folio for ${booking.bookingCode} (Demo)`,
      };

      return {
        ...prev,
        rooms: updatedRooms,
        bookings: [booking, ...prev.bookings],
        bills: input.status === 'Cancelled' ? prev.bills : [newBill, ...prev.bills],
      };
    });

    return (
      createdBooking ?? {
        id: newId,
        bookingCode,
        roomNumber: input.roomNumber,
        roomCategory: input.roomCategory,
        guest: input.guest,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        guestsCount: input.guestsCount,
        source: input.source,
        status: input.status,
        nightlyRateSnapshot: 2000,
        createdAt: today,
      }
    );
  }, []);

  const updateBookingStatus = useCallback(
    (bookingId: string, newStatus: BookingStatus, guestPatch?: Partial<GuestDetails>) => {
      const today = getTodayISO();
      setState((prev) => {
        const target = prev.bookings.find((b) => b.id === bookingId);
        if (!target) return prev;

        const updatedBookings = prev.bookings.map((b) => {
          if (b.id !== bookingId) return b;
          return {
            ...b,
            status: newStatus,
            guest: guestPatch ? { ...b.guest, ...guestPatch } : b.guest,
            checkedInAt: newStatus === 'Checked-in' ? b.checkedInAt ?? today : b.checkedInAt,
            checkedOutAt: newStatus === 'Checked-out' ? today : b.checkedOutAt,
          };
        });

        const roomBookings = updatedBookings.filter(
          (b) => b.roomNumber === target.roomNumber
        );
        const hasCheckedIn = roomBookings.some((b) => b.status === 'Checked-in');
        const hasUpcoming = roomBookings.some(
          (b) => b.status === 'Confirmed' || b.status === 'Pending'
        );

        const updatedRooms = prev.rooms.map((r) => {
          if (r.roomNumber !== target.roomNumber) return r;
          if (r.status === 'Maintenance') return r;
          if (newStatus === 'Checked-in' || hasCheckedIn) {
            return { ...r, status: 'Occupied' as RoomStatus };
          }
          if (hasUpcoming) {
            return { ...r, status: 'Booked' as RoomStatus };
          }
          return { ...r, status: 'Available' as RoomStatus };
        });

        // Ensure bill exists if checking in
        let updatedBills = prev.bills;
        if (newStatus === 'Checked-in' && !prev.bills.some((bl) => bl.bookingId === bookingId)) {
          const room = prev.rooms.find((r) => r.roomNumber === target.roomNumber);
          const nights = Math.max(1, diffNights(target.checkInDate, target.checkOutDate));
          const bill: Bill = {
            id: `bill-${Date.now()}`,
            invoiceNumber: `DEMO-INV-${Math.floor(1005 + Math.random() * 8900)}`,
            bookingId: target.id,
            roomNumber: target.roomNumber,
            guestName: guestPatch?.fullName ?? target.guest.fullName,
            guestPhone: guestPatch?.phone ?? target.guest.phone,
            billDate: today,
            nights,
            roomRatePerNight: target.nightlyRateSnapshot || room?.sampleRatePerNight || 2000,
            items: [],
            discountAmount: 0,
            taxPercent: prev.settings.defaultTaxPercent,
            amountPaid: 0,
            paymentStatus: 'Pending',
          };
          updatedBills = [bill, ...prev.bills];
        }

        return {
          ...prev,
          rooms: updatedRooms,
          bookings: updatedBookings,
          bills: updatedBills,
        };
      });
    },
    []
  );

  const upsertBill = useCallback((bill: Bill) => {
    const totals = calculateBillTotals(bill);
    const normalized: Bill = {
      ...bill,
      paymentStatus: totals.derivedStatus,
    };
    setState((prev) => {
      const exists = prev.bills.some((b) => b.id === normalized.id);
      return {
        ...prev,
        bills: exists
          ? prev.bills.map((b) => (b.id === normalized.id ? normalized : b))
          : [normalized, ...prev.bills],
      };
    });
  }, []);

  const updateFoodMenuItem = useCallback((item: FoodMenuItem) => {
    setState((prev) => {
      const exists = prev.foodMenu.some((f) => f.id === item.id);
      return {
        ...prev,
        foodMenu: exists
          ? prev.foodMenu.map((f) => (f.id === item.id ? item : f))
          : [...prev.foodMenu, item],
      };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<PropertySettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const setPhotoOverride = useCallback((photoId: string, dataUrl: string | null) => {
    setState((prev) => {
      const next = { ...prev.customPhotoOverrides };
      if (dataUrl) {
        next[photoId] = dataUrl;
      } else {
        delete next[photoId];
      }
      return { ...prev, customPhotoOverrides: next };
    });
  }, []);

  const deleteBooking = useCallback((bookingId: string) => {
    setState((prev) => {
      const target = prev.bookings.find((b) => b.id === bookingId);
      if (!target) return prev;
      const updatedBookings = prev.bookings.filter((b) => b.id !== bookingId);
      const remainingForRoom = updatedBookings.filter((b) => b.roomNumber === target.roomNumber);
      const hasCheckedIn = remainingForRoom.some((b) => b.status === 'Checked-in');
      const hasUpcoming = remainingForRoom.some((b) => b.status === 'Confirmed' || b.status === 'Pending');

      const updatedRooms = prev.rooms.map((r) => {
        if (r.roomNumber !== target.roomNumber) return r;
        if (r.status === 'Maintenance') return r;
        if (hasCheckedIn) return { ...r, status: 'Occupied' as RoomStatus };
        if (hasUpcoming) return { ...r, status: 'Booked' as RoomStatus };
        return { ...r, status: 'Available' as RoomStatus };
      });

      const updatedBills = prev.bills.filter((bl) => bl.bookingId !== bookingId);

      return {
        ...prev,
        rooms: updatedRooms,
        bookings: updatedBookings,
        bills: updatedBills,
      };
    });
  }, []);

  const resetDemo = useCallback(() => {
    setState(resetHmsState());
  }, []);

  return {
    state,
    updateRoomStatus,
    updateRoomRate,
    addBooking,
    updateBookingStatus,
    upsertBill,
    updateFoodMenuItem,
    updateSettings,
    setPhotoOverride,
    deleteBooking,
    resetDemo,
  };
}

