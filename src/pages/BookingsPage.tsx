import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  Check,
  Phone,
  ReceiptIndianRupee,
  Search,
  Trash2,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { BookingStatusBadge, SourceBadge } from '../components/StatusBadge';
import type {
  Booking,
  BookingSource,
  BookingStatus,
  NavSection,
} from '../types/hms';
import { diffNights, formatFullDate, formatINR } from '../utils/dateUtils';

interface BookingsPageProps {
  bookings: Booking[];
  onOpenNewBooking: () => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onOpenBillingForBooking: (bookingId: string) => void;
  onNavigate: (section: NavSection) => void;
  onDeleteBooking?: (id: string) => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({
  bookings,
  onOpenNewBooking,
  onUpdateBookingStatus,
  onOpenBillingForBooking,
  onDeleteBooking,
}) => {
  const [tab, setTab] = useState<'upcoming' | 'previous' | 'all'>('upcoming');
  const [sourceFilter, setSourceFilter] = useState<'All' | BookingSource>('All');
  const [search, setSearch] = useState('');

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (tab === 'upcoming') {
        if (b.status === 'Checked-out' || b.status === 'Cancelled') return false;
      } else if (tab === 'previous') {
        if (b.status !== 'Checked-out' && b.status !== 'Cancelled') return false;
      }

      if (sourceFilter !== 'All' && b.source !== sourceFilter) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${b.bookingCode} ${b.guest.fullName} ${b.guest.phone} ${b.roomNumber}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [bookings, tab, sourceFilter, search]);

  const upcomingCount = bookings.filter(
    (b) => b.status !== 'Checked-out' && b.status !== 'Cancelled'
  ).length;
  const previousCount = bookings.filter(
    (b) => b.status === 'Checked-out' || b.status === 'Cancelled'
  ).length;

  return (
    <div className="space-y-6">
      <DemoNoticeBanner
        title="Guest Bookings List"
        message="Here is the list of all guests who booked via phone calls, WhatsApp, walk-in, or online apps. You can confirm bookings, check in guests, or cancel reservations here."
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl border-2 border-stone-200 bg-stone-50 p-1">
            <button
              type="button"
              onClick={() => setTab('upcoming')}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                tab === 'upcoming'
                  ? 'bg-[#0f292e] text-white'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Coming &amp; Staying ({upcomingCount})
            </button>
            <button
              type="button"
              onClick={() => setTab('previous')}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                tab === 'previous'
                  ? 'bg-[#0f292e] text-white'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Past Guests ({previousCount})
            </button>
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                tab === 'all'
                  ? 'bg-[#0f292e] text-white'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              All Bookings ({bookings.length})
            </button>
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as 'All' | BookingSource)}
            aria-label="Filter by booking source"
            className="rounded-xl border-2 border-stone-200 bg-stone-50 px-3 py-2 text-xs sm:text-sm font-bold text-stone-800 focus:border-teal-700 focus:outline-none"
          >
            <option value="All">All Sources</option>
            <option value="Direct">Direct Phone / WhatsApp</option>
            <option value="Walk-in">Walk-in</option>
            <option value="MakeMyTrip">MakeMyTrip</option>
            <option value="Goibibo">Goibibo</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest name or room..."
              className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs sm:text-sm text-stone-900 focus:border-teal-700 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onOpenNewBooking}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#c27d38] px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-[#b06d2c]"
          >
            <CalendarPlus className="h-4 w-4" />
            + New Booking
          </button>
        </div>
      </div>

      {/* Bookings List Cards */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border-2 border-stone-200 bg-white p-12 text-center text-sm font-medium text-stone-500">
          No bookings found.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((b) => {
            const nights = Math.max(1, diffNights(b.checkInDate, b.checkOutDate));
            const estTotal = nights * b.nightlyRateSnapshot;

            return (
              <div
                key={b.id}
                className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-xs transition hover:border-stone-400"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-bold text-stone-500">
                        {b.bookingCode}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-stone-900">
                        {b.guest.fullName}
                      </h4>
                      <BookingStatusBadge status={b.status} />
                      <SourceBadge source={b.source} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-700">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-4 w-4 text-stone-500" />
                        <strong>{b.guest.phone}</strong>
                      </span>
                      <span>
                        Room <strong className="text-stone-950 font-black">#{b.roomNumber}</strong>{' '}
                        ({b.roomCategory})
                      </span>
                      <span>
                        Stay: <strong>{formatFullDate(b.checkInDate)} to{' '}
                        {formatFullDate(b.checkOutDate)}</strong> ({nights}{' '}
                        {nights === 1 ? 'night' : 'nights'})
                      </span>
                      <span>{b.guestsCount} guests</span>
                      <span className="font-bold text-stone-900">
                        Room Rent: {formatINR(estTotal)}
                      </span>
                    </div>

                    {b.guest.specialRequests && (
                      <p className="text-xs italic text-stone-600">
                        Special Note: {b.guest.specialRequests}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 border-t border-stone-100 pt-3 lg:border-t-0 lg:pt-0">
                    {b.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => onUpdateBookingStatus(b.id, 'Confirmed')}
                        className="inline-flex items-center gap-1 rounded-xl border border-teal-300 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-900 transition hover:bg-teal-100"
                      >
                        <Check className="h-4 w-4" />
                        Confirm Booking
                      </button>
                    )}

                    {(b.status === 'Pending' || b.status === 'Confirmed') && (
                      <button
                        type="button"
                        onClick={() => onUpdateBookingStatus(b.id, 'Checked-in')}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#0f292e] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#173a41]"
                      >
                        <UserCheck className="h-4 w-4 text-amber-300" />
                        Check In Now
                      </button>
                    )}

                    {b.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() => onOpenBillingForBooking(b.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-50"
                      >
                        <ReceiptIndianRupee className="h-4 w-4 text-emerald-700" />
                        View Bill
                      </button>
                    )}

                    {(b.status === 'Pending' || b.status === 'Confirmed') && (
                      <button
                        type="button"
                        onClick={() => onUpdateBookingStatus(b.id, 'Cancelled')}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-900 transition hover:bg-rose-100"
                      >
                        <XCircle className="h-4 w-4 text-rose-700" />
                        Cancel
                      </button>
                    )}

                    {onDeleteBooking && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete booking for ${b.guest.fullName}?`)) {
                            onDeleteBooking(b.id);
                          }
                        }}
                        title="Delete booking"
                        aria-label={`Delete booking for ${b.guest.fullName}`}
                        className="rounded-xl border border-stone-300 bg-white p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
