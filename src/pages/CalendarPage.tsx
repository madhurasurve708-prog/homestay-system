import React, { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { BookingStatusBadge, SourceBadge } from '../components/StatusBadge';
import type { Booking, Room } from '../types/hms';
import {
  addDaysISO,
  formatFullDate,
  formatShortDate,
  formatWeekday,
  getTodayISO,
} from '../utils/dateUtils';

interface CalendarPageProps {
  rooms: Room[];
  bookings: Booking[];
  onBookSlot: (roomNumber: string, dateISO: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  rooms,
  bookings,
  onBookSlot,
}) => {
  const today = getTodayISO();
  const [startDate, setStartDate] = useState(today);
  const [daysCount, setDaysCount] = useState<7 | 14>(7);
  const [mobileSelectedDate, setMobileSelectedDate] = useState(today);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const dates = useMemo(
    () => Array.from({ length: daysCount }, (_, i) => addDaysISO(startDate, i)),
    [startDate, daysCount]
  );

  const getCellBooking = (roomNumber: string, dateISO: string): Booking | undefined => {
    return bookings.find((b) => {
      if (b.roomNumber !== roomNumber) return false;
      if (b.status === 'Cancelled' || b.status === 'Checked-out') return false;
      return dateISO >= b.checkInDate && dateISO < b.checkOutDate;
    });
  };

  return (
    <div className="space-y-5">
      <DemoNoticeBanner
        title="Room Availability Calendar"
        message="See which rooms are free on which date. Click on any green 'Free' box to book that room. Click on a booked room to see who is staying."
      />

      {/* Calendar Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const prev = addDaysISO(startDate, -7);
              setStartDate(prev);
              setMobileSelectedDate(prev);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-800 hover:bg-stone-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Week
          </button>
          <button
            type="button"
            onClick={() => {
              setStartDate(today);
              setMobileSelectedDate(today);
            }}
            className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2 text-xs sm:text-sm font-bold text-[#0f292e] hover:bg-stone-200"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              const next = addDaysISO(startDate, 7);
              setStartDate(next);
              setMobileSelectedDate(next);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-800 hover:bg-stone-50"
          >
            Next Week
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2">
            <CalendarIcon className="h-4 w-4 text-stone-600" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                if (e.target.value) {
                  setStartDate(e.target.value);
                  setMobileSelectedDate(e.target.value);
                }
              }}
              aria-label="Pick starting date"
              className="bg-transparent text-xs sm:text-sm font-bold text-stone-900 focus:outline-none"
            />
          </div>

          <div className="hidden md:inline-flex rounded-xl border border-stone-300 bg-stone-50 p-1">
            {([7, 14] as const).map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setDaysCount(cnt)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  daysCount === cnt
                    ? 'bg-[#0f292e] text-white'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {cnt} Days View
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Legend for Seniors */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-stone-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-emerald-400 bg-emerald-100" />
          Green = Free to Book (Click to Book)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-amber-400 bg-amber-100" />
          Yellow = Booked in Advance
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-sky-400 bg-sky-100" />
          Blue = Guest In Room
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded border border-stone-300 bg-stone-200" />
          Grey = Repairs / Cleaning
        </span>
      </div>

      {/* Selected Booking Inspector */}
      {selectedBooking && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-teal-300 bg-teal-50/80 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Info className="h-5 w-5 text-[#0f292e]" />
              <span className="text-base font-bold text-stone-900">
                Room #{selectedBooking.roomNumber} — {selectedBooking.guest.fullName}
              </span>
              <BookingStatusBadge status={selectedBooking.status} />
              <SourceBadge source={selectedBooking.source} />
            </div>
            <p className="text-xs sm:text-sm text-stone-700">
              Booking Code: <strong>{selectedBooking.bookingCode}</strong> • Stay Dates:{' '}
              {formatFullDate(selectedBooking.checkInDate)} to{' '}
              {formatFullDate(selectedBooking.checkOutDate)} • Phone:{' '}
              <strong>{selectedBooking.guest.phone}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBooking(null)}
            className="self-start rounded-xl border border-stone-300 bg-white px-4 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-50 sm:self-center"
          >
            Close Details
          </button>
        </div>
      )}

      {/* Desktop / Tablet Matrix */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border-2 border-stone-200 bg-white shadow-xs">
        <table className="w-full min-w-[780px] border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/80">
              <th className="sticky left-0 z-10 w-44 border-r border-stone-200 bg-stone-100 px-4 py-3 text-left font-black text-stone-900">
                Room (101 to 115)
              </th>
              {dates.map((d) => {
                const isToday = d === today;
                return (
                  <th
                    key={d}
                    className={`border-r border-stone-200 px-2 py-3 text-center font-bold last:border-r-0 ${
                      isToday ? 'bg-amber-100 text-amber-950 font-black' : 'text-stone-700'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider">
                      {formatWeekday(d)}
                    </div>
                    <div className="mt-0.5 text-xs sm:text-sm font-black">
                      {formatShortDate(d)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-stone-50/50">
                <td className="sticky left-0 z-10 border-r border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-stone-900 text-sm sm:text-base">
                      Room #{room.roomNumber}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                        room.category === 'AC'
                          ? 'bg-sky-50 text-sky-900'
                          : 'bg-amber-50 text-amber-900'
                      }`}
                    >
                      {room.category}
                    </span>
                  </div>
                  <p className="truncate text-xs text-stone-500">{room.floor}</p>
                </td>
                {dates.map((d) => {
                  if (room.status === 'Maintenance') {
                    return (
                      <td
                        key={d}
                        className="border-r border-stone-200 p-1 text-center last:border-r-0"
                      >
                        <div className="rounded-lg bg-stone-100 py-2.5 text-xs font-bold text-stone-500">
                          Repairs
                        </div>
                      </td>
                    );
                  }

                  const booking = getCellBooking(room.roomNumber, d);
                  if (booking) {
                    const isOccupied = booking.status === 'Checked-in';
                    return (
                      <td
                        key={d}
                        className="border-r border-stone-200 p-1 last:border-r-0"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          title={`${booking.guest.fullName} (${booking.status})`}
                          className={`w-full truncate rounded-lg border-2 px-1.5 py-2 text-center text-xs font-bold transition ${
                            isOccupied
                              ? 'border-sky-400 bg-sky-100 text-sky-950 hover:bg-sky-200'
                              : 'border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200'
                          }`}
                        >
                          {booking.guest.fullName.split(' ')[0]}
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={d}
                      className="border-r border-stone-200 p-1 last:border-r-0"
                    >
                      <button
                        type="button"
                        onClick={() => onBookSlot(room.roomNumber, d)}
                        title={`Click to book Room ${room.roomNumber} on ${formatFullDate(d)}`}
                        className="w-full rounded-lg border-2 border-emerald-300 bg-emerald-50 py-2 text-xs font-bold text-emerald-950 transition hover:border-emerald-500 hover:bg-emerald-100"
                      >
                        Free
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Day View */}
      <div className="space-y-4 md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((d) => {
            const active = d === mobileSelectedDate;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setMobileSelectedDate(d)}
                className={`shrink-0 rounded-xl border-2 px-4 py-2 text-center transition ${
                  active
                    ? 'border-[#0f292e] bg-[#0f292e] text-white font-bold'
                    : 'border-stone-200 bg-white text-stone-800'
                }`}
              >
                <div className="text-[11px] uppercase opacity-80">
                  {formatWeekday(d)}
                </div>
                <div className="text-xs font-bold">{formatShortDate(d)}</div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border-2 border-stone-200 bg-white p-4">
          <p className="mb-3 text-xs sm:text-sm font-bold text-stone-800">
            Rooms for {formatFullDate(mobileSelectedDate)}:
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {rooms.map((room) => {
              const booking = getCellBooking(room.roomNumber, mobileSelectedDate);
              if (room.status === 'Maintenance') {
                return (
                  <div
                    key={room.roomNumber}
                    className="rounded-xl border border-stone-200 bg-stone-100 p-3 text-stone-500"
                  >
                    <div className="flex justify-between text-xs font-bold">
                      <span>#{room.roomNumber}</span>
                      <span>{room.category}</span>
                    </div>
                    <p className="mt-1 text-xs">Cleaning</p>
                  </div>
                );
              }
              if (booking) {
                const isOccupied = booking.status === 'Checked-in';
                return (
                  <button
                    key={room.roomNumber}
                    type="button"
                    onClick={() => setSelectedBooking(booking)}
                    className={`rounded-xl border-2 p-3 text-left ${
                      isOccupied
                        ? 'border-sky-400 bg-sky-50 text-sky-950 font-bold'
                        : 'border-amber-400 bg-amber-50 text-amber-950 font-bold'
                    }`}
                  >
                    <div className="flex justify-between text-xs">
                      <span>#{room.roomNumber}</span>
                      <span>{room.category}</span>
                    </div>
                    <p className="mt-1 truncate text-xs">
                      {booking.guest.fullName}
                    </p>
                    <p className="text-[10px] text-stone-600 font-normal">
                      {isOccupied ? 'Guest In' : 'Booked'}
                    </p>
                  </button>
                );
              }

              return (
                <button
                  key={room.roomNumber}
                  type="button"
                  onClick={() => onBookSlot(room.roomNumber, mobileSelectedDate)}
                  className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 text-left text-emerald-950 font-bold hover:bg-emerald-100"
                >
                  <div className="flex justify-between text-xs">
                    <span>#{room.roomNumber}</span>
                    <span>{room.category}</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-800">
                    Empty • Click to Book
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
