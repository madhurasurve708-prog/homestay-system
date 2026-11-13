import type { Bill, PaymentStatus } from '../types/hms';

export interface BillTotals {
  roomTotal: number;
  foodTotal: number;
  serviceTotal: number;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  balanceDue: number;
  derivedStatus: PaymentStatus;
}

export function calculateBillTotals(bill: Bill): BillTotals {
  const roomTotal = Math.max(0, bill.nights * bill.roomRatePerNight);
  const foodTotal = bill.items
    .filter((i) => i.type === 'food')
    .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const serviceTotal = bill.items
    .filter((i) => i.type === 'service')
    .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const subtotal = roomTotal + foodTotal + serviceTotal;
  const discount = Math.min(subtotal, Math.max(0, bill.discountAmount));
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round((taxableAmount * Math.max(0, bill.taxPercent)) / 100);
  const grandTotal = taxableAmount + taxAmount;
  const paid = Math.max(0, bill.amountPaid);
  const balanceDue = Math.max(0, grandTotal - paid);

  let derivedStatus: PaymentStatus = 'Pending';
  if (grandTotal > 0 && paid >= grandTotal) {
    derivedStatus = 'Paid';
  } else if (paid > 0 && paid < grandTotal) {
    derivedStatus = 'Partially Paid';
  }

  return {
    roomTotal,
    foodTotal,
    serviceTotal,
    subtotal,
    discount,
    taxableAmount,
    taxAmount,
    grandTotal,
    balanceDue,
    derivedStatus,
  };
}

