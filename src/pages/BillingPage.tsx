import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Minus,
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

  // Filter bills list by status
  const [billFilter, setBillFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const displayedBills = useMemo(() => {
    return cleanBills.filter((b) => {
      const bt = calculateBillTotals(b);
      if (billFilter === 'UNPAID') return bt.balanceDue > 0;
      if (billFilter === 'PAID') return bt.balanceDue <= 0;
      return true;
    });
  }, [cleanBills, billFilter]);

  // Food Menu category filter
  const [foodCategory, setFoodCategory] = useState<string>('All');
  const foodCategories = useMemo(() => {
    const cats = Array.from(new Set(foodMenu.map((f) => f.category)));
    return ['All', ...cats];
  }, [foodMenu]);

  const displayedFood = useMemo(() => {
    if (foodCategory === 'All') return foodMenu;
    return foodMenu.filter((f) => f.category === foodCategory);
  }, [foodMenu, foodCategory]);

  const [invoiceBill, setInvoiceBill] = useState<Bill | null>(null);
  const [customDesc, setCustomDesc] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customPrice, setCustomPrice] = useState(100);

  // Quick Add / Increment Food Item
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
            id: `li-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            description: menuItem.name,
            type: 'food',
            quantity: 1,
            unitPrice: menuItem.samplePrice,
          },
        ];

    onUpsertBill({ ...activeBill, items: updatedItems });
  };

  // Change Quantity (+ / -)
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

  // Custom Extra Charge
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
      {/* Friendly Notice Banner in Simple English */}
      <DemoNoticeBanner
        title="Food & Room Billing (Very Easy to Use)"
        message="1. Pick a room on the left.  2. Click '+ Add' next to any Malvani dish or tea.  3. Click 'Mark Full Paid' or 'Print Bill' on the right."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: 1. Pick Room + 2. Add Malvani Food */}
        <div className="space-y-6 xl:col-span-5">
          {/* Step 1: Pick a Guest Room */}
          <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">
                  Step 1: Pick a Guest Room
                </h3>
                <p className="text-xs text-stone-600">
                  Click a room to open their bill
                </p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                {cleanBills.length} Bills
              </span>
            </div>

            {/* Quick Filter: All / Unpaid / Paid */}
            <div className="mt-3 flex gap-1.5 rounded-xl bg-stone-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillFilter('ALL')}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  billFilter === 'ALL'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({cleanBills.length})
              </button>
              <button
                type="button"
                onClick={() => setBillFilter('UNPAID')}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  billFilter === 'UNPAID'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                Money Due
              </button>
              <button
                type="button"
                onClick={() => setBillFilter('PAID')}
                className={`flex-1 rounded-lg py-1.5 transition ${
                  billFilter === 'PAID'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-800 hover:text-emerald-950'
                }`}
              >
                Fully Paid
              </button>
            </div>

            {/* Scrollable Bills List */}
            <div className="mt-3.5 max-h-72 space-y-2.5 overflow-y-auto pr-1">
              {displayedBills.length === 0 ? (
                <p className="py-6 text-center text-xs font-medium text-stone-500">
                  No bills in this category.
                </p>
              ) : (
                displayedBills.map((bill) => {
                  const bt = calculateBillTotals(bill);
                  const selected = activeBill?.id === bill.id;
                  const isDue = bt.balanceDue > 0;

                  return (
                    <button
                      key={bill.id}
                      type="button"
                      onClick={() => setSelectedBillId(bill.id)}
                      className={`w-full rounded-2xl border-2 p-3 text-left transition cursor-pointer ${
                        selected
                          ? 'border-[#0f292e] bg-[#0f292e] text-white shadow-md'
                          : 'border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-black">
                          Room #{bill.roomNumber}
                        </span>
                        <PaymentStatusBadge status={bt.derivedStatus} />
                      </div>

                      <p
                        className={`text-sm font-bold truncate mt-0.5 ${
                          selected ? 'text-stone-100' : 'text-stone-900'
                        }`}
                      >
                        {bill.guestName}
                      </p>

                      <div
                        className={`mt-1.5 flex items-center justify-between text-xs border-t pt-1.5 ${
                          selected
                            ? 'border-white/20 text-stone-200'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        <span>Bill: {bill.invoiceNumber}</span>
                        <span className="font-bold">
                          {isDue ? (
                            <span
                              className={
                                selected ? 'text-amber-300 font-extrabold' : 'text-amber-700 font-extrabold'
                              }
                            >
                              Due: {formatINR(bt.balanceDue)}
                            </span>
                          ) : (
                            <span
                              className={
                                selected ? 'text-emerald-300' : 'text-emerald-700'
                              }
                            >
                              Paid: {formatINR(bt.grandTotal)}
                            </span>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Step 2: Add Malvani Food & Drinks */}
          <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#c27d38]">
                  <UtensilsCrossed className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    Step 2: Add Malvani Food &amp; Tea
                  </h3>
                  <p className="text-xs text-stone-600">
                    Tap &ldquo;+ Add&rdquo; to add to{' '}
                    <strong>Room #{activeBill?.roomNumber ?? ''}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {foodCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFoodCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    foodCategory === cat
                      ? 'bg-[#0f292e] text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food Menu Items (Clean Cards, Big Tap Target) */}
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
              {displayedFood.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3 hover:bg-white hover:border-stone-300 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center">
                        <span className="text-xs font-black text-emerald-800">₹</span>
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
                          title="Click to edit sample rate"
                          aria-label={`Rate for ${item.name}`}
                          className="w-14 rounded border border-stone-300 bg-white px-1.5 py-0.5 text-xs font-bold text-stone-900 text-right ml-0.5"
                        />
                      </div>
                      <span className="text-[11px] text-stone-500">
                        • {item.category}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!activeBill}
                    onClick={() => addMenuItemToBill(item)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#0f292e] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#173a41] active:scale-[0.96] transition cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4 text-amber-300" />
                    + Add
                  </button>
                </div>
              ))}
            </div>

            {/* Optional: Add Other Extra Service / Custom Item */}
            <div className="mt-4 border-t border-stone-200 pt-3">
              <p className="text-xs font-bold text-stone-700 mb-2">
                Add Other Charge (Laundry, Extra Bed, Water, etc.):
              </p>
              <form
                onSubmit={addCustomCharge}
                className="flex flex-col sm:flex-row items-center gap-2"
              >
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Item name (e.g. Extra mattress)"
                  className="w-full sm:flex-1 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-stone-900 focus:border-teal-700 focus:outline-none"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center rounded-xl border border-stone-300 bg-white px-2 py-1">
                    <span className="text-xs font-bold text-stone-600">₹</span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-16 px-1 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-stone-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-stone-900 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* Right Column: Step 3: View Bill, Mark Paid & Print Receipt */}
        <div className="xl:col-span-7">
          {!activeBill || !totals ? (
            <div className="rounded-2xl border-2 border-stone-200 bg-white p-12 text-center text-sm font-medium text-stone-500">
              Please click a guest room on the left side to see their bill.
            </div>
          ) : (
            <section className="rounded-2xl border-2 border-stone-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex flex-col justify-between gap-4 border-b-2 border-stone-200 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
                      Bill No: {activeBill.invoiceNumber}
                    </span>
                    <PaymentStatusBadge status={totals.derivedStatus} />
                  </div>
                  <h3 className="mt-1.5 font-display text-2xl font-bold text-stone-900">
                    Room #{activeBill.roomNumber} — {activeBill.guestName}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    Phone: <strong>{activeBill.guestPhone}</strong> • Date: {formatFullDate(activeBill.billDate)}
                  </p>
                </div>

                {/* Print Bill Button (Big, Prominent, Clear) */}
                <button
                  type="button"
                  onClick={() => setInvoiceBill(activeBill)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c27d38] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b06d2c] active:scale-[0.98] cursor-pointer shrink-0"
                >
                  <Printer className="h-4 w-4" />
                  Print Guest Bill
                </button>
              </div>

              {/* Room Stay Rent Section */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="text-sm font-bold text-stone-900">
                    Room Rent Charges
                  </span>
                  <span className="text-base font-black text-stone-900">
                    Total: {formatINR(totals.roomTotal)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-700">
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
                      className="w-full rounded-xl border-2 border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-900 focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-700">
                      Price per Night (₹)
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
                      className="w-full rounded-xl border-2 border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-900 focus:border-teal-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Food & Service Items on the Bill */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-stone-900">
                    Food &amp; Extra Items Added ({activeBill.items.length})
                  </h4>
                  <span className="text-xs font-semibold text-stone-500">
                    Subtotal: {formatINR(totals.foodTotal + totals.serviceTotal)}
                  </span>
                </div>

                {activeBill.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-300 p-5 text-center text-xs sm:text-sm text-stone-500 bg-stone-50">
                    No food or tea added yet. Tap items in Step 2 on the left.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
                    {activeBill.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-stone-900">
                            {item.description}
                          </span>
                          <span className="ml-2 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase">
                            {item.type}
                          </span>
                        </div>

                        {/* Quantity Increment / Decrement Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50">
                            <button
                              type="button"
                              onClick={() => changeItemQuantity(item.id, -1)}
                              className="px-2 py-1 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition"
                              title="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeItemQuantity(item.id, 1)}
                              className="px-2 py-1 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition"
                              title="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="w-20 text-right font-black text-stone-900">
                            {formatINR(item.quantity * item.unitPrice)}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Remove item"
                            aria-label={`Remove ${item.description}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bill Totals Summary & Payment */}
              <div className="grid grid-cols-1 gap-5 border-t-2 border-stone-200 pt-5 lg:grid-cols-2">
                {/* Left side: Discount & Payment Input */}
                <div className="space-y-4">
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
                      className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2 text-sm font-bold text-stone-900 focus:border-teal-700 focus:outline-none"
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
                        className="w-full rounded-xl border-2 border-stone-300 px-3.5 py-2 text-sm font-bold text-stone-900 focus:border-teal-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpsertBill({
                            ...activeBill,
                            amountPaid: totals.grandTotal,
                          })
                        }
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-950 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        Full Paid
                      </button>
                    </div>
                  </div>

                  {/* One-Click Fully Paid Action Banner */}
                  {totals.balanceDue > 0 ? (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 flex items-center justify-between">
                      <span>Remaining: <strong>{formatINR(totals.balanceDue)}</strong></span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpsertBill({
                            ...activeBill,
                            amountPaid: totals.grandTotal,
                          })
                        }
                        className="font-bold underline text-amber-900 hover:text-amber-950 cursor-pointer"
                      >
                        Take Full Payment Now →
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                      <span>This bill is <strong>fully settled</strong>. All payments received.</span>
                    </div>
                  )}
                </div>

                {/* Right side: Large Totals Receipt Box */}
                <div className="rounded-2xl border-2 border-stone-200 bg-stone-50 p-5 space-y-2.5 text-sm">
                  <div className="flex justify-between text-stone-700">
                    <span>Room Charges</span>
                    <span className="font-semibold">{formatINR(totals.roomTotal)}</span>
                  </div>

                  <div className="flex justify-between text-stone-700">
                    <span>Food &amp; Extra Items</span>
                    <span className="font-semibold">
                      {formatINR(totals.foodTotal + totals.serviceTotal)}
                    </span>
                  </div>

                  {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Discount</span>
                      <span>-{formatINR(totals.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600 text-xs">
                    <span>GST / Taxes ({activeBill.taxPercent}%)</span>
                    <span className="font-semibold">{formatINR(totals.taxAmount)}</span>
                  </div>

                  {/* Grand Total (Big & Bold) */}
                  <div className="flex justify-between border-t-2 border-stone-300 pt-3 text-xl font-black text-stone-900">
                    <span>Total Bill</span>
                    <span className="text-2xl text-[#0f292e]">{formatINR(totals.grandTotal)}</span>
                  </div>

                  <div className="flex justify-between text-stone-700 text-xs">
                    <span>Paid by Guest</span>
                    <span className="font-bold text-emerald-800">{formatINR(activeBill.amountPaid)}</span>
                  </div>

                  {/* Balance Due (Crystal Clear) */}
                  <div
                    className={`flex justify-between border-t border-stone-300 pt-2 text-base font-black ${
                      totals.balanceDue > 0 ? 'text-amber-900' : 'text-emerald-800'
                    }`}
                  >
                    <span>{totals.balanceDue > 0 ? 'Balance to Collect' : 'Balance Due'}</span>
                    <span>{formatINR(totals.balanceDue)}</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Printable Invoice Modal */}
      <InvoiceModal
        bill={invoiceBill}
        settings={settings}
        onClose={() => setInvoiceBill(null)}
      />
    </div>
  );
};
