export type NavSection =
  | 'dashboard'
  | 'rooms'
  | 'bookings'
  | 'calendar'
  | 'checkin'
  | 'billing'
  | 'reports'
  | 'settings';

export type RoomCategory = 'AC' | 'Non-AC';

export type RoomStatus = 'Available' | 'Booked' | 'Occupied' | 'Maintenance';

export type BookingSource = 'Direct' | 'Walk-in' | 'MakeMyTrip' | 'Goibibo';

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked-in'
  | 'Checked-out'
  | 'Cancelled';

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending';

export interface PhotoAsset {
  id: string;
  label: string;
  category: 'exterior' | 'room' | 'dining' | 'surroundings' | 'amenity';
  /** Verified genuine local image path if available; null means render placeholder */
  url: string | null;
  verified: boolean;
  sourceNote: string;
  caption: string;
}

export interface Room {
  id: string;
  roomNumber: string; // '101' - '115'
  floor: 'Ground Floor' | 'First Floor';
  category: RoomCategory;
  name: string;
  capacity: number;
  status: RoomStatus;
  /** Editable placeholder tariff in INR per night */
  sampleRatePerNight: number;
  amenities: string[];
  /** References PhotoAsset.id or custom uploaded URL */
  photoId: string;
  notes?: string;
}

export interface GuestDetails {
  fullName: string;
  phone: string;
  city?: string;
  idType?: 'Aadhaar' | 'Driving License' | 'Passport' | 'Voter ID';
  idLastFour?: string;
  vehicleNumber?: string;
  specialRequests?: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  roomNumber: string;
  roomCategory: RoomCategory;
  guest: GuestDetails;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  guestsCount: number;
  source: BookingSource;
  status: BookingStatus;
  nightlyRateSnapshot: number;
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

export interface FoodMenuItem {
  id: string;
  name: string;
  category: 'Malvani Meals' | 'Breakfast' | 'Beverages' | 'Snacks';
  /** Editable demo placeholder price in INR */
  samplePrice: number;
}

export interface BillLineItem {
  id: string;
  description: string;
  type: 'food' | 'service';
  quantity: number;
  unitPrice: number;
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  billDate: string; // YYYY-MM-DD
  nights: number;
  roomRatePerNight: number;
  items: BillLineItem[];
  discountAmount: number;
  taxPercent: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface PropertySettings {
  propertyName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
  defaultAcRate: number;
  defaultNonAcRate: number;
  defaultTaxPercent: number;
  checkInTime: string;
  checkOutTime: string;
}

export interface HmsState {
  rooms: Room[];
  bookings: Booking[];
  bills: Bill[];
  foodMenu: FoodMenuItem[];
  settings: PropertySettings;
  customPhotoOverrides: Record<string, string>; // photoId -> dataURL / objectURL
}

