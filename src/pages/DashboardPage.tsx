import React, { useState } from 'react';
import {
  ArrowRight,
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  DoorClosed,
  DoorOpen,
  IndianRupee,
  LogIn,
  LogOut,
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

  const totalRooms = rooms.length; // 15
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

  const occupancyPct = Math.round((occupiedRooms / Math.max(1, totalRooms)) * 100);
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

  const summaryCards = [
    {
      label: 'All Rooms',
      value: String(totalRooms),
      sub: 'Rooms 101 to 115',
      icon: BedDouble,
      tone: 'bg-stone-100 text-stone-900 border-stone-300',
    },
    {
      label: 'Empty Rooms',
      value: String(availableRooms),
      sub: 'Free to give right now',
      icon: DoorOpen,
      tone: 'bg-emerald-50 text-emerald-950 border-emerald-300',
    },
    {
      label: 'Guests in Room',
      value: String(occupiedRooms),
      sub: `${occupancyPct}% full today`,
      icon: DoorClosed,
      tone: 'bg-sky-50 text-sky-950 border-sky-300',
    },
    {
      label: 'Advance Booked',
      value: String(bookedRooms),
      sub: 'Coming on later dates',
      icon: CalendarCheck2,
      tone: 'bg-amber-50 text-amber-950 border-amber-300',
    },
    {
      label: 'Arriving Today',
      value: String(todaysCheckIns),
      sub: 'Check-ins today',
      icon: LogIn,
      tone: 'bg-teal-50 text-teal-950 border-teal-300',
    },
    {
      label: 'Leaving Today',
      value: String(todaysCheckOuts),
      sub: 'Check-outs today',
      icon: LogOut,
      tone: 'bg-orange-50 text-orange-950 border-orange-300',
    },
    {
      label: "Today's Bills",
      value: formatINR(todaysRevenue),
      sub: 'Sample bill total',
      icon: IndianRupee,
      tone: 'bg-emerald-50 text-emerald-950 border-emerald-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Friendly Notice Banner in Simple English */}
      <DemoNoticeBanner
        title="Sunshine Home Stay • Daily Overview"
        message="This is your main dashboard. You can quickly see which rooms are empty, check in arriving guests, add Malvani food to bills, and print receipts."
      />

      {/* 3 Large Daily Action Buttons (Senior-Friendly, High Contrast) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onOpenNewBooking()}
          className="group flex items-center justify-between rounded-2xl border-2 border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-[#0f292e] hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0f292e] group-hover:bg-[#0f292e] group-hover:text-white transition">
              <CalendarPlus className="h-7 w-7" />
            </span>
            <div>
              <p className="text-lg font-black text-stone-900 leading-snug">
                + Book a Room
              </p>
              <p className="text-xs sm:text-sm text-stone-600">
                For phone calls &amp; WhatsApp
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-stone-400 group-hover:text-[#0f292e] transition" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('checkin')}
          className="group flex items-center justify-between rounded-2xl border-2 border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-[#c27d38] hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#c27d38] group-hover:bg-[#c27d38] group-hover:text-white transition">
              <UserCheck className="h-7 w-7" />
            </span>
            <div>
              <p className="text-lg font-black text-stone-900 leading-snug">
                Check In &amp; Check Out
              </p>
              <p className="text-xs sm:text-sm text-stone-600">
                Give room keys or take bill
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-stone-400 group-hover:text-[#c27d38] transition" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('billing')}
          className="group flex items-center justify-between rounded-2xl border-2 border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-700 hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition">
              <ReceiptIndianRupee className="h-7 w-7" />
            </span>
            <div>
              <p className="text-lg font-black text-stone-900 leading-snug">
                Food &amp; Room Bills
              </p>
              <p className="text-xs sm:text-sm text-stone-600">
                Add fish thali &amp; print bill
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-stone-400 group-hover:text-emerald-800 transition" />
        </button>
      </div>

      {/* 7 Summary Cards in Easy English */}
      <section aria-label="Today's Hotel Summary">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">
            Today&apos;s Hotel Counts
          </h3>
          <span className="text-xs font-semibold text-stone-500">
            {maintenanceRooms > 0
              ? `${maintenanceRooms} room in cleaning / repair`
              : 'All 15 rooms working'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`rounded-2xl border-2 p-4 transition shadow-xs ${card.tone}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                  {card.value}
                </p>
                <p className="mt-1 text-sm font-bold leading-tight">
                  {card.label}
                </p>
                <p className="mt-0.5 text-xs opacity-75">{card.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 15 Rooms Grid + Recent Bookings Register (Easy to read, senior friendly) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Side: All 15 Rooms (Spacious, Clear, Never Truncated) */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs xl:col-span-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                  All 15 Rooms: Empty or Full
                </h3>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                  15 Rooms
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Click any room to book, check in or change status
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('rooms')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0f292e] hover:underline self-start sm:self-center"
            >
              See Detailed Room List <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Simple Legend with Live Counters */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-950">
              <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-600" />
              <span>{availableRooms} Empty (Free)</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-sky-50 border border-sky-300 px-3 py-2 text-xs font-bold text-sky-950">
              <span className="h-3 w-3 shrink-0 rounded-full bg-sky-600" />
              <span>{occupiedRooms} Guest Inside</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs font-bold text-amber-950">
              <span className="h-3 w-3 shrink-0 rounded-full bg-amber-500" />
              <span>{bookedRooms} Booked</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-stone-100 border border-stone-300 px-3 py-2 text-xs font-bold text-stone-800">
              <span className="h-3 w-3 shrink-0 rounded-full bg-stone-500" />
              <span>{maintenanceRooms} Cleaning</span>
            </div>
          </div>

          {/* Quick Filter Pills (All / Empty / AC / Non-AC) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-600">Quick Filter:</span>
            <button
              type="button"
              onClick={() => setRoomFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                roomFilter === 'ALL'
                  ? 'bg-[#0f292e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Show All (15)
            </button>
            <button
              type="button"
              onClick={() => setRoomFilter('AVAILABLE')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                roomFilter === 'AVAILABLE'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              🟢 Empty Rooms Only ({availableRooms})
            </button>
            <button
              type="button"
              onClick={() => setRoomFilter('AC')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
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
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                roomFilter === 'NON_AC'
                  ? 'bg-[#0f292e] text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🌿 Non-AC ({nonAcRooms.length})
            </button>
          </div>

          {/* 15 Room Cards: 3 Columns on Tablet/Desktop, Senior-Friendly Sizing */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedRooms.map((room) => {
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
                  className={`flex flex-col justify-between rounded-2xl border-2 p-3.5 transition shadow-xs ${tileStyles[room.status]}`}
                >
                  <div>
                    {/* Top Row: Room Number + AC Badge (Always on one line) */}
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

                    {/* Middle Info: Rate or Guest Name */}
                    <div className="mt-2.5">
                      {room.status === 'Available' && (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-emerald-800">
                            🟢 Empty (Free to Give)
                          </p>
                          <p className="text-sm font-extrabold text-stone-900">
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
                          <p className="truncate text-sm font-bold text-stone-900">
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

                  {/* Bottom Action Button (Clear, Big Click Target) */}
                  <div className="mt-3 border-t border-black/10 pt-2.5">
                    {room.status === 'Available' ? (
                      <button
                        type="button"
                        onClick={() => onOpenNewBooking(room.roomNumber)}
                        className="flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-700 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800 transition cursor-pointer"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        + Book Room {room.roomNumber}
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
                        className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#0f292e] py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#173a41] transition cursor-pointer"
                      >
                        <ReceiptIndianRupee className="h-3.5 w-3.5 text-amber-300" />
                        View / Food Bill
                      </button>
                    ) : room.status === 'Booked' ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('checkin')}
                        className="flex w-full items-center justify-center gap-1 rounded-xl bg-amber-600 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 transition cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Check In Guest
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateRoomStatus && onUpdateRoomStatus(room.roomNumber, 'Available')}
                        className="flex w-full items-center justify-center gap-1 rounded-xl bg-stone-700 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-stone-800 transition cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        Mark Clean &amp; Free
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar: AC & Non-AC Summary */}
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs sm:text-sm text-stone-700 sm:flex-row sm:items-center sm:justify-between">
            <span>
              ❄️ <strong>AC Rooms:</strong> {acOccupied} occupied out of {acRooms.length}
            </span>
            <span>
              🌿 <strong>Non-AC Rooms:</strong> {nonAcOccupied} occupied out of {nonAcRooms.length}
            </span>
          </div>
        </section>

        {/* Right Side: Guest Bookings Register (Clear cards, Senior-Friendly, Clean data) */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs xl:col-span-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                Current &amp; Upcoming Guests
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Guests staying right now &amp; arriving soon
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenNewBooking()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f292e] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#173a41] transition cursor-pointer self-start sm:self-center"
            >
              <CalendarPlus className="h-4 w-4 text-amber-300" />
              + New Booking
            </button>
          </div>

          {/* Bookings Card List */}
          <div className="mt-4 space-y-3">
            {recentBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center">
                <p className="text-sm font-bold text-stone-700">No active bookings right now</p>
                <button
                  type="button"
                  onClick={() => onOpenNewBooking()}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0f292e] px-4 py-2 text-xs font-bold text-white"
                >
                  + Add First Guest Booking
                </button>
              </div>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-2xs transition hover:border-[#0f292e] hover:shadow-xs"
                >
                  {/* Top Row: Name + Room + Source */}
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

                  {/* Middle Row: Stay Dates & Mobile Phone */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2 text-xs sm:text-sm text-stone-700">
                    <span className="font-semibold">
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

                  {/* Bottom Action Row */}
                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5">
                    {b.status === 'Checked-in' ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenBillingForBooking) {
                            onOpenBillingForBooking(b.id);
                          } else {
                            onNavigate('billing');
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0f292e] hover:underline"
                      >
                        <ReceiptIndianRupee className="h-4 w-4 text-[#c27d38]" />
                        Add Food &amp; Print Bill →
                      </button>
                    ) : b.status === 'Confirmed' ? (
                      <button
                        type="button"
                        onClick={() => onNavigate('checkin')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
                      >
                        <UserCheck className="h-4 w-4" />
                        Check In Arriving Guest →
                      </button>
                    ) : (
                      <span className="text-xs text-stone-500">
                        {b.status}
                      </span>
                    )}

                    <span className="text-[11px] font-bold text-stone-500">
                      ₹{b.nightlyRateSnapshot} / night
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Helper at Bottom */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs sm:text-sm text-amber-950">
            <span>Want to check in an arriving guest right now?</span>
            <button
              type="button"
              onClick={() => onNavigate('checkin')}
              className="font-bold underline hover:text-amber-900 shrink-0"
            >
              Go to Check-In Page →
            </button>
          </div>
        </section>
      </div>

      {/* Property Showcase with Genuine Sunshine Home Stay Photographs */}
      <section className="overflow-hidden rounded-2xl border-2 border-stone-200 bg-white shadow-sm">
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
                <div className="overflow-hidden rounded-xl border border-stone-200">
                  <PropertyPhoto
                    photoId="room-interior-verified"
                    customOverrides={customPhotoOverrides}
                    aspectClass="h-full min-h-[140px]"
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-stone-200">
                  <PropertyPhoto
                    photoId="placeholder-dining"
                    customOverrides={customPhotoOverrides}
                    aspectClass="h-full min-h-[140px]"
                    slotTitle="Dining Area Photo"
                  />
                </div>
                <div className="overflow-hidden rounded-xl border border-stone-200">
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
};
