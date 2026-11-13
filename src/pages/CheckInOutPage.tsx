import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  LogIn,
  LogOut,
  ReceiptIndianRupee,
  UserPlus,
} from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { BookingStatusBadge } from '../components/StatusBadge';
import type { NewBookingInput } from '../hooks/useHmsState';
import type {
  Bill,
  Booking,
  BookingStatus,
  GuestDetails,
  Room,
} from '../types/hms';
import { calculateBillTotals } from '../utils/billingUtils';
import { validateNewBooking } from '../utils/bookingValidation';
import {
  addDaysISO,
  diffNights,
  formatFullDate,
  formatINR,
  getTodayISO,
} from '../utils/dateUtils';

interface CheckInOutPageProps {
  rooms: Room[];
  bookings: Booking[];
  bills: Bill[];
  onCheckInExisting: (
    bookingId: string,
    status: BookingStatus,
    guestPatch?: Partial<GuestDetails>
  ) => void;
  onWalkInCheckIn: (input: NewBookingInput) => void;
  onCheckOut: (bookingId: string, status: BookingStatus) => void;
  onOpenBillingForBooking: (bookingId: string) => void;
}

export const CheckInOutPage: React.FC<CheckInOutPageProps> = ({
  rooms,
  bookings,
  bills,
  onCheckInExisting,
  onWalkInCheckIn,
  onCheckOut,
  onOpenBillingForBooking,
}) => {
  const today = getTodayISO();

  // Pending arrivals
  const pendingArrivals = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === 'Confirmed' || b.status === 'Pending'
      ),
    [bookings]
  );

  // Active staying guests
  const activeStays = useMemo(
    () => bookings.filter((b) => b.status === 'Checked-in'),
    [bookings]
  );

  const [selectedArrivalId, setSelectedArrivalId] = useState<string>(
    pendingArrivals[0]?.id ?? ''
  );
  const selectedArrival = pendingArrivals.find((b) => b.id === selectedArrivalId);

  const [arrivalIdType, setArrivalIdType] =
    useState<GuestDetails['idType']>('Aadhaar');
  const [arrivalIdLastFour, setArrivalIdLastFour] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [arrivalVehicle, setArrivalVehicle] = useState('');

  // Walk-in form
  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === 'Available'),
    [rooms]
  );

  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInCity, setWalkInCity] = useState('');
  const [walkInIdLastFour, setWalkInIdLastFour] = useState('');
  const [walkInVehicle, setWalkInVehicle] = useState('');
  const [walkInRoom, setWalkInRoom] = useState(
    availableRooms[0]?.roomNumber ?? '104'
  );
  const [walkInNights, setWalkInNights] = useState(1);
  const [walkInGuests, setWalkInGuests] = useState(2);
  const [walkInError, setWalkInError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleExistingCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArrival) return;
    onCheckInExisting(selectedArrival.id, 'Checked-in', {
      idType: arrivalIdType,
      idLastFour: arrivalIdLastFour.trim() || selectedArrival.guest.idLastFour,
      city: arrivalCity.trim() || selectedArrival.guest.city,
      vehicleNumber: arrivalVehicle.trim() || selectedArrival.guest.vehicleNumber,
    });
    showToast(
      `✓ Done! ${selectedArrival.guest.fullName} is now checked into Room #${selectedArrival.roomNumber}. Room is now marked Full.`
    );
    setArrivalIdLastFour('');
    setArrivalCity('');
    setArrivalVehicle('');
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError(null);
    const checkOutDate = addDaysISO(today, Math.max(1, walkInNights));
    const roomObj = rooms.find((r) => r.roomNumber === walkInRoom);

    const validation = validateNewBooking({
      guestName: walkInName,
      guestPhone: walkInPhone,
      roomNumber: walkInRoom,
      checkInDate: today,
      checkOutDate,
      guestsCount: walkInGuests,
      rooms,
      bookings,
    });

    if (!validation.valid) {
      setWalkInError(validation.error ?? 'Could not check in guest.');
      return;
    }

    onWalkInCheckIn({
      roomNumber: walkInRoom,
      roomCategory: roomObj?.category ?? 'AC',
      guest: {
        fullName: walkInName.trim(),
        phone: walkInPhone.trim(),
        city: walkInCity.trim() || undefined,
        idType: 'Aadhaar',
        idLastFour: walkInIdLastFour.trim() || undefined,
        vehicleNumber: walkInVehicle.trim() || undefined,
      },
      checkInDate: today,
      checkOutDate,
      guestsCount: walkInGuests,
      source: 'Walk-in',
      status: 'Checked-in',
    });

    showToast(
      `✓ Done! Walk-in guest ${walkInName.trim()} checked into Room #${walkInRoom}.`
    );
    setWalkInName('');
    setWalkInPhone('');
    setWalkInCity('');
    setWalkInIdLastFour('');
    setWalkInVehicle('');
  };

  const handleCheckOut = (booking: Booking) => {
    onCheckOut(booking.id, 'Checked-out');
    showToast(
      `✓ Checked out ${booking.guest.fullName}. Room #${booking.roomNumber} is now Empty and ready for cleaning.`
    );
  };

  return (
    <div className="space-y-6">
      <DemoNoticeBanner
        title="Check-In and Check-Out (Front Office)"
        message="Use this screen every day. When a guest arrives, click Check-In. When they leave, click Check-Out to make the room empty again."
      />

      {toast && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-950 shadow-md">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top 2 Sections: Arriving Guest vs Walk-in Guest */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form 1: Advance Reservation Arrival */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#0f292e]">
              <LogIn className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                1. Check In Guest with Booking
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                For guests who already booked earlier ({pendingArrivals.length} waiting)
              </p>
            </div>
          </div>

          {pendingArrivals.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-stone-500">
              No advance bookings waiting for check-in right now.
            </p>
          ) : (
            <form onSubmit={handleExistingCheckIn} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                  Select Guest Name / Room:
                </label>
                <select
                  value={selectedArrival?.id ?? ''}
                  onChange={(e) => setSelectedArrivalId(e.target.value)}
                  className="w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-3 text-sm font-bold text-stone-900 focus:border-teal-700 focus:outline-none"
                >
                  {pendingArrivals.map((b) => (
                    <option key={b.id} value={b.id}>
                      Room #{b.roomNumber} — {b.guest.fullName} ({b.roomCategory}, {formatFullDate(b.checkInDate)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedArrival && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs sm:text-sm text-stone-700 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-bold text-stone-900">
                      {selectedArrival.guest.fullName}
                    </span>
                    <BookingStatusBadge status={selectedArrival.status} />
                  </div>
                  <p>
                    Room Assigned: <strong>Room #{selectedArrival.roomNumber} ({selectedArrival.roomCategory})</strong>
                  </p>
                  <p>
                    Mobile Phone: <strong>{selectedArrival.guest.phone}</strong>
                  </p>
                  <p>
                    Stay Dates: {formatFullDate(selectedArrival.checkInDate)} to{' '}
                    {formatFullDate(selectedArrival.checkOutDate)} (
                    {diffNights(selectedArrival.checkInDate, selectedArrival.checkOutDate)} nights)
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-stone-700">
                    ID Proof Type
                  </label>
                  <select
                    value={arrivalIdType}
                    onChange={(e) =>
                      setArrivalIdType(e.target.value as GuestDetails['idType'])
                    }
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-900"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-stone-700">
                    ID Last 4 Digits (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={arrivalIdLastFour}
                    onChange={(e) => setArrivalIdLastFour(e.target.value)}
                    placeholder="e.g. 4821"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs sm:text-sm text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f292e] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#173a41] active:scale-[0.98]"
              >
                <LogIn className="h-5 w-5 text-amber-300" />
                Click Here to Complete Check-In
              </button>
            </form>
          )}
        </section>

        {/* Form 2: Quick Walk-in Check-in */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#c27d38]">
              <UserPlus className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                2. Walk-In Guest (No Advance Booking)
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                For guests arriving directly at the homestay right now
              </p>
            </div>
          </div>

          <form onSubmit={handleWalkInSubmit} className="mt-5 space-y-3.5">
            {walkInError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{walkInError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Suresh Sawant"
                  className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="e.g. 98201 12345"
                  className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-bold text-stone-700">
                  Select Room
                </label>
                <select
                  value={walkInRoom}
                  onChange={(e) => setWalkInRoom(e.target.value)}
                  className="w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-teal-700 focus:outline-none"
                >
                  {rooms
                    .filter((r) => r.status !== 'Maintenance')
                    .map((r) => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room #{r.roomNumber} ({r.category}) — {r.status === 'Available' ? 'Empty' : r.status}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-stone-700">
                    Stay Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={walkInNights}
                    onChange={(e) => setWalkInNights(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-stone-300 px-3 py-2 text-sm font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-stone-700">
                    Guests Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={walkInGuests}
                    onChange={(e) => setWalkInGuests(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-stone-300 px-3 py-2 text-sm font-bold text-stone-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#c27d38] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b06d2c] active:scale-[0.98]"
            >
              <UserPlus className="h-5 w-5" />
              Check In Walk-In Guest Now
            </button>
          </form>
        </section>
      </div>

      {/* Section 3: Currently Staying Guests & One-Click Check-Out */}
      <section className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-stone-900">
              3. Guests Currently Staying ({activeStays.length} Rooms Full)
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              When a guest is ready to leave, click Check Out to make the room empty again.
            </p>
          </div>
        </div>

        {activeStays.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-stone-500">
            No guests are currently checked in.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeStays.map((stay) => {
              const bill = bills.find((bl) => bl.bookingId === stay.id);
              const totals = bill ? calculateBillTotals(bill) : null;
              const isDepartingToday = stay.checkOutDate === today;

              return (
                <div
                  key={stay.id}
                  className={`rounded-2xl border-2 p-5 transition shadow-xs ${
                    isDepartingToday
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-stone-300 bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-xl bg-[#0f292e] px-3 py-1 text-sm font-black text-white">
                          Room #{stay.roomNumber}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-stone-900">
                          {stay.guest.fullName}
                        </h4>
                        {isDepartingToday && (
                          <span className="rounded-full bg-amber-200 px-3 py-0.5 text-xs font-bold text-amber-950">
                            Leaving Today
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-stone-700">
                        Phone: <strong>{stay.guest.phone}</strong> {stay.guest.city ? `• ${stay.guest.city}` : ''}
                      </p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Stay: {formatFullDate(stay.checkInDate)} to {formatFullDate(stay.checkOutDate)}
                      </p>
                    </div>

                    {totals && (
                      <div className="text-right rounded-xl bg-white border border-stone-200 px-3 py-2 shadow-2xs">
                        <p className="text-[11px] font-bold text-stone-500">Balance to Collect</p>
                        <p className="text-base font-black text-amber-900">
                          {formatINR(totals.balanceDue)}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Total Bill: {formatINR(totals.grandTotal)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 pt-3.5">
                    <button
                      type="button"
                      onClick={() => onOpenBillingForBooking(stay.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-stone-800 hover:bg-stone-50"
                    >
                      <ReceiptIndianRupee className="h-4 w-4 text-emerald-700" />
                      View Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCheckOut(stay)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f292e] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#173a41] active:scale-[0.98]"
                    >
                      <LogOut className="h-4 w-4 text-amber-300" />
                      Check Out Guest Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
