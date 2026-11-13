import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, X } from 'lucide-react';
import type { NewBookingInput } from '../hooks/useHmsState';
import type {
  Booking,
  BookingSource,
  BookingStatus,
  Room,
  RoomCategory,
} from '../types/hms';
import {
  findOverlappingBooking,
  validateNewBooking,
} from '../utils/bookingValidation';
import { addDaysISO, diffNights, formatINR, getTodayISO } from '../utils/dateUtils';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  bookings: Booking[];
  onCreateBooking: (input: NewBookingInput) => void;
  initialRoomNumber?: string;
  initialCheckInDate?: string;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  rooms,
  bookings,
  onCreateBooking,
  initialRoomNumber,
  initialCheckInDate,
}) => {
  const today = getTodayISO();
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [checkInDate, setCheckInDate] = useState(initialCheckInDate ?? today);
  const [checkOutDate, setCheckOutDate] = useState(
    addDaysISO(initialCheckInDate ?? today, 1)
  );
  const [category, setCategory] = useState<RoomCategory>('AC');
  const [roomNumber, setRoomNumber] = useState(initialRoomNumber ?? '');
  const [guestsCount, setGuestsCount] = useState(2);
  const [source, setSource] = useState<BookingSource>('Direct');
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const baseCheckIn = initialCheckInDate ?? today;
    setCheckInDate(baseCheckIn);
    setCheckOutDate(addDaysISO(baseCheckIn, 1));
    setError(null);
    setGuestName('');
    setGuestPhone('');
    setGuestCity('');
    setSpecialRequests('');
    setGuestsCount(2);
    setSource('Direct');
    setStatus('Confirmed');

    if (initialRoomNumber) {
      const target = rooms.find((r) => r.roomNumber === initialRoomNumber);
      if (target) {
        setCategory(target.category);
        setRoomNumber(target.roomNumber);
        return;
      }
    }
    const firstAvailable = rooms.find(
      (r) =>
        r.category === 'AC' &&
        r.status !== 'Maintenance' &&
        !findOverlappingBooking(
          bookings,
          r.roomNumber,
          baseCheckIn,
          addDaysISO(baseCheckIn, 1)
        )
    );
    setCategory('AC');
    setRoomNumber(firstAvailable?.roomNumber ?? rooms[0]?.roomNumber ?? '101');
  }, [isOpen, initialRoomNumber, initialCheckInDate, rooms, bookings, today]);

  const filteredRooms = useMemo(
    () => rooms.filter((r) => r.category === category),
    [rooms, category]
  );

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.roomNumber === roomNumber),
    [rooms, roomNumber]
  );

  const nights = useMemo(
    () => diffNights(checkInDate, checkOutDate),
    [checkInDate, checkOutDate]
  );

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: RoomCategory) => {
    setCategory(newCat);
    const matching = rooms.filter((r) => r.category === newCat);
    const freeOne = matching.find(
      (r) =>
        r.status !== 'Maintenance' &&
        !findOverlappingBooking(bookings, r.roomNumber, checkInDate, checkOutDate)
    );
    setRoomNumber(freeOne?.roomNumber ?? matching[0]?.roomNumber ?? '');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNewBooking({
      guestName,
      guestPhone,
      roomNumber,
      checkInDate,
      checkOutDate,
      guestsCount,
      rooms,
      bookings,
    });

    if (!validation.valid) {
      setError(validation.error ?? 'Invalid booking details.');
      return;
    }

    onCreateBooking({
      roomNumber,
      roomCategory: selectedRoom?.category ?? category,
      guest: {
        fullName: guestName.trim(),
        phone: guestPhone.trim(),
        city: guestCity.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
      },
      checkInDate,
      checkOutDate,
      guestsCount,
      source,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-stone-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-stone-200 bg-white px-6 py-4">
          <div>
            <h3 className="font-display text-xl font-bold text-stone-900">
              New Guest Booking
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Automatic double-booking protection is active
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
            aria-label="Close booking modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-7">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 px-4 py-3.5 text-xs sm:text-sm font-semibold text-rose-900">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                Guest Full Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Rajesh Kulkarni"
                className="w-full rounded-xl border-2 border-stone-300 px-4 py-2.5 text-sm sm:text-base text-stone-900 focus:border-teal-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                Contact Mobile Number *
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="e.g., 98201 12345"
                className="w-full rounded-xl border-2 border-stone-300 px-4 py-2.5 text-sm sm:text-base text-stone-900 focus:border-teal-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                Check-In Date *
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setCheckInDate(val);
                  if (checkOutDate <= val) {
                    setCheckOutDate(addDaysISO(val, 1));
                  }
                  setError(null);
                }}
                className="w-full rounded-xl border-2 border-stone-300 px-4 py-2.5 text-sm sm:text-base text-stone-900 focus:border-teal-700 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                Check-Out Date *
              </label>
              <input
                type="date"
                value={checkOutDate}
                min={addDaysISO(checkInDate, 1)}
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-xl border-2 border-stone-300 px-4 py-2.5 text-sm sm:text-base text-stone-900 focus:border-teal-700 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Room Selection */}
          <div className="rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-stone-900">
                Choose Room ({nights} {nights === 1 ? 'Night' : 'Nights'} Stay)
              </span>
              <div className="inline-flex rounded-xl border-2 border-stone-200 bg-white p-1">
                {(['AC', 'Non-AC'] as RoomCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`rounded-lg px-3 py-1 text-xs sm:text-sm font-bold transition ${
                      category === cat
                        ? 'bg-[#0f292e] text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    {cat} Rooms
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {filteredRooms.map((r) => {
                const conflict =
                  checkInDate && checkOutDate && checkOutDate > checkInDate
                    ? findOverlappingBooking(
                        bookings,
                        r.roomNumber,
                        checkInDate,
                        checkOutDate
                      )
                    : undefined;
                const isMaintenance = r.status === 'Maintenance';
                const unavailable = isMaintenance || Boolean(conflict);
                const selected = roomNumber === r.roomNumber;

                return (
                  <button
                    key={r.roomNumber}
                    type="button"
                    onClick={() => {
                      setRoomNumber(r.roomNumber);
                      setError(null);
                    }}
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      selected
                        ? 'border-[#0f292e] bg-[#0f292e] text-white shadow-md'
                        : unavailable
                        ? 'border-stone-200 bg-stone-100 text-stone-400'
                        : 'border-stone-200 bg-white text-stone-900 hover:border-teal-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-black">#{r.roomNumber}</span>
                      {!unavailable ? (
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            selected ? 'text-emerald-300' : 'text-emerald-600'
                          }`}
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-rose-500">
                          {isMaintenance ? 'Repairs' : 'Booked'}
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        selected ? 'text-stone-200' : 'text-stone-600'
                      }`}
                    >
                      {formatINR(r.sampleRatePerNight)}/nt
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                Number of Guests
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2.5 text-sm font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                Booking Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as BookingSource)}
                className="w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm font-bold text-stone-900"
              >
                <option value="Direct">Direct Phone / WhatsApp</option>
                <option value="Walk-in">Walk-in</option>
                <option value="MakeMyTrip">MakeMyTrip</option>
                <option value="Goibibo">Goibibo</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-stone-800">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm font-bold text-stone-900"
              >
                <option value="Confirmed">Confirmed Booking</option>
                <option value="Pending">Pending Advance</option>
                <option value="Checked-in">Check In Immediately</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t-2 border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-700">
              <Calendar className="h-5 w-5 text-stone-500" />
              <span>
                Estimated Stay Total:{' '}
                <strong className="text-base text-stone-900 font-black">
                  {formatINR((selectedRoom?.sampleRatePerNight ?? 0) * Math.max(1, nights))}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border-2 border-stone-300 px-5 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0f292e] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#173a41] active:scale-[0.98]"
              >
                Save Booking
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
