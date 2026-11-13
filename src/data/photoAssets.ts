import type { PhotoAsset } from '../types/hms';

const baseUrl = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const PHOTO_ASSETS: Record<string, PhotoAsset> = {
  'exterior-main': {
    id: 'exterior-main',
    label: 'Property Exterior & Coconut Grove',
    category: 'exterior',
    url: `${baseUrl}images/verified/photo-1.jpg`,
    verified: true,
    sourceNote: 'Verified public listing photo (Booking.com — Sunshine Homestay, Malvan)',
    caption:
      'Two-story Sunshine Home Stay building in Medha Rajkot, Malvan with coconut palms, ground-floor AC rooms & upper balcony.',
  },
  'room-interior-verified': {
    id: 'room-interior-verified',
    label: 'Double Room Interior (Verified)',
    category: 'room',
    url: `${baseUrl}images/verified/photo-2.jpg`,
    verified: true,
    sourceNote: 'Verified public listing photo (Justdial — Sunshine Homestay, Malvan)',
    caption:
      'Clean wooden double bed room interior with fresh linens, folded blankets, and sliding window.',
  },
  'placeholder-ac-deluxe': {
    id: 'placeholder-ac-deluxe',
    label: 'AC Deluxe Room — Photo Placeholder',
    category: 'room',
    url: null,
    verified: false,
    sourceNote: 'Placeholder — Replace with original owner photograph',
    caption: 'Owner photo slot for AC Deluxe / Family room interior & bathroom.',
  },
  'placeholder-balcony-room': {
    id: 'placeholder-balcony-room',
    label: 'First-Floor Balcony Room — Photo Placeholder',
    category: 'room',
    url: null,
    verified: false,
    sourceNote: 'Placeholder — Replace with original owner photograph',
    caption: 'Owner photo slot for first-floor balcony room & coastal view.',
  },
  'placeholder-non-ac': {
    id: 'placeholder-non-ac',
    label: 'Non-AC Room Interior — Photo Placeholder',
    category: 'room',
    url: null,
    verified: false,
    sourceNote: 'Placeholder — Replace with original owner photograph',
    caption: 'Owner photo slot for Non-AC Standard / Twin room interior.',
  },
  'placeholder-dining': {
    id: 'placeholder-dining',
    label: 'Malvani Dining & Kitchen — Photo Placeholder',
    category: 'dining',
    url: null,
    verified: false,
    sourceNote: 'Placeholder — Replace with original Malvani dining & food photo',
    caption: 'Owner photo slot for outdoor dining area & home-cooked Malvani thali.',
  },
  'placeholder-surroundings': {
    id: 'placeholder-surroundings',
    label: 'Rock Garden & Beach Surroundings — Photo Placeholder',
    category: 'surroundings',
    url: null,
    verified: false,
    sourceNote: 'Placeholder — Replace with original surroundings / parking photo',
    caption: 'Owner photo slot for Rock Garden approach, parking courtyard & sea view.',
  },
};

export const PHOTO_ASSET_LIST: PhotoAsset[] = Object.values(PHOTO_ASSETS);

