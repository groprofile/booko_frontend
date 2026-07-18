import { CITY_NAMES, cityToLocalities } from "./dayPassListings";

export { CITY_NAMES, cityToLocalities };

export type MeetingSortOption =
  | "popularity"
  | "distance"
  | "price-asc"
  | "price-desc"
  | "capacity-asc"
  | "capacity-desc";

export interface HourlyPrice {
  hours: number;
  label: string;
  price: number;
}

export interface MeetingRoomFilters {
  roomTypes: string[];
  seatingCapacity: string[];
  equipment: string[];
  brands: string[];
  amenities: string[];
  bookingOptions: string[];
  priceMin: number;
  priceMax: number;
  sort: MeetingSortOption;
  q: string;
}

export interface MeetingRoomListing {
  id: string;
  city: string;
  brand: string;
  workspaceName: string;
  name: string;
  roomType: string;
  seatingCapacity: string;
  capacity: number;
  locality: string;
  distanceKm: number;
  equipment: string[];
  roomTags: string[];
  amenities: string[];
  bookingOptions: string[];
  pricing: HourlyPrice[];
  bestPrice: number;
  offerCode: string;
  offerCount: number;
  popular: boolean;
  premier: boolean;
  // Admin-promoted center — pins to the top of default-sorted results and
  // shows the "Bokko Recommended" badge. Optional: mock data omits it.
  isFeatured?: boolean;
  images: string[];
}

const images = [
  "1431540015161-0bf868a2d407",
  "1497366811353-6870744d04b2",
  "1497366754035-f200968a6e72",
  "1556761175-5973dc0f32e7",
  "1521737711867-e3b97375f902",
  "1604328698692-f76ea9498e76",
  "1517502884422-41eaead166d4",
  "1556761175-b413da4baf72",
].map((id) => `https://images.unsplash.com/photo-${id}?w=560&h=380&fit=crop&q=80&auto=format`);

export const allRoomTypes = [
  "Discussion Room",
  "Conference Room",
  "Training Room",
  "Board Room",
  "Interview Room",
  "Presentation Room",
];

export const allSeatingCapacities = ["4 Seater", "6 Seater", "8 Seater", "Board Room"];

export const allEquipment = [
  "Monitor/TV",
  "Projector",
  "Speakers",
  "Video Conference",
  "Whiteboard",
  "Microphone",
  "HDMI Support",
  "LED Screen",
];

export const allRoomTags = [
  "Interviews",
  "Brainstorming",
  "Board Meeting/Presentation",
  "Training",
  "Client Meeting",
];

export const allAmenities = [
  "High Speed WiFi",
  "Tea/Coffee",
  "Power Backup",
  "Parking",
  "Reception",
  "Printing",
  "Air Conditioning",
  "Waiting Area",
];

export const allBookingOptions = [
  "Instant Confirmation",
  "Free Cancellation",
  "Pay at Venue",
  "Corporate Billing",
];

export const allBrands = ["WeWork", "Awfis", "COWRKS", "CorporatEdge", "Smartworks", "IndiQube"];

interface RoomTemplate {
  brand: string;
  workspaceSuffix: string;
  roomType: string;
  seatingCapacity: string;
  capacity: number;
  equipment: string[];
  roomTags: string[];
  amenities: string[];
  bookingOptions: string[];
  baseHourlyRate: number;
  popular: boolean;
  premier: boolean;
}

const templates: RoomTemplate[] = [
  {
    brand: "WeWork",
    workspaceSuffix: "Zenia",
    roomType: "Discussion Room",
    seatingCapacity: "4 Seater",
    capacity: 4,
    equipment: ["Whiteboard", "Monitor/TV", "Video Conference"],
    roomTags: ["Interviews", "Brainstorming"],
    amenities: ["High Speed WiFi", "Tea/Coffee", "Power Backup"],
    bookingOptions: ["Instant Confirmation", "Pay at Venue"],
    baseHourlyRate: 500,
    popular: true,
    premier: true,
  },
  {
    brand: "Awfis",
    workspaceSuffix: "BKC",
    roomType: "Conference Room",
    seatingCapacity: "6 Seater",
    capacity: 6,
    equipment: ["Projector", "Monitor/TV", "Speakers", "HDMI Support"],
    roomTags: ["Board Meeting/Presentation", "Client Meeting"],
    amenities: ["High Speed WiFi", "Air Conditioning", "Reception"],
    bookingOptions: ["Instant Confirmation", "Free Cancellation"],
    baseHourlyRate: 650,
    popular: true,
    premier: false,
  },
  {
    brand: "COWRKS",
    workspaceSuffix: "Winchester",
    roomType: "Board Room",
    seatingCapacity: "Board Room",
    capacity: 14,
    equipment: ["LED Screen", "Video Conference", "Microphone", "Speakers"],
    roomTags: ["Board Meeting/Presentation", "Client Meeting"],
    amenities: ["High Speed WiFi", "Tea/Coffee", "Waiting Area", "Reception"],
    bookingOptions: ["Instant Confirmation", "Corporate Billing"],
    baseHourlyRate: 1400,
    popular: true,
    premier: true,
  },
  {
    brand: "CorporatEdge",
    workspaceSuffix: "One International Center",
    roomType: "Interview Room",
    seatingCapacity: "4 Seater",
    capacity: 4,
    equipment: ["Monitor/TV", "Whiteboard"],
    roomTags: ["Interviews"],
    amenities: ["High Speed WiFi", "Power Backup", "Parking"],
    bookingOptions: ["Instant Confirmation", "Pay at Venue"],
    baseHourlyRate: 550,
    popular: false,
    premier: false,
  },
  {
    brand: "Smartworks",
    workspaceSuffix: "Tech Park",
    roomType: "Training Room",
    seatingCapacity: "8 Seater",
    capacity: 8,
    equipment: ["Projector", "Speakers", "Whiteboard", "Monitor/TV"],
    roomTags: ["Training", "Brainstorming"],
    amenities: ["High Speed WiFi", "Tea/Coffee", "Printing", "Air Conditioning"],
    bookingOptions: ["Instant Confirmation", "Corporate Billing"],
    baseHourlyRate: 900,
    popular: false,
    premier: false,
  },
  {
    brand: "IndiQube",
    workspaceSuffix: "Orion",
    roomType: "Presentation Room",
    seatingCapacity: "6 Seater",
    capacity: 6,
    equipment: ["LED Screen", "HDMI Support", "Monitor/TV"],
    roomTags: ["Board Meeting/Presentation", "Client Meeting"],
    amenities: ["High Speed WiFi", "Reception", "Air Conditioning"],
    bookingOptions: ["Instant Confirmation", "Free Cancellation"],
    baseHourlyRate: 750,
    popular: true,
    premier: false,
  },
  {
    brand: "WeWork",
    workspaceSuffix: "Nesco IT Park",
    roomType: "Board Room",
    seatingCapacity: "Board Room",
    capacity: 12,
    equipment: ["Video Conference", "LED Screen", "Microphone", "Speakers"],
    roomTags: ["Board Meeting/Presentation", "Training"],
    amenities: ["High Speed WiFi", "Tea/Coffee", "Waiting Area"],
    bookingOptions: ["Instant Confirmation", "Corporate Billing"],
    baseHourlyRate: 1200,
    popular: true,
    premier: true,
  },
  {
    brand: "Awfis",
    workspaceSuffix: "Supreme Business Park",
    roomType: "Discussion Room",
    seatingCapacity: "8 Seater",
    capacity: 8,
    equipment: ["Whiteboard", "Monitor/TV"],
    roomTags: ["Brainstorming", "Client Meeting"],
    amenities: ["High Speed WiFi", "Power Backup"],
    bookingOptions: ["Instant Confirmation", "Pay at Venue"],
    baseHourlyRate: 700,
    popular: false,
    premier: false,
  },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildPricing(baseRate: number): { pricing: HourlyPrice[]; bestPrice: number } {
  const tiers = [
    { hours: 1, label: "1 Hour", multiplier: 1 },
    { hours: 2, label: "2 Hours", multiplier: 1.9 },
    { hours: 3, label: "3 Hours", multiplier: 2.7 },
    { hours: 6, label: "6 Hours", multiplier: 5 },
  ];
  const pricing = tiers.map((tier) => ({
    hours: tier.hours,
    label: tier.label,
    price: Math.round((baseRate * tier.multiplier) / 10) * 10,
  }));
  return { pricing, bestPrice: pricing[0].price };
}

function buildListings(): MeetingRoomListing[] {
  const listings: MeetingRoomListing[] = [];
  let seed = 1;

  Object.keys(CITY_NAMES).forEach((city) => {
    const localities = cityToLocalities[city];
    templates.forEach((template, index) => {
      seed += 1;
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed * 2.13);
      const r3 = seededRandom(seed * 3.7);

      const locality = localities[index % localities.length];
      const distanceKm = Math.round((2 + r1 * 20) * 100) / 100;
      const rateVariance = Math.round(r2 * 100);
      const { pricing, bestPrice } = buildPricing(template.baseHourlyRate + rateVariance);
      const discountPercent = 20 + Math.round(r3 * 30);
      const discountedBest = Math.round((bestPrice * (100 - discountPercent)) / 100);

      listings.push({
        id: `${city}-${template.brand.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        city,
        brand: template.brand,
        workspaceName: `${template.brand} - ${template.workspaceSuffix}`,
        name: `${template.seatingCapacity} ${template.roomType}`,
        roomType: template.roomType,
        seatingCapacity: template.seatingCapacity,
        capacity: template.capacity,
        locality,
        distanceKm,
        equipment: template.equipment,
        roomTags: template.roomTags,
        amenities: template.amenities,
        bookingOptions: template.bookingOptions,
        pricing,
        bestPrice: discountedBest,
        offerCode: `BOKKO${discountPercent}`,
        offerCount: 1 + Math.round(r1 * 3),
        popular: template.popular,
        premier: template.premier,
        images: [
          images[(index * 2) % images.length],
          images[(index * 2 + 1) % images.length],
          images[(index * 2 + 2) % images.length],
        ],
      });
    });
  });

  return listings;
}

export const meetingRoomListings: MeetingRoomListing[] = buildListings();
