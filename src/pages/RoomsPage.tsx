import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  Search,
  Snowflake,
  Users,
  Wind,
} from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { PropertyPhoto } from '../components/PropertyPhoto';
import { RoomStatusBadge } from '../components/StatusBadge';
import type {
  Booking,
  Room,
  RoomCategory,
  RoomStatus,
} from '../types/hms';
import { formatShortDate } from '../utils/dateUtils';

interface RoomsPageProps {
  rooms: Room[];
  bookings: Booking[];
  customPhotoOverrides: Record<string, string>;
  onUpdateStatus: (roomNumber: string, status: RoomStatus) => void;
  onUpdateRate: (roomNumber: string, rate: number) => void;
  onOpenNewBooking: (roomNumber: string) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  rooms,
  bookings,
  customPhotoOverrides,
  onUpdateStatus,
  onUpdateRate,
  onOpenNewBooking,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'All' | RoomCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RoomStatus>('All');
  const [search, setSearch] = useState('');

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !r.roomNumber.toLowerCase().includes(q) &&
          !r.name.toLowerCase().includes(q) &&
          !r.floor.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [rooms, categoryFilter, statusFilter, search]);

  const counts = useMemo(
    () => ({
      total: rooms.length,
      ac: rooms.filter((r) => r.category === 'AC').length,
      nonAc: rooms.filter((r) => r.category === 'Non-AC').length,
      available: rooms.filter((r) => r.status === 'Available').length,
      occupied: rooms.filter((r) => r.status === 'Occupied').length,
    }),
    [rooms]
  );

  return (
    <div className="space-y-6">
      <DemoNoticeBanner
        title="All 15 Rooms (Room 101 to 115)"
        message="Here you can see all your rooms. If a room gets dirty or needs cleaning, change its status. You can also change the room price per night anytime."
      />

      {/* Simple Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-stone-200 bg-white p-4 sm:p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs sm:text-sm font-bold text-stone-700">Show:</span>
          <div className="inline-flex rounded-xl border-2 border-stone-200 bg-stone-50 p-1">
            <button
              type="button"
              onClick={() => setCategoryFilter('All')}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                categoryFilter === 'All'
                  ? 'bg-[#0f292e] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              All Rooms ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('AC')}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                categoryFilter === 'AC'
                  ? 'bg-[#0f292e] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              AC Rooms ({counts.ac})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('Non-AC')}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                categoryFilter === 'Non-AC'
                  ? 'bg-[#0f292e] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Non-AC Rooms ({counts.nonAc})
            </button>
          </div>

          <div className="hidden sm:inline-flex rounded-xl border-2 border-stone-200 bg-stone-50 p-1">
            {(['All', 'Available', 'Occupied'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-[#c27d38] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st === 'All' ? 'All Rooms' : st === 'Available' ? 'Empty Only' : 'Guest Inside'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type room number (e.g. 102)..."
            className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-sm text-stone-900 focus:border-teal-700 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* 15 Room Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room) => {
          const activeBooking = bookings.find(
            (b) =>
              b.roomNumber === room.roomNumber &&
              (b.status === 'Checked-in' ||
                b.status === 'Confirmed' ||
                b.status === 'Pending')
          );

          return (
            <article
              key={room.id}
              className="flex flex-col overflow-hidden rounded-2xl border-2 border-stone-200 bg-white shadow-sm transition hover:border-stone-400 hover:shadow-md"
            >
              {/* Photo Area */}
              <div className="relative">
                <PropertyPhoto
                  photoId={room.photoId}
                  customOverrides={customPhotoOverrides}
                  aspectClass="aspect-[16/10]"
                  slotTitle={`Room ${room.roomNumber} (${room.category})`}
                />
                <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
                  <span className="rounded-xl bg-stone-950/90 px-3 py-1 text-sm font-black text-white shadow-sm">
                    Room {room.roomNumber}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold ${
                      room.category === 'AC'
                        ? 'bg-sky-900/90 text-sky-100'
                        : 'bg-amber-900/90 text-amber-100'
                    }`}
                  >
                    {room.category === 'AC' ? (
                      <Snowflake className="h-3.5 w-3.5" />
                    ) : (
                      <Wind className="h-3.5 w-3.5" />
                    )}
                    {room.category}
                  </span>
                </div>
                <div className="absolute right-3.5 top-3.5">
                  <RoomStatusBadge status={room.status} />
                </div>
              </div>

              {/* Room Content */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-stone-900">
                        {room.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600">
                        {room.floor} •{' '}
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Users className="h-3.5 w-3.5 text-stone-500" /> Fits {room.capacity} guests
                        </span>
                      </p>
                    </div>

                    {/* Room Price per night */}
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-right">
                      <p className="text-[11px] font-bold text-stone-500">Price / Night</p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-sm font-bold text-stone-600">₹</span>
                        <input
                          type="number"
                          min={0}
                          step={50}
                          value={room.sampleRatePerNight}
                          onChange={(e) =>
                            onUpdateRate(room.roomNumber, Number(e.target.value))
                          }
                          aria-label={`Price per night for room ${room.roomNumber}`}
                          className="w-20 rounded-md border border-stone-300 bg-white px-2 py-0.5 text-right text-sm font-bold text-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Room Facilities */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {room.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
                      >
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Guest Inside */}
                  {activeBooking && (
                    <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs sm:text-sm text-sky-950">
                      <p className="font-bold">
                        Guest: {activeBooking.guest.fullName}
                      </p>
                      <p className="text-xs text-sky-900 mt-0.5">
                        {activeBooking.status} • {formatShortDate(activeBooking.checkInDate)} to{' '}
                        {formatShortDate(activeBooking.checkOutDate)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Change Room Status & Book Room */}
                <div className="flex flex-col gap-2.5 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`status-select-${room.roomNumber}`}
                      className="text-xs font-bold text-stone-700 shrink-0"
                    >
                      Room Status:
                    </label>
                    <select
                      id={`status-select-${room.roomNumber}`}
                      value={room.status}
                      onChange={(e) =>
                        onUpdateStatus(room.roomNumber, e.target.value as RoomStatus)
                      }
                      className="w-full sm:w-auto rounded-xl border-2 border-stone-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-stone-900 focus:border-teal-700 focus:outline-none"
                    >
                      <option value="Available">Empty (Free to Give)</option>
                      <option value="Occupied">Guest Inside</option>
                      <option value="Booked">Booked in Advance</option>
                      <option value="Maintenance">Cleaning / Repair</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={room.status === 'Maintenance'}
                    onClick={() => onOpenNewBooking(room.roomNumber)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold shadow-xs transition ${
                      room.status === 'Maintenance'
                        ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                        : 'bg-[#0f292e] text-white hover:bg-[#173a41] active:scale-[0.98]'
                    }`}
                  >
                    <CalendarPlus className="h-4 w-4 text-amber-300" />
                    + Book Room
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
