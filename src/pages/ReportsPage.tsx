import React, { useMemo } from 'react';
import { ArrowRight, IndianRupee } from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { PaymentStatusBadge } from '../components/StatusBadge';
import type { Bill, Booking, BookingSource, Room } from '../types/hms';
import { calculateBillTotals } from '../utils/billingUtils';
import {
  addDaysISO,
  formatINR,
  formatShortDate,
  getTodayISO,
} from '../utils/dateUtils';

interface ReportsPageProps {
  rooms: Room[];
  bookings: Booking[];
  bills: Bill[];
  onOpenBillingForBooking: (bookingId: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  rooms,
  bookings,
  bills,
  onOpenBillingForBooking,
}) => {
  const today = getTodayISO();

  // Pending payments from bills
  const pendingBills = useMemo(() => {
    return bills
      .map((bill) => ({ bill, totals: calculateBillTotals(bill) }))
      .filter(({ totals }) => totals.balanceDue > 0);
  }, [bills]);

  const totalPendingAmount = useMemo(
    () => pendingBills.reduce((sum, x) => sum + x.totals.balanceDue, 0),
    [pendingBills]
  );

  const todaysSampleRevenue = useMemo(() => {
    return bills
      .filter((b) => b.billDate === today)
      .reduce((sum, b) => sum + calculateBillTotals(b).grandTotal, 0);
  }, [bills, today]);

  // Last 7 days daily collection
  const dailySeries = useMemo(() => {
    const sampleHistorical = [11200, 14800, 9600, 16400, 18900, 15200];
    return Array.from({ length: 7 }, (_, idx) => {
      const offset = idx - 6;
      const date = addDaysISO(today, offset);
      const val =
        offset === 0
          ? Math.max(todaysSampleRevenue, 12500)
          : sampleHistorical[idx] ?? 12000;
      return {
        label: formatShortDate(date),
        value: val,
        isToday: offset === 0,
      };
    });
  }, [today, todaysSampleRevenue]);

  const maxDaily = Math.max(...dailySeries.map((d) => d.value), 1);

  // 6-Month collection
  const monthlySeries = useMemo(
    () => [
      { month: 'Jun', value: 185000 },
      { month: 'Jul', value: 142000 },
      { month: 'Aug', value: 168000 },
      { month: 'Sep', value: 215000 },
      { month: 'Oct', value: 294000 },
      { month: 'Nov', value: 318000 + Math.round(todaysSampleRevenue * 0.5) },
    ],
    [todaysSampleRevenue]
  );
  const maxMonthly = Math.max(...monthlySeries.map((m) => m.value), 1);

  // Booking source breakdown
  const sourceStats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'Cancelled');
    const sources: BookingSource[] = [
      'Direct',
      'Walk-in',
      'MakeMyTrip',
      'Goibibo',
    ];
    const sourceDisplayNames: Record<BookingSource, string> = {
      Direct: 'Direct Phone / WhatsApp',
      'Walk-in': 'Walk-In Guests',
      MakeMyTrip: 'MakeMyTrip',
      Goibibo: 'Goibibo',
    };
    const colors: Record<BookingSource, string> = {
      Direct: '#0f292e',
      'Walk-in': '#c27d38',
      MakeMyTrip: '#e11d48',
      Goibibo: '#4f46e5',
    };
    const total = Math.max(1, active.length);
    return sources.map((src) => {
      const count = active.filter((b) => b.source === src).length;
      return {
        source: sourceDisplayNames[src],
        count,
        pct: Math.round((count / total) * 100),
        color: colors[src],
      };
    });
  }, [bookings]);

  // Occupancy breakdown
  const occupancyBreakdown = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter((r) => r.status === 'Occupied').length;
    const booked = rooms.filter((r) => r.status === 'Booked').length;
    const available = rooms.filter((r) => r.status === 'Available').length;
    const maintenance = rooms.filter((r) => r.status === 'Maintenance').length;
    return {
      total,
      occupied,
      booked,
      available,
      maintenance,
      pct: Math.round((occupied / Math.max(1, total)) * 100),
    };
  }, [rooms]);

  return (
    <div className="space-y-6">
      <DemoNoticeBanner
        title="Income & Room Reports"
        message="See your daily and monthly collections, pending money to take from guests, and where your bookings are coming from."
      />

      {/* Top 4 Key Numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-bold text-stone-600">Today&apos;s Total Bills</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-stone-900">
            {formatINR(todaysSampleRevenue)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            From today&apos;s guest bills
          </p>
        </div>

        <div className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-bold text-stone-600">This Month (Sample Estimate)</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-stone-900">
            {formatINR(monthlySeries[monthlySeries.length - 1].value)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Estimated tourist season collection
          </p>
        </div>

        <div className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-bold text-stone-600">Rooms Full Today</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-stone-900">
            {occupancyBreakdown.occupied} of {occupancyBreakdown.total} Rooms ({occupancyBreakdown.pct}%)
          </p>
          <p className="mt-1 text-xs text-stone-500">
            +{occupancyBreakdown.booked} rooms booked for later
          </p>
        </div>

        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/60 p-5 shadow-xs">
          <p className="text-xs sm:text-sm font-bold text-rose-900">Balance Money to Collect</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-950">
            {formatINR(totalPendingAmount)}
          </p>
          <p className="mt-1 text-xs text-rose-800 font-medium">
            From {pendingBills.length} guest bills
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Collection */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Daily Collection (Last 7 Days)
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Money collected from rooms and food each day
              </p>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
              Sample Data
            </span>
          </div>

          <div className="mt-6 flex h-56 items-end justify-between gap-2 border-b-2 border-stone-200 pb-2">
            {dailySeries.map((d) => {
              const heightPct = Math.max(12, Math.round((d.value / maxDaily) * 100));
              return (
                <div
                  key={d.label}
                  className="group flex flex-1 flex-col items-center justify-end h-full"
                >
                  <span className="mb-1 text-[10px] sm:text-xs font-bold text-stone-700 opacity-0 transition group-hover:opacity-100">
                    {formatINR(d.value)}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${
                      d.isToday
                        ? 'bg-[#c27d38] hover:bg-[#b06d2c]'
                        : 'bg-[#0f292e] hover:bg-[#173a41]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${d.label}: ${formatINR(d.value)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-2 text-xs font-bold text-stone-600">
            {dailySeries.map((d) => (
              <span
                key={d.label}
                className={`flex-1 text-center ${
                  d.isToday ? 'font-black text-[#c27d38]' : ''
                }`}
              >
                {d.isToday ? 'Today' : d.label}
              </span>
            ))}
          </div>
        </section>

        {/* Monthly Collection */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Monthly Income Trend
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Malvan holiday season income comparison
              </p>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
              Sample Data
            </span>
          </div>

          <div className="mt-6 flex h-56 items-end justify-between gap-3 border-b-2 border-stone-200 pb-2">
            {monthlySeries.map((m) => {
              const heightPct = Math.max(
                12,
                Math.round((m.value / maxMonthly) * 100)
              );
              return (
                <div
                  key={m.month}
                  className="group flex flex-1 flex-col items-center justify-end h-full"
                >
                  <span className="mb-1 text-[10px] sm:text-xs font-bold text-stone-700 opacity-0 transition group-hover:opacity-100">
                    {formatINR(m.value)}
                  </span>
                  <div
                    className="w-full max-w-[44px] rounded-t-lg bg-teal-800 transition-all hover:bg-teal-900"
                    style={{ height: `${heightPct}%` }}
                    title={`${m.month}: ${formatINR(m.value)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-3 text-xs font-bold text-stone-600">
            {monthlySeries.map((m) => (
              <span key={m.month} className="flex-1 text-center">
                {m.month}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Row 2: Room Status + Booking Sources */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Room Status */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
          <h3 className="font-display text-lg font-bold text-stone-900">
            Room Status (All 15 Rooms)
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            How many rooms are empty, full, or in repair
          </p>

          <div className="mt-5 space-y-4">
            {[
              {
                label: 'Guests In Room (Occupied)',
                count: occupancyBreakdown.occupied,
                color: 'bg-sky-600',
              },
              {
                label: 'Advance Booked',
                count: occupancyBreakdown.booked,
                color: 'bg-amber-500',
              },
              {
                label: 'Empty (Free to Give)',
                count: occupancyBreakdown.available,
                color: 'bg-emerald-600',
              },
              {
                label: 'Cleaning / Repair',
                count: occupancyBreakdown.maintenance,
                color: 'bg-stone-400',
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-xs sm:text-sm font-bold">
                  <span className="text-stone-800">{row.label}</span>
                  <span className="text-stone-600">
                    {row.count} rooms (
                    {Math.round((row.count / occupancyBreakdown.total) * 100)}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={`h-full rounded-full ${row.color} transition-all`}
                    style={{
                      width: `${(row.count / occupancyBreakdown.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Where Bookings Came From */}
        <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
          <h3 className="font-display text-lg font-bold text-stone-900">
            Where Bookings Came From
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Direct phone calls, walk-ins, and online booking apps
          </p>

          <div className="mt-5 space-y-4">
            {sourceStats.map((s) => (
              <div key={s.source}>
                <div className="mb-1 flex justify-between text-xs sm:text-sm font-bold">
                  <span className="text-stone-800">{s.source}</span>
                  <span className="text-stone-600">
                    {s.count} bookings ({s.pct}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Pending Money Table */}
      <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <IndianRupee className="h-5 w-5 text-[#c27d38]" />
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Pending Money to Collect ({pendingBills.length} Bills)
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Guest bills where payment is still remaining
              </p>
            </div>
          </div>
        </div>

        {pendingBills.length === 0 ? (
          <p className="py-10 text-center text-sm font-bold text-emerald-800">
            ✓ All guest bills are fully paid! No balance remaining.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-stone-200 text-xs font-bold uppercase text-stone-500">
                  <th className="py-3">Bill No.</th>
                  <th className="py-3">Guest &amp; Room</th>
                  <th className="py-3 text-right">Total Bill</th>
                  <th className="py-3 text-right">Paid</th>
                  <th className="py-3 text-right">Balance Due</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {pendingBills.map(({ bill, totals }) => (
                  <tr key={bill.id} className="hover:bg-stone-50">
                    <td className="py-3.5 font-bold text-stone-700">
                      {bill.invoiceNumber}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-stone-900">
                        {bill.guestName}
                      </p>
                      <p className="text-xs text-stone-600">
                        Room #{bill.roomNumber} • Phone: {bill.guestPhone}
                      </p>
                    </td>
                    <td className="py-3.5 text-right font-semibold">
                      {formatINR(totals.grandTotal)}
                    </td>
                    <td className="py-3.5 text-right text-stone-600">
                      {formatINR(bill.amountPaid)}
                    </td>
                    <td className="py-3.5 text-right font-black text-rose-800 text-base">
                      {formatINR(totals.balanceDue)}
                    </td>
                    <td className="py-3.5">
                      <PaymentStatusBadge status={totals.derivedStatus} />
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenBillingForBooking(bill.bookingId)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#0f292e] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#173a41]"
                      >
                        Open Bill <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
