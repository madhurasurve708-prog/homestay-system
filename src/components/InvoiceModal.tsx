import React from 'react';
import { Printer, X } from 'lucide-react';
import type { Bill, PropertySettings } from '../types/hms';
import { calculateBillTotals } from '../utils/billingUtils';
import { formatFullDate, formatINR } from '../utils/dateUtils';
import { PaymentStatusBadge } from './StatusBadge';

interface InvoiceModalProps {
  bill: Bill | null;
  settings: PropertySettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  bill,
  settings,
  onClose,
}) => {
  if (!bill) return null;

  const totals = calculateBillTotals(bill);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-stone-200 bg-white shadow-2xl">
        <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b-2 border-stone-200 bg-white px-6 py-4">
          <span className="text-xs sm:text-sm font-bold text-stone-700">
            Guest Bill Preview
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f292e] px-4 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-[#173a41] shadow-xs"
            >
              <Printer className="h-4 w-4 text-amber-300" />
              Click to Print Bill
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              aria-label="Close bill preview"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div id="printable-invoice" className="p-8 text-stone-900 font-sans">
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-bold text-amber-950">
            Sunshine Home Stay Demo Bill
          </div>

          <div className="flex flex-col justify-between gap-4 border-b-2 border-stone-200 pb-6 sm:flex-row">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0f292e]">
                {settings.propertyName}
              </h2>
              <p className="mt-1 text-xs text-stone-600">{settings.address}</p>
              <p className="text-xs text-stone-600">
                {settings.city}, {settings.state} – {settings.pincode}
              </p>
              <p className="mt-1 text-xs font-semibold text-stone-700">Phone: {settings.contactPhone}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Bill Number
              </p>
              <p className="text-base font-black text-stone-900">{bill.invoiceNumber}</p>
              <p className="mt-1 text-xs text-stone-600">
                Date: {formatFullDate(bill.billDate)}
              </p>
              <div className="mt-2 sm:flex sm:justify-end">
                <PaymentStatusBadge status={totals.derivedStatus} />
              </div>
            </div>
          </div>

          <div className="my-5 grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-stone-500">
                Guest Details
              </p>
              <p className="mt-1 text-base font-bold text-stone-900">
                {bill.guestName}
              </p>
              <p className="text-xs text-stone-700 font-semibold">{bill.guestPhone}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase text-stone-500">
                Room Stay
              </p>
              <p className="mt-1 text-base font-bold text-stone-900">
                Room #{bill.roomNumber} ({bill.nights}{' '}
                {bill.nights === 1 ? 'Night' : 'Nights'})
              </p>
              <p className="text-xs text-stone-700">
                Price: {formatINR(bill.roomRatePerNight)} per night
              </p>
            </div>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-stone-200 text-left text-xs font-bold uppercase text-stone-600">
                <th className="py-3">Item Description</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right">Price</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
              <tr>
                <td className="py-3.5 font-bold text-stone-900">
                  Room Rent — Room #{bill.roomNumber}
                </td>
                <td className="py-3.5 text-right font-medium">{bill.nights}</td>
                <td className="py-3.5 text-right">{formatINR(bill.roomRatePerNight)}</td>
                <td className="py-3.5 text-right font-black text-stone-900">
                  {formatINR(totals.roomTotal)}
                </td>
              </tr>
              {bill.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-stone-800 font-medium">
                    {item.description}
                  </td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">{formatINR(item.unitPrice)}</td>
                  <td className="py-3 text-right font-bold text-stone-900">
                    {formatINR(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 border-t-2 border-stone-200 pt-4">
            <div className="ml-auto max-w-xs space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-700">
                <span>Room Charges</span>
                <span>{formatINR(totals.roomTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Food &amp; Extra Items</span>
                <span>{formatINR(totals.foodTotal + totals.serviceTotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Discount</span>
                  <span>-{formatINR(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-700">
                <span>Tax / GST ({bill.taxPercent}%)</span>
                <span>{formatINR(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-stone-200 pt-2 text-base sm:text-lg font-black text-stone-900">
                <span>Total Bill</span>
                <span>{formatINR(totals.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Amount Paid</span>
                <span>{formatINR(bill.amountPaid)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-300 pt-2 text-sm sm:text-base font-black text-amber-900">
                <span>Remaining Balance to Take</span>
                <span>{formatINR(totals.balanceDue)}</span>
              </div>
            </div>
          </div>

          {bill.notes && (
            <p className="mt-6 rounded-xl bg-stone-50 border border-stone-200 p-3 text-xs text-stone-600">
              Note: {bill.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
