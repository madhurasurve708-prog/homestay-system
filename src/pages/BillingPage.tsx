import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Printer,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { InvoiceModal } from '../components/InvoiceModal';
import { PaymentStatusBadge } from '../components/StatusBadge';
import type {
  Bill,
  BillLineItem,
  FoodMenuItem,
  PropertySettings,
} from '../types/hms';
import { calculateBillTotals } from '../utils/billingUtils';
import { formatFullDate, formatINR } from '../utils/dateUtils';

interface BillingPageProps {
  bills: Bill[];
  foodMenu: FoodMenuItem[];
  settings: PropertySettings;
  selectedBookingIdForBilling: string | null;
  onUpsertBill: (bill: Bill) => void;
  onUpdateFoodMenuItem: (item: FoodMenuItem) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  bills,
  foodMenu,
  settings,
  selectedBookingIdForBilling,
  onUpsertBill,
  onUpdateFoodMenuItem,
}) => {
  const [selectedBillId, setSelectedBillId] = useState<string>(() => {
    if (selectedBookingIdForBilling) {
      const found = bills.find((b) => b.bookingId === selectedBookingIdForBilling);
      if (found) return found.id;
    }
    return bills[0]?.id ?? '';
  });

  useEffect(() => {
    if (!selectedBookingIdForBilling) return;
    const found = bills.find((b) => b.bookingId === selectedBookingIdForBilling);
    if (found) {
      setSelectedBillId(found.id);
    }
  }, [selectedBookingIdForBilling, bills]);

  const activeBill = useMemo(
    () => bills.find((b) => b.id === selectedBillId) ?? bills[0] ?? null,
    [bills, selectedBillId]
  );

  const [invoiceBill, setInvoiceBill] = useState<Bill | null>(null);
  const [customDesc, setCustomDesc] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(200);

  const addMenuItemToBill = (menuItem: FoodMenuItem) => {
    if (!activeBill) return;
    const existing = activeBill.items.find(
      (i) => i.description === menuItem.name && i.type === 'food'
    );
    const updatedItems: BillLineItem[] = existing
      ? activeBill.items.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [
          ...activeBill.items,
          {
            id: `li-${Date.now()}`,
            description: menuItem.name,
            type: 'food',
            quantity: 1,
            unitPrice: menuItem.samplePrice,
          },
        ];

    onUpsertBill({ ...activeBill, items: updatedItems });
  };

  const addCustomCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBill || !customDesc.trim()) return;
    const item: BillLineItem = {
      id: `li-${Date.now()}`,
      description: customDesc.trim(),
      type: 'service',
      quantity: Math.max(1, customQty),
      unitPrice: Math.max(0, customPrice),
    };
    onUpsertBill({ ...activeBill, items: [...activeBill.items, item] });
    setCustomDesc('');
    setCustomQty(1);
  };

  const removeLineItem = (itemId: string) => {
    if (!activeBill) return;
    onUpsertBill({
      ...activeBill,
      items: activeBill.items.filter((i) => i.id !== itemId),
    });
  };

  const totals = activeBill ? calculateBillTotals(activeBill) : null;

  return (
    <div className="space-y-6">
      <DemoNoticeBanner
        title="Food, Tea & Room Billing"
        message="Click any guest room on the left to see their stay charges. Click '+ Add' next to any Malvani dish or tea to add it to their room bill."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Room Bill Selector + Malvani Food Menu */}
        <div className="space-y-6 lg:col-span-5">
          {/* Guest Bills List */}
          <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-lg font-bold text-stone-900">
              1. Pick a Guest Room ({bills.length} Bills)
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Click a room to open their bill:
            </p>
            <div className="mt-3.5 max-h-80 space-y-2.5 overflow-y-auto pr-1">
              {bills.map((bill) => {
                const bt = calculateBillTotals(bill);
                const selected = activeBill?.id === bill.id;
                return (
                  <button
                    key={bill.id}
                    type="button"
                    onClick={() => setSelectedBillId(bill.id)}
                    className={`w-full rounded-2xl border-2 p-3.5 text-left transition ${
                      selected
                        ? 'border-[#0f292e] bg-[#0f292e] text-white shadow-md'
                        : 'border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black">
                        Room #{bill.roomNumber} — {bill.guestName}
                      </span>
                      <PaymentStatusBadge status={bt.derivedStatus} />
                    </div>
                    <div
                      className={`mt-1.5 flex items-center justify-between text-xs ${
                        selected ? 'text-stone-200' : 'text-stone-600'
                      }`}
                    >
                      <span>Bill No: {bill.invoiceNumber}</span>
                      <span className="font-bold">
                        Total {formatINR(bt.grandTotal)} • Due {formatINR(bt.balanceDue)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Malvani Food Menu Additions */}
          <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-[#c27d38]" />
              <h3 className="font-display text-lg font-bold text-stone-900">
                2. Add Malvani Food &amp; Tea
              </h3>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Click &ldquo;+ Add to Bill&rdquo; to add items to{' '}
              <strong>Room #{activeBill?.roomNumber ?? ''}</strong>
            </p>

            <div className="mt-4 max-h-96 space-y-2.5 overflow-y-auto pr-1">
              {foodMenu.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-stone-500 font-medium">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        ₹
                        <input
                          type="number"
                          min={0}
                          step={5}
                          value={item.samplePrice}
                          onChange={(e) =>
                            onUpdateFoodMenuItem({
                              ...item,
                              samplePrice: Math.max(0, Number(e.target.value)),
                            })
                          }
                          aria-label={`Price for ${item.name}`}
                          className="w-14 rounded border border-stone-300 bg-white px-1.5 py-0.5 text-xs font-bold text-stone-900 inline-block text-right ml-1"
                        />
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={!activeBill}
                      onClick={() => addMenuItemToBill(item)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#0f292e] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#173a41] active:scale-[0.97]"
                    >
                      <Plus className="h-4 w-4 text-amber-300" />
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Active Bill Details & Sample Invoice */}
        <div className="lg:col-span-7">
          {!activeBill || !totals ? (
            <div className="rounded-2xl border-2 border-stone-200 bg-white p-12 text-center text-sm font-medium text-stone-500">
              Please click a guest room on the left side.
            </div>
          ) : (
            <section className="rounded-2xl border-2 border-stone-200 bg-white p-6 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
                      Bill No: {activeBill.invoiceNumber}
                    </span>
                    <PaymentStatusBadge status={totals.derivedStatus} />
                  </div>
                  <h3 className="mt-1.5 font-display text-2xl font-bold text-stone-900">
                    Room #{activeBill.roomNumber} — {activeBill.guestName}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Mobile: {activeBill.guestPhone} • Date: {formatFullDate(activeBill.billDate)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInvoiceBill(activeBill)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c27d38] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b06d2c] active:scale-[0.98]"
                >
                  <Printer className="h-4 w-4" />
                  Print Guest Bill
                </button>
              </div>

              {/* Room Stay Rent */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs sm:text-sm font-bold text-stone-800">
                  Room Rent
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-600">
                      Stay Nights
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={activeBill.nights}
                      onChange={(e) =>
                        onUpsertBill({
                          ...activeBill,
                          nights: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-600">
                      Rate per Night (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={activeBill.roomRatePerNight}
                      onChange={(e) =>
                        onUpsertBill({
                          ...activeBill,
                          roomRatePerNight: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-900"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-xs font-medium text-stone-600">Total Room Rent</span>
                    <span className="text-xl font-black text-stone-900">
                      {formatINR(totals.roomTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Food & Service Items */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-800">
                  Food, Tea &amp; Extra Charges
                </h4>

                {activeBill.items.length === 0 ? (
                  <p className="mt-2 rounded-xl border border-dashed border-stone-300 p-5 text-center text-xs sm:text-sm text-stone-500">
                    No food added yet. Use the menu on the left to add items.
                  </p>
                ) : (
                  <div className="mt-2 divide-y divide-stone-200 rounded-xl border border-stone-200">
                    {activeBill.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-stone-900">
                            {item.description}
                          </span>
                          <span className="ml-2 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600 uppercase">
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-stone-700">
                            {item.quantity} × {formatINR(item.unitPrice)}
                          </span>
                          <span className="w-20 text-right font-black text-stone-900">
                            {formatINR(item.quantity * item.unitPrice)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Remove ${item.description}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Extra Charge Form */}
                <form
                  onSubmit={addCustomCharge}
                  className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-stone-50 p-3 border border-stone-200"
                >
                  <input
                    type="text"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="Other charge (e.g. Extra mattress, mineral water, laundry)"
                    className="flex-1 min-w-[200px] rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-stone-900"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-600">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-16 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs sm:text-sm font-bold text-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0f292e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#173a41]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + Add Item
                  </button>
                </form>
              </div>

              {/* Bill Totals Summary */}
              <div className="grid grid-cols-1 gap-5 border-t-2 border-stone-200 pt-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-700">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={activeBill.discountAmount}
                      onChange={(e) =>
                        onUpsertBill({
                          ...activeBill,
                          discountAmount: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2 text-sm font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-700">
                      Money Paid by Guest (₹)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        value={activeBill.amountPaid}
                        onChange={(e) =>
                          onUpsertBill({
                            ...activeBill,
                            amountPaid: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2 text-sm font-bold text-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpsertBill({
                            ...activeBill,
                            amountPaid: totals.grandTotal,
                          })
                        }
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        Full Paid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Big Totals Box */}
                <div className="rounded-2xl border-2 border-stone-200 bg-stone-50 p-5 space-y-2 text-sm">
                  <div className="flex justify-between text-stone-700">
                    <span>Room Rent</span>
                    <span className="font-semibold">{formatINR(totals.roomTotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Food &amp; Extra Charges</span>
                    <span className="font-semibold">{formatINR(totals.foodTotal + totals.serviceTotal)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Discount Given</span>
                      <span>-{formatINR(totals.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-700">
                    <span>Tax / GST ({activeBill.taxPercent}%)</span>
                    <span className="font-semibold">{formatINR(totals.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-stone-200 pt-3 text-lg font-black text-stone-900">
                    <span>Total Bill</span>
                    <span>{formatINR(totals.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Money Paid by Guest</span>
                    <span className="font-semibold">{formatINR(activeBill.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-300 pt-2 text-base font-black text-amber-900">
                    <span>Balance to Take</span>
                    <span>{formatINR(totals.balanceDue)}</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <InvoiceModal
        bill={invoiceBill}
        settings={settings}
        onClose={() => setInvoiceBill(null)}
      />
    </div>
  );
};
