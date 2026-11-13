import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Printer,
  Sparkles,
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
  onUpdateFoodMenuItem: _onUpdateFoodMenuItem,
}) => {
  // Filter out any mock test entries like fgghjdd
  const cleanBills = useMemo(
    () => bills.filter((b) => b && b.guestName && b.guestName !== 'fgghjdd'),
    [bills]
  );

  const [selectedBillId, setSelectedBillId] = useState<string>(() => {
    if (selectedBookingIdForBilling) {
      const found = cleanBills.find((b) => b.bookingId === selectedBookingIdForBilling);
      if (found) return found.id;
    }
    return cleanBills[0]?.id ?? '';
  });

  useEffect(() => {
    if (!selectedBookingIdForBilling) return;
    const found = cleanBills.find((b) => b.bookingId === selectedBookingIdForBilling);
    if (found) {
      setSelectedBillId(found.id);
    }
  }, [selectedBookingIdForBilling, cleanBills]);

  const activeBill = useMemo(
    () => cleanBills.find((b) => b.id === selectedBillId) ?? cleanBills[0] ?? null,
    [cleanBills, selectedBillId]
  );

  const [invoiceBill, setInvoiceBill] = useState<Bill | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Custom charge inputs
  const [customDesc, setCustomDesc] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(100);

  // 1-Click: Tap dish to add to active bill
  const handleAddFood = (menuItem: FoodMenuItem) => {
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
            id: `li-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            description: menuItem.name,
            type: 'food',
            quantity: 1,
            unitPrice: menuItem.samplePrice,
          },
        ];

    onUpsertBill({ ...activeBill, items: updatedItems });
  };

  // Change line item quantity (+ / -)
  const changeItemQuantity = (itemId: string, delta: number) => {
    if (!activeBill) return;
    const target = activeBill.items.find((i) => i.id === itemId);
    if (!target) return;

    const newQty = target.quantity + delta;
    if (newQty <= 0) {
      removeLineItem(itemId);
      return;
    }

    const updatedItems = activeBill.items.map((i) =>
      i.id === itemId ? { ...i, quantity: newQty } : i
    );
    onUpsertBill({ ...activeBill, items: updatedItems });
  };

  // Remove item
  const removeLineItem = (itemId: string) => {
    if (!activeBill) return;
    onUpsertBill({
      ...activeBill,
      items: activeBill.items.filter((i) => i.id !== itemId),
    });
  };

  // Add custom extra service
  const addCustomCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBill || !customDesc.trim()) return;
    const item: BillLineItem = {
      id: `li-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: customDesc.trim(),
      type: 'service',
      quantity: Math.max(1, customQty),
      unitPrice: Math.max(0, customPrice),
    };
    onUpsertBill({ ...activeBill, items: [...activeBill.items, item] });
    setCustomDesc('');
    setCustomQty(1);
    setCustomPrice(100);
  };

  // Mark Full Paid
  const markFullPaid = () => {
    if (!activeBill || !totals) return;
    onUpsertBill({
      ...activeBill,
      amountPaid: totals.grandTotal,
    });
  };

  const totals = activeBill ? calculateBillTotals(activeBill) : null;

  return (
    <div className="space-y-6">
      {/* Friendly Guide Banner */}
      <DemoNoticeBanner
        title="Food & Room Billing (Super Simple & Easy)"
        message="Select a room at the top. Tap any food item (Fish Thali, Solkadhi, Tea) to add it to the bill. Click 'Guest Paid in Full' when you receive money, then click 'Print Bill' to give a receipt."
      />

      {/* Step 1: Horizontal Room Selector Tabs (Impossible to miss, easy to click) */}
      <section className="rounded-2xl border-2 border-stone-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900">
              1. Select a Room to View or Add Bill:
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Click any room button below:
            </p>
          </div>
          <span className="text-xs font-bold text-stone-500">
            {cleanBills.length} Active Bills
          </span>
        </div>

        {/* Big tactile room buttons */}
        <div className="mt-3.5 flex flex-wrap gap-2.5">
          {cleanBills.map((bill) => {
            const bt = calculateBillTotals(bill);
            const selected = activeBill?.id === bill.id;
            const isDue = bt.balanceDue > 0;

            return (
              <button
                key={bill.id}
                type="button"
                onClick={() => setSelectedBillId(bill.id)}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-left transition cursor-pointer shadow-xs ${
                  selected
                    ? 'border-[#0f292e] bg-[#0f292e] text-white shadow-md'
                    : 'border-stone-300 bg-stone-50 text-stone-900 hover:border-stone-400 hover:bg-white'
                }`}
              >
                <div>
                  <p className="text-base font-black leading-tight">
                    Room #{bill.roomNumber}
                  </p>
                  <p
                    className={`text-xs font-semibold truncate max-w-[140px] ${
                      selected ? 'text-stone-200' : 'text-stone-700'
                    }`}
                  >
                    {bill.guestName}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                    isDue
                      ? selected
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-amber-100 text-amber-900'
                      : selected
                      ? 'bg-emerald-400 text-stone-950'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {isDue ? `Due: ${formatINR(bt.balanceDue)}` : 'Paid'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Billing Paper Card (The Hero of the page) */}
      {!activeBill || !totals ? (
        <div className="rounded-2xl border-2 border-stone-200 bg-white p-12 text-center text-base font-medium text-stone-500">
          Please click a room button above to view their bill.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left / Center: The Bill Paper (Like a Real Hotel Cash Memo) */}
          <section className="rounded-3xl border-2 border-stone-300 bg-white p-6 sm:p-8 shadow-sm lg:col-span-7 space-y-6">
            {/* Bill Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-stone-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                    Bill #{activeBill.invoiceNumber}
                  </span>
                  <PaymentStatusBadge status={totals.derivedStatus} />
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black text-stone-900 font-display">
                  Room #{activeBill.roomNumber} — {activeBill.guestName}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  📞 Phone: <strong>{activeBill.guestPhone}</strong> • Date:{' '}
                  {formatFullDate(activeBill.billDate)}
                </p>
              </div>

              {/* Big Print Button */}
              <button
                type="button"
                onClick={() => setInvoiceBill(activeBill)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#c27d38] px-6 py-3.5 text-sm sm:text-base font-black text-white shadow-md hover:bg-[#b06d2c] transition cursor-pointer shrink-0"
              >
                <Printer className="h-5 w-5" />
                Print Bill (Receipt)
              </button>
            </div>

            {/* Section 1: Room Rent */}
            <div className="rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-base font-black text-stone-900">
                  🛏️ Room Stay Rent
                </span>
                <span className="text-lg font-black text-stone-900">
                  {formatINR(totals.roomTotal)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-stone-700">
                <div className="flex items-center gap-2">
                  <span>Stay:</span>
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
                    className="w-16 rounded-lg border-2 border-stone-300 bg-white px-2 py-1 text-center font-bold text-stone-900"
                  />
                  <span>nights</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>Price / Night: ₹</span>
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
                    className="w-24 rounded-lg border-2 border-stone-300 bg-white px-2 py-1 text-right font-bold text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Food & Drinks on the Bill */}
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                <span className="text-base font-black text-stone-900">
                  🍲 Malvani Food &amp; Tea Added ({activeBill.items.length} items)
                </span>
                <span className="text-base font-bold text-stone-800">
                  Subtotal: {formatINR(totals.foodTotal + totals.serviceTotal)}
                </span>
              </div>

              {activeBill.items.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-stone-300 p-6 text-center text-stone-500 bg-stone-50">
                  <p className="text-sm font-semibold">
                    No food or tea added yet.
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tap any food button on the right to add dishes to this room bill.
                  </p>
                </div>
              ) : (
                <div className="divide-y-2 divide-stone-100 rounded-2xl border-2 border-stone-200 bg-white">
                  {activeBill.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-900 text-base">
                          {item.description}
                        </p>
                        <p className="text-xs text-stone-500">
                          ₹{item.unitPrice} each • {item.type}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Minus / Plus Quantity Buttons */}
                        <div className="flex items-center rounded-xl border-2 border-stone-300 bg-stone-50">
                          <button
                            type="button"
                            onClick={() => changeItemQuantity(item.id, -1)}
                            className="p-1.5 text-stone-700 hover:bg-stone-200 transition rounded-l-lg cursor-pointer"
                            title="Minus 1"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-2.5 text-sm font-black text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeItemQuantity(item.id, 1)}
                            className="p-1.5 text-stone-700 hover:bg-stone-200 transition rounded-r-lg cursor-pointer"
                            title="Plus 1"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <span className="w-20 text-right font-black text-stone-900 text-base">
                          {formatINR(item.quantity * item.unitPrice)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Totals & Cash Payment */}
            <div className="rounded-2xl border-2 border-stone-300 bg-stone-50 p-5 space-y-3">
              <div className="flex justify-between text-stone-700 text-sm font-semibold">
                <span>Room Charges ({activeBill.nights} nights):</span>
                <span>{formatINR(totals.roomTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-700 text-sm font-semibold">
                <span>Food &amp; Drinks Charges:</span>
                <span>{formatINR(totals.foodTotal + totals.serviceTotal)}</span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-800 text-sm font-bold">
                  <span>Discount Given:</span>
                  <span>-{formatINR(totals.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500 text-xs">
                <span>Taxes / GST ({activeBill.taxPercent}%):</span>
                <span>{formatINR(totals.taxAmount)}</span>
              </div>

              {/* Big Grand Total */}
              <div className="flex items-center justify-between border-t-2 border-stone-300 pt-3">
                <span className="text-xl sm:text-2xl font-black text-stone-900">
                  TOTAL BILL:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0f292e]">
                  {formatINR(totals.grandTotal)}
                </span>
              </div>

              {/* Payment Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t-2 border-stone-200 pt-3">
                <div>
                  <p className="text-xs text-stone-600 font-bold">
                    Money Received So Far:
                  </p>
                  <p className="text-lg font-black text-emerald-800">
                    {formatINR(activeBill.amountPaid)}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-stone-600 font-bold">
                    Remaining Balance to Take:
                  </p>
                  <p
                    className={`text-xl font-black ${
                      totals.balanceDue > 0 ? 'text-amber-800' : 'text-emerald-800'
                    }`}
                  >
                    {formatINR(totals.balanceDue)}
                  </p>
                </div>
              </div>

              {/* One-Click Full Payment Button */}
              {totals.balanceDue > 0 ? (
                <button
                  type="button"
                  onClick={markFullPaid}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3.5 text-base font-black text-white shadow-md hover:bg-emerald-800 transition cursor-pointer"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  ✓ Guest Paid in Full ({formatINR(totals.grandTotal)})
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100/90 py-3 text-sm font-black text-emerald-950 border border-emerald-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  Bill is Fully Paid! (Zero balance left)
                </div>
              )}
            </div>

            {/* Optional Collapsible: More Options (Discount, Custom Charges) */}
            <div className="border-t border-stone-200 pt-3">
              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="flex items-center justify-between w-full text-xs font-bold text-stone-600 hover:text-stone-900 py-1"
              >
                <span>
                  ⚙️ More Options (Give Discount, Laundry, Extra Bed, Edit Cash)
                </span>
                {showMoreOptions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showMoreOptions && (
                <div className="mt-3 space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Discount (₹):
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
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Edit Money Paid (₹):
                      </label>
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
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  </div>

                  {/* Add Other Extra Item Form */}
                  <form
                    onSubmit={addCustomCharge}
                    className="flex flex-col sm:flex-row items-center gap-2 border-t border-stone-200 pt-3"
                  >
                    <input
                      type="text"
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="Other item (e.g. Extra Bed, Laundry)"
                      className="w-full sm:flex-1 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900"
                    />
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-xs font-bold">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-20 rounded-xl border border-stone-300 bg-white px-2 py-1.5 text-xs font-bold"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-stone-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-900"
                      >
                        + Add Extra
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </section>

          {/* Right Column: 1-Click Malvani Food Menu Buttons */}
          <section className="rounded-3xl border-2 border-stone-300 bg-white p-5 sm:p-6 shadow-sm lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5 border-b-2 border-stone-200 pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-[#c27d38]">
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-stone-900 font-display">
                  Tap Any Dish to Add:
                </h3>
                <p className="text-xs text-stone-600">
                  Adds directly to Room #{activeBill.roomNumber}&apos;s bill
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-stone-600">
              Just tap any button below:
            </p>

            {/* Big 1-Click Food Buttons */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {foodMenu.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddFood(item)}
                  className="group flex items-center justify-between rounded-2xl border-2 border-stone-200 bg-stone-50 p-3.5 text-left transition hover:border-[#0f292e] hover:bg-teal-50/50 hover:shadow-xs cursor-pointer active:scale-[0.98]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-stone-900 group-hover:text-[#0f292e]">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-base font-black text-emerald-800">
                      ₹{item.samplePrice}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f292e] text-amber-300 font-black text-sm group-hover:scale-105 transition">
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Menu Rate Customizer */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
              <div className="flex items-center gap-1.5 font-bold text-stone-700">
                <Sparkles className="h-3.5 w-3.5 text-[#c27d38]" />
                <span>Want to edit standard food prices?</span>
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                Food rates are sample Malvani prices. You can edit any rate in Hotel Settings.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Printable Invoice Modal Preview */}
      <InvoiceModal
        bill={invoiceBill}
        settings={settings}
        onClose={() => setInvoiceBill(null)}
      />
    </div>
  );
};
