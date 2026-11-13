import React from 'react';
import type {
  BookingSource,
  BookingStatus,
  PaymentStatus,
  RoomStatus,
} from '../types/hms';

export const RoomStatusBadge: React.FC<{ status: RoomStatus; compact?: boolean }> = ({
  status,
  compact = false,
}) => {
  const styles: Record<RoomStatus, string> = {
    Available: 'bg-emerald-50 text-emerald-950 border-emerald-300 font-bold',
    Booked: 'bg-amber-50 text-amber-950 border-amber-300 font-bold',
    Occupied: 'bg-sky-50 text-sky-950 border-sky-300 font-bold',
    Maintenance: 'bg-stone-100 text-stone-900 border-stone-300 font-bold',
  };

  const dots: Record<RoomStatus, string> = {
    Available: 'bg-emerald-600',
    Booked: 'bg-amber-600',
    Occupied: 'bg-sky-700',
    Maintenance: 'bg-stone-500',
  };

  const labels: Record<RoomStatus, string> = {
    Available: 'Empty (Free to Give)',
    Booked: 'Booked in Advance',
    Occupied: 'Guest Inside (Full)',
    Maintenance: 'Cleaning / Repair',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${
        compact ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      } ${styles[status]}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dots[status]}`} />
      {compact ? status : labels[status]}
    </span>
  );
};

export const BookingStatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const styles: Record<BookingStatus, string> = {
    Pending: 'bg-amber-50 text-amber-950 border-amber-300',
    Confirmed: 'bg-teal-50 text-teal-950 border-teal-300',
    'Checked-in': 'bg-sky-50 text-sky-950 border-sky-300 font-black',
    'Checked-out': 'bg-stone-100 text-stone-800 border-stone-300',
    Cancelled: 'bg-rose-50 text-rose-950 border-rose-300',
  };

  const labels: Record<BookingStatus, string> = {
    Pending: 'Advance Pending',
    Confirmed: 'Booking Confirmed',
    'Checked-in': 'Guest in Room',
    'Checked-out': 'Checked Out (Left)',
    Cancelled: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

export const SourceBadge: React.FC<{ source: BookingSource }> = ({ source }) => {
  const styles: Record<BookingSource, string> = {
    Direct: 'bg-stone-100 text-stone-900 border-stone-300',
    'Walk-in': 'bg-orange-50 text-orange-950 border-orange-300 font-bold',
    MakeMyTrip: 'bg-rose-50 text-rose-950 border-rose-300 font-bold',
    Goibibo: 'bg-indigo-50 text-indigo-950 border-indigo-300 font-bold',
  };

  const labels: Record<BookingSource, string> = {
    Direct: 'Direct Phone / WhatsApp',
    'Walk-in': 'Walk-In Guest',
    MakeMyTrip: 'MakeMyTrip',
    Goibibo: 'Goibibo',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs ${styles[source]}`}
    >
      {labels[source]}
    </span>
  );
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const styles: Record<PaymentStatus, string> = {
    Paid: 'bg-emerald-50 text-emerald-950 border-emerald-300 font-black',
    'Partially Paid': 'bg-amber-50 text-amber-950 border-amber-300 font-black',
    Pending: 'bg-rose-50 text-rose-950 border-rose-300 font-black',
  };

  const labels: Record<PaymentStatus, string> = {
    Paid: 'Bill Paid in Full',
    'Partially Paid': 'Half Paid (Balance Due)',
    Pending: 'Payment Due',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};
