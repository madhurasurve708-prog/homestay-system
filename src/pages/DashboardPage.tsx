import React, { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  DoorClosed,
  DoorOpen,
  IndianRupee,
  MapPin,
  Phone,
  ReceiptIndianRupee,
  RotateCcw,
  Sparkles,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { PropertyPhoto } from '../components/PropertyPhoto';
import {
  BookingStatusBadge,
  SourceBadge,
} from '../components/StatusBadge';
import type { Bill, Booking, NavSection, PropertySettings, Room } from '../types/hms';
import { calculateBillTotals } from '../utils/billingUtils';
import { formatINR, formatShortDate, getTodayISO } from '../utils/dateUtils';

interface DashboardPageProps {
  rooms: Room[];
  bookings: Booking[];
  bills: Bill[];
  settings: PropertySettings;
  customPhotoOverrides: Record<string, string>;
  onNavigate: (section: NavSection) => void;
  onOpenNewBooking: (roomNumber?: string) => void;
  onOpenBillingForBooking?: (bookingId: string) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onUpdateRoomStatus?: (roomNumber: string, status: Room['status']) => void;
  onResetDemo?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  rooms,
  bookings,
  bills,
  settings,
  customPhotoOverrides,
  onNavigate,
  onOpenNewBooking,
  onOpenBillingForBooking,
  onDeleteBooking,
  onUpdateRoomStatus,
  onResetDemo,
}) => {
  const today = getTodayISO();

  // Filter state for the 15 rooms grid
  const [roomFilter, setRoomFilter] = useState<'ALL' | 'AVAILABLE' | 'AC' | 'NON_AC'>('ALL');

  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const bookedRooms = rooms.filter((r) => r.status === 'Booked').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

  const todaysCheckIns = bookings.filter(
    (b) =>
      b.status !== 'Cancelled' &&
      (b.checkInDate === today || b.checkedInAt === today)
  ).length;

  const todaysCheckOuts = bookings.filter(
    (b) =>
      b.status !== 'Cancelled' &&
      (b.checkOutDate === today || b.checkedOutAt === today)
  ).length;

  const todaysRevenue = bills
    .filter((bl) => bl.billDate === today)
    .reduce((sum, bl) => {
      const totals = calculateBillTotals(bl);
      return sum + (bl.amountPaid > 0 ? bl.amountPaid : totals.grandTotal);
    }, 0);

  const acRooms = rooms.filter((r) => r.category === 'AC');
  const nonAcRooms = rooms.filter((r) => r.category === 'Non-AC');
  const acOccupied = acRooms.filter((r) => r.status === 'Occupied').length;
  const nonAcOccupied = nonAcRooms.filter((r) => r.status === 'Occupied').length;

  // Filter active / recent bookings, filtering out any test gibberish
  const recentBookings = bookings
    .filter((b) => b && b.guest && b.guest.fullName && b.guest.fullName !== 'fgghjdd')
    .slice(0, 6);

  // Map of occupied room number -> active guest name
  const roomGuestMap: Record<string, { guestName: string; checkOutDate: string; bookingId: string }> = {};
  bookings.forEach((b) => {
    if (b.status === 'Checked-in' || b.status === 'Confirmed') {
      roomGuestMap[b.roomNumber] = {
        guestName: b.guest.fullName,
        checkOutDate: b.checkOutDate,
        bookingId: b.id,
      };
    }
  });

  // Filtered rooms list for the 15-room grid
  const displayedRooms = rooms.filter((r) => {
    if (roomFilter === 'AVAILABLE') return r.status === 'Available';
    if (roomFilter === 'AC') return r.category === 'AC';
    if (roomFilter === 'NON_AC') return r.category === 'Non-AC';
    return true;
  });

  const groundFloorRooms = displayedRooms.filter((r) => r.floor.toLowerCase().includes('ground'));
  const firstFloorRooms = displayedRooms.filter((r) => !r.floor.toLowerCase().includes('ground'));

  return (
    <div className="space-y-6">
      {/* Friendly Guide Banner */}
      <DemoNoticeBanner
        title="Sunshine Home Stay • Daily Overview"
        message="Good day! Here is your daily hotel overview. You can see which rooms are empty right now, who is staying inside, and add food or print bills with one click."
      />

      {/* Top 3 Big Numbers (Ultra-Readable, High Contrast) */}
      <section aria-label="Key Hotel Numbers">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1: Empty Rooms */}
          <div className="flex items-center gap-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50/90 p-5 shadow-xs">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <DoorOpen className="h-9 w-9" />
            </span>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-950">
                {availableRooms} Empty
              </p>
              <p className="text-sm font-bold text-emerald-900 mt-0.5">
                Rooms ready to give to guests right now
              </p>
            </div>
          </div>

          {/* Card 2: Guests Inside */}
          <div className="flex items-center gap-4 rounded-3xl border-2 border-sky-300 bg-sky-50/90 p-5 shadow-xs">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
              <DoorClosed className="h-9 w-9" />
            </span>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-sky-950">
                {occupiedRooms} Full
              </p>
              <p className="text-sm font-bold text-sky-900 mt-0.5">
                Rooms with guests staying inside today
              </p>
            </div>
          </div>

          {/* Card 3: Today's Bills */}
          <div className="flex items-center gap-4 rounded-3xl border-2 border-amber-300 bg-amber-50/90 p-5 shadow-xs">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm">
              <IndianRupee className="h-9 w-9" />
            </span>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-950">
                {formatINR(todaysRevenue)}
              </p>
              <p className="text-sm font-bold text-amber-900 mt-0.5">
                Today&apos;s bills collected so far
              </p>
            </div>
          </div>
        </div>

        {/* Small Sub-Summary Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-xs sm:text-sm text-stone-700 font-medium">
          <span>
            Total Hotel Rooms: <strong>15 Rooms (101 to 115)</strong>
          </span>
          <span>
            Advance Booked: <strong>{bookedRooms} Rooms</strong>
          </span>
          <span>
            Arriving Today: <strong>{todaysCheckIns}</strong> • Leaving Today: <strong>{todaysCheckOuts}</strong>
          </span>
          <span>
            Repair/Cleaning: <strong>{maintenanceRooms}</strong>
          </span>
        </div>
      </section>

      {/* 2 Big Main Daily Action Buttons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onOpenNewBooking()}
          className="group flex items-center justify-between rounded-3xl border-2 border-[#0f292e] bg-[#0f292e] p-5 text-left text-white shadow-md hover:bg-[#173a41] transition cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-stone-950">
              <CalendarPlus className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xl font-black text-white leading-tight">
                + Book a Room for a Guest
              </p>
              <p className="text-xs sm:text-sm text-amber-200 mt-1">
                For phone calls, WhatsApp or walk-in guests
              </p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-amber-300 group-hover:translate-x-1 transition" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('billing')}
          className="group flex items-center justify-between rounded-3xl border-2 border-[#c27d38] bg-[#c27d38] p-5 text-left text-white shadow-md hover:bg-[#b06d2c] transition cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#c27d38]">
              <ReceiptIndianRupee className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xl font-black text-white leading-tight">
                Open Food &amp; Room Bills
              </p>
              <p className="text-xs sm:text-sm text-amber-100 mt-1">
                Add fish thali, tea &amp; print guest bill
              </p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-1 transition" />
        </button>
      </div>

      {/* All 15 Rooms Grid + Guest Register */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Side: All 15 Rooms (Organized by Floor, Huge Cards) */}
        <section className="rounded-3xl border-2 border-stone-200 bg-white p-5 sm:p-7 shadow-xs xl:col-span-7 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-stone-200 pb-4">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                All 15 Rooms: Empty or Full
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Green = Empty (Ready to give) • Blue = Guest Inside
              </p>
            </div>

            {/* Quick Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRoomFilter('ALL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  roomFilter === 'ALL'
                    ? 'bg-[#0f292e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All (15)
              </button>
              <button
                type="button"
                onClick={() => setRoomFilter('AVAILABLE')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  roomFilter === 'AVAILABLE'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                🟢 Empty Only ({availableRooms})
              </button>
              <button
                type="button"
                onClick={() => setRoomFilter('AC')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  roomFilter === 'AC'
                    ? 'bg-[#0f292e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                ❄️ AC ({acRooms.length})
              </button>
              <button
                type="button"
                onClick={() => setRoomFilter('NON_AC')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  roomFilter === 'NON_AC'
                    ? 'bg-[#0f292e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                🌿 Non-AC ({nonAcRooms.length})
              </button>
            </div>
          </div>

          {/* Ground Floor Rooms */}
          {groundFloorRooms.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-200 text-stone-700 text-xs font-black">
                  G
                </span>
                <h4 className="text-sm font-black uppercase tracking-wider text-stone-700">
                  Ground Floor (Rooms 101 to 108)
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groundFloorRooms.map((room) => renderRoomCard(room))}
              </div>
            </div>
          )}

          {/* First Floor Rooms */}
          {firstFloorRooms.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-200 text-stone-700 text-xs font-black">
                  1
                </span>
                <h4 className="text-sm font-black uppercase tracking-wider text-stone-700">
                  First Floor (Rooms 109 to 115)
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {firstFloorRooms.map((room) => renderRoomCard(room))}
              </div>
            </div>
          )}

          {/* Bottom Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs sm:text-sm text-stone-700">
            <span>
              ❄️ <strong>AC Rooms:</strong> {acOccupied} occupied out of {acRooms.length}
            </span>
            <span>
              🌿 <strong>Non-AC Rooms:</strong> {nonAcOccupied} occupied out of {nonAcRooms.length}
            </span>
          </div>
        </section>

        {/* Right Side: Current Guests Staying Right Now */}
        <section className="rounded-3xl border-2 border-stone-200 bg-white p-5 sm:p-7 shadow-xs xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-stone-200 pb-4">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                Guests Staying Right Now
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Current guests inside your hotel
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenNewBooking()}
              className="inline-flex items-center gap-1 rounded-xl bg-[#0f292e] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#173a41] transition cursor-pointer"
            >
              <CalendarPlus className="h-4 w-4 text-amber-300" />
              + New Guest
            </button>
          </div>

          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-stone-300 p-8 text-center">
                <p className="text-sm font-bold text-stone-600">No guests currently staying</p>
              </div>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-2xs hover:border-[#0f292e] transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-stone-900">
                        {b.guest.fullName}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-lg bg-[#0f292e] px-2.5 py-0.5 text-xs font-bold text-white">
                          Room #{b.roomNumber} ({b.roomCategory})
                        </span>
                        <SourceBadge source={b.source} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <BookingStatusBadge status={b.status} />
                      {onDeleteBooking && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete booking for ${b.guest.fullName}?`)) {
                              onDeleteBooking(b.id);
                            }
                          }}
                          title="Delete test booking"
                          aria-label={`Delete booking for ${b.guest.fullName}`}
                          className="rounded-lg p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2 text-xs sm:text-sm text-stone-700">
                    <span>
                      📅 <strong>{formatShortDate(b.checkInDate)} to {formatShortDate(b.checkOutDate)}</strong>
                    </span>
                    <a
                      href={`tel:${b.guest.phone}`}
                      className="inline-flex items-center gap-1 text-stone-800 font-bold hover:text-[#0f292e]"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#c27d38]" />
                      {b.guest.phone}
                    </a>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenBillingForBooking) {
                          onOpenBillingForBooking(b.id);
                        } else {
                          onNavigate('billing');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#0f292e] hover:underline cursor-pointer"
                    >
                      <ReceiptIndianRupee className="h-4 w-4 text-[#c27d38]" />
                      Open Food Bill &amp; Print →
                    </button>

                    <span className="text-xs font-bold text-stone-500">
                      ₹{b.nightlyRateSnapshot} / night
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Property Showcase with Genuine Photographs */}
      <section className="overflow-hidden rounded-3xl border-2 border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <PropertyPhoto
              photoId="exterior-main"
              customOverrides={customPhotoOverrides}
              aspectClass="h-64 sm:h-80 lg:h-full"
              className="w-full"
            />
          </div>
          <div className="flex flex-col justify-between p-5 sm:p-7 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold text-[#0f292e]">
                  <MapPin className="h-4 w-4 text-[#c27d38]" />
                  {settings.address}, {settings.city}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Real Sunshine Home Stay Photos
                </span>
              </div>

              <h3 className="mt-3 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
                {settings.propertyName}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700 sm:text-base">
                Manage all 15 rooms easily. See which room is empty or full, write down guest
                bookings, add Malvani fish thali &amp; morning tea to the bill, and print guest receipts.
              </p>

              {/* Photo Previews */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="overflow-hidden rounded-2xl border border-stone-200">
                  <PropertyPhoto
                    photoId="room-interior-verified"
                    customOverrides={customPhotoOverrides}
                    aspectClass="h-full min-h-[140px]"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-stone-200">
                  <PropertyPhoto
                    photoId="placeholder-dining"
                    customOverrides={customPhotoOverrides}
                    aspectClass="h-full min-h-[140px]"
                    slotTitle="Dining Area Photo"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-stone-200">
                  <PropertyPhoto
                    photoId="placeholder-surroundings"
                    customOverrides={customPhotoOverrides}
                    aspectClass="h-full min-h-[140px]"
                    slotTitle="Surroundings & Beach"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('rooms')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f292e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#173a41] sm:text-sm cursor-pointer"
                >
                  See All 15 Rooms (101 to 115) →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('calendar')}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 transition hover:bg-stone-50 sm:text-sm cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4 text-[#c27d38]" />
                  See Date Calendar →
                </button>
              </div>

              {onResetDemo && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all demo data back to fresh sample rooms and bookings?')) {
                      onResetDemo();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Sample Data
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // Helper to render each room card
  function renderRoomCard(room: Room) {
    const activeGuest = roomGuestMap[room.roomNumber];

    const tileStyles: Record<Room['status'], string> = {
      Available:
        'border-emerald-300 bg-emerald-50/90 text-emerald-950 hover:border-emerald-500 hover:bg-emerald-100/90',
      Booked:
        'border-amber-300 bg-amber-50/90 text-amber-950 hover:border-amber-500 hover:bg-amber-100/90',
      Occupied:
        'border-sky-300 bg-sky-50/90 text-sky-950 hover:border-sky-500 hover:bg-sky-100/90',
      Maintenance:
        'border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-400 hover:bg-stone-200/90',
    };

    const categoryBadge =
      room.category === 'AC'
        ? 'bg-sky-100 text-sky-900 border-sky-300'
        : 'bg-stone-200 text-stone-800 border-stone-300';

    return (
      <div
        key={room.roomNumber}
        className={`flex flex-col justify-between rounded-2xl border-2 p-4 transition shadow-xs ${tileStyles[room.status]}`}
      >
        <div>
          {/* Top Row: Room Number + AC Badge */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-stone-900">
              Room {room.roomNumber}
            </span>
            <span
              className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-black ${categoryBadge}`}
            >
              {room.category === 'AC' ? '❄️ AC' : '🌿 Non-AC'}
            </span>
          </div>

          {/* Middle Info */}
          <div className="mt-2.5">
            {room.status === 'Available' && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-800">
                  🟢 Empty (Ready to Give)
                </p>
                <p className="text-base font-black text-stone-900">
                  ₹{room.sampleRatePerNight}
                  <span className="text-xs font-normal text-stone-600"> / night</span>
                </p>
              </div>
            )}

            {room.status === 'Occupied' && (
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-sky-900">
                  🔵 Guest Inside
                </p>
                <p className="truncate text-sm font-black text-stone-900">
                  {activeGuest?.guestName || 'Checked-in Guest'}
                </p>
                {activeGuest?.checkOutDate && (
                  <p className="text-[11px] text-stone-600">
                    Till {formatShortDate(activeGuest.checkOutDate)}
                  </p>
                )}
              </div>
            )}

            {room.status === 'Booked' && (
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900">
                  🟡 Booked in Advance
                </p>
                <p className="truncate text-sm font-bold text-stone-900">
                  {activeGuest?.guestName || 'Upcoming Guest'}
                </p>
                <p className="text-[11px] text-stone-600">
                  ₹{room.sampleRatePerNight} / night
                </p>
              </div>
            )}

            {room.status === 'Maintenance' && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-800">
                  ⚪ Cleaning / Repair
                </p>
                <p className="text-xs text-stone-600">
                  Not ready for guest yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-3 border-t border-black/10 pt-2.5">
          {room.status === 'Available' ? (
            <button
              type="button"
              onClick={() => onOpenNewBooking(room.roomNumber)}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-700 py-2 text-xs font-black text-white shadow-2xs hover:bg-emerald-800 transition cursor-pointer"
            >
              <CalendarPlus className="h-4 w-4" />
              + Give Room {room.roomNumber}
            </button>
          ) : room.status === 'Occupied' ? (
            <button
              type="button"
              onClick={() => {
                if (activeGuest?.bookingId && onOpenBillingForBooking) {
                  onOpenBillingForBooking(activeGuest.bookingId);
                } else {
                  onNavigate('billing');
                }
              }}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#0f292e] py-2 text-xs font-black text-white shadow-2xs hover:bg-[#173a41] transition cursor-pointer"
            >
              <ReceiptIndianRupee className="h-4 w-4 text-amber-300" />
              View Bill / Add Food
            </button>
          ) : room.status === 'Booked' ? (
            <button
              type="button"
              onClick={() => onNavigate('checkin')}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-amber-600 py-2 text-xs font-black text-white shadow-2xs hover:bg-amber-700 transition cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              Check In Guest
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUpdateRoomStatus && onUpdateRoomStatus(room.roomNumber, 'Available')}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-stone-700 py-2 text-xs font-black text-white shadow-2xs hover:bg-stone-800 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Mark Clean &amp; Free
            </button>
          )}
        </div>
      </div>
    );
  }
};
