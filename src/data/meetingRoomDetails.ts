import type { MeetingRoomListing } from "./meetingRoomListings";
import { allRoomTypes } from "./meetingRoomListings";

export interface DurationTier {
  key: string;
  label: string;
  price: number;
}

export interface SiblingRoom {
  id: string;
  roomType: string;
  seatingCapacity: string;
  capacity: number;
  pricing: DurationTier[];
}

export interface AddOn {
  key: string;
  label: string;
  price: number;
}

export interface RoomConfiguration {
  layout: string;
  capacity: number;
  suitableFor: string;
}

export interface NearbyPlace {
  category: string;
  name: string;
  distanceKm: number;
}

export interface HostInfo {
  brand: string;
  propertyManager: string;
  responseTimeMinutes: number;
  verified: boolean;
  yearsOperating: number;
  satisfactionScore: number;
}

export interface HouseRules {
  foodPolicy: string;
  outsideCateringPolicy: string;
  visitorPolicy: string;
  timingPolicy: string;
  noisePolicy: string;
  cancellationPolicy: string;
  refundPolicy: string;
  securityRules: string;
}

export interface ReviewItem {
  name: string;
  date: string;
  rating: number;
  comment: string;
  useCase: string;
}

export interface MeetingRoomDetails {
  rating: number;
  reviewCount: number;
  galleryImages: string[];
  badges: string[];
  buildingName: string;
  floor: string;
  durationPricing: DurationTier[];
  siblingRoomTypes: SiblingRoom[];
  whyBookCards: string[];
  roomConfigurations: RoomConfiguration[];
  equipmentTech: string[];
  addOns: AddOn[];
  nearbyPlaces: NearbyPlace[];
  parkingAvailable: boolean;
  host: HostInfo;
  rules: HouseRules;
  ratingBreakdown: { star: number; percent: number }[];
  reviews: ReviewItem[];
  aiReviewSummary: string[];
}

const galleryPhotoIds = [
  "1431540015161-0bf868a2d407",
  "1497366811353-6870744d04b2",
  "1497366754035-f200968a6e72",
  "1556761175-5973dc0f32e7",
  "1521737711867-e3b97375f902",
  "1604328698692-f76ea9498e76",
  "1517502884422-41eaead166d4",
  "1556761175-b413da4baf72",
];

const galleryImages = galleryPhotoIds.map(
  (id) => `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop&q=80&auto=format`,
);

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  }
  return hash + 1;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = n % 100;
  return `${n}${suffixes[(remainder - 20) % 10] ?? suffixes[remainder] ?? suffixes[0]}`;
}

const equipmentTechPool = [
  "Projector",
  "LED Screen",
  "Smart TV",
  "Video Conferencing",
  "Speakers",
  "Microphone",
  "HDMI",
  "Whiteboard",
  "Laser Pointer",
  "Extension Boards",
  "Charging Ports",
  "Dedicated Internet",
];

const layoutPool: { layout: string; suitableFor: string; capacityFactor: number }[] = [
  { layout: "Boardroom Layout", suitableFor: "Executive meetings & client discussions", capacityFactor: 1 },
  { layout: "Classroom Layout", suitableFor: "Training sessions & workshops", capacityFactor: 1.4 },
  { layout: "U Shape Layout", suitableFor: "Group discussions & brainstorming", capacityFactor: 0.8 },
  { layout: "Theatre Layout", suitableFor: "Presentations & town halls", capacityFactor: 2 },
  { layout: "Cabaret Layout", suitableFor: "Workshops & interactive sessions", capacityFactor: 1.2 },
  { layout: "Interview Layout", suitableFor: "One-on-one & panel interviews", capacityFactor: 0.4 },
];

const addOnPool: AddOn[] = [
  { key: "tea-coffee", label: "Tea/Coffee", price: 60 },
  { key: "snacks", label: "Snacks", price: 120 },
  { key: "lunch", label: "Lunch", price: 250 },
  { key: "water-bottles", label: "Water Bottles", price: 20 },
  { key: "reception-support", label: "Reception Support", price: 300 },
  { key: "printing", label: "Printing Support", price: 50 },
  { key: "extra-chairs", label: "Extra Chairs", price: 40 },
  { key: "extra-screen", label: "Extra Screen", price: 200 },
  { key: "event-coordinator", label: "Event Coordinator", price: 800 },
];

const reviewerNames = [
  "Priyanka Ingawale",
  "Tanmaya Pradhan",
  "Arjun Mehta",
  "Sneha Kulkarni",
  "Rohit Sharma",
  "Ayesha Khan",
];

const reviewMonths = ["Jan-2026", "Dec-2025", "Nov-2025", "Oct-2025", "Sep-2025", "Aug-2025"];
const useCases = ["Corporate Teams", "Startups", "Interview Bookings", "Training Sessions", "Client Meetings", "Workshops"];
const reviewComments = [
  "Booking was instant and the room was exactly as shown.",
  "Internet speed was excellent, no issues during our video call.",
  "Easy to reach via metro, saved a lot of commute time.",
  "Staff were very helpful in setting up the projector quickly.",
  "Seating was comfortable even for a 3 hour workshop.",
  "Professional atmosphere, perfect for client meetings.",
];

const propertyManagerNames = ["Karan Mehta", "Sunita Rao", "Imran Sheikh", "Pooja Nair", "Rahul Verma"];

export function getMeetingRoomDetails(listing: MeetingRoomListing): MeetingRoomDetails {
  const seed = hashSeed(listing.id);
  const r1 = seededRandom(seed * 1.7);
  const r2 = seededRandom(seed * 2.9);
  const r3 = seededRandom(seed * 4.1);

  const baseRate = listing.pricing.find((tier) => tier.hours === 1)?.price ?? listing.bestPrice;
  const durationPricing: DurationTier[] = [
    { key: "1", label: "1 Hour", price: Math.round((baseRate * 1) / 10) * 10 },
    { key: "2", label: "2 Hours", price: Math.round((baseRate * 1.8) / 10) * 10 },
    { key: "3", label: "3 Hours", price: Math.round((baseRate * 2.5) / 10) * 10 },
    { key: "4", label: "4 Hours", price: Math.round((baseRate * 3.1) / 10) * 10 },
    { key: "6", label: "6 Hours", price: Math.round((baseRate * 4.2) / 10) * 10 },
    { key: "8", label: "8 Hours", price: Math.round((baseRate * 5.2) / 10) * 10 },
    { key: "full-day", label: "Full Day", price: Math.round((baseRate * 6.5) / 10) * 10 },
  ];

  const otherTypes = allRoomTypes.filter((type) => type !== listing.roomType);
  const siblingTypeNames = [listing.roomType, otherTypes[seed % otherTypes.length], otherTypes[(seed + 1) % otherTypes.length]];
  const siblingRoomTypes: SiblingRoom[] = siblingTypeNames.map((roomType, index) => {
    const capacityFactor = index === 0 ? 1 : 0.7 + seededRandom(seed + index * 3) * 0.6;
    const capacity = index === 0 ? listing.capacity : Math.max(2, Math.round(listing.capacity * capacityFactor));
    return {
      id: `${listing.id}-type-${index}`,
      roomType,
      seatingCapacity: index === 0 ? listing.seatingCapacity : `${capacity} Seater`,
      capacity,
      pricing: durationPricing.map((tier) => ({
        ...tier,
        price: Math.round((tier.price * (capacity / listing.capacity)) / 10) * 10,
      })),
    };
  });

  const badges = [
    "Instant Confirmation",
    ...(listing.premier ? ["Premium"] : []),
    ...(listing.popular ? ["Most Booked", "Corporate Favourite"] : []),
    ...(r1 > 0.4 ? ["Top Rated"] : []),
    ...(r2 > 0.45 ? ["Near Metro"] : []),
    "High Speed WiFi",
  ];

  const equipmentTech = [
    ...listing.equipment.map((item) => (item === "Video Conference" ? "Video Conferencing" : item)),
    ...equipmentTechPool.filter((item) => !listing.equipment.includes(item)).slice(0, 5),
  ].filter((item, index, arr) => arr.indexOf(item) === index);

  const roomConfigurations: RoomConfiguration[] = layoutPool.map((layout) => ({
    layout: layout.layout,
    capacity: Math.max(2, Math.round(listing.capacity * layout.capacityFactor)),
    suitableFor: layout.suitableFor,
  }));

  const reviews: ReviewItem[] = Array.from({ length: 6 }, (_, index) => {
    const ra = seededRandom(seed + index * 11.7);
    const rb = seededRandom(seed + index * 5.3);
    return {
      name: reviewerNames[Math.floor(ra * reviewerNames.length) % reviewerNames.length],
      date: reviewMonths[index % reviewMonths.length],
      rating: rb > 0.75 ? 4 : 5,
      comment: reviewComments[Math.floor(ra * reviewComments.length) % reviewComments.length],
      useCase: useCases[index % useCases.length],
    };
  });

  const rating = Math.round((3.8 + r1 * 1.1) * 10) / 10;
  const reviewCount = Math.round(20 + r2 * 300);

  const fiveStarBase = Math.round(50 + (rating - 3.6) * 25);
  const fiveStar = Math.min(92, Math.max(40, fiveStarBase || 60));
  const remaining = 100 - fiveStar;
  const fourStar = Math.round(remaining * 0.55);
  const threeStar = Math.round(remaining * 0.22);
  const twoStar = Math.round(remaining * 0.13);
  const oneStar = Math.max(0, 100 - fiveStar - fourStar - threeStar - twoStar);

  return {
    rating,
    reviewCount,
    galleryImages: [listing.images[0], ...galleryImages],
    badges,
    buildingName: listing.workspaceName.split(" - ")[1] ?? listing.workspaceName,
    floor: `${ordinal(1 + (seed % 8))} Floor`,
    durationPricing,
    siblingRoomTypes,
    whyBookCards: [
      "High Speed Internet",
      ...listing.equipment.slice(0, 3),
      "Power Backup",
      "Coffee Machine",
      "Reception Support",
      listing.amenities.includes("Parking") ? "Parking" : "Air Conditioning",
      "Printing Support",
    ].filter((item, index, arr) => arr.indexOf(item) === index).slice(0, 8),
    roomConfigurations,
    equipmentTech,
    addOns: addOnPool,
    nearbyPlaces: [
      { category: "Metro Station", name: `${listing.locality} Metro Station`, distanceKm: Math.round((0.4 + r1 * 2.2) * 10) / 10 },
      { category: "Railway Station", name: `${listing.locality} Railway Station`, distanceKm: Math.round((1 + r2 * 5) * 10) / 10 },
      { category: "Airport", name: `${listing.city.charAt(0).toUpperCase()}${listing.city.slice(1)} Airport`, distanceKm: Math.round((4 + r3 * 18) * 10) / 10 },
      { category: "Restaurants", name: `${listing.locality} Dining District`, distanceKm: Math.round((0.2 + r1 * 1.5) * 10) / 10 },
      { category: "Hotels", name: `${listing.locality} Hotel Cluster`, distanceKm: Math.round((0.5 + r2 * 2) * 10) / 10 },
      { category: "Coworking Spaces", name: `${listing.locality} Coworking Hub`, distanceKm: Math.round((0.3 + r3 * 1.8) * 10) / 10 },
    ],
    parkingAvailable: listing.amenities.includes("Parking") || r1 > 0.3,
    host: {
      brand: listing.brand,
      propertyManager: propertyManagerNames[seed % propertyManagerNames.length],
      responseTimeMinutes: 5 + Math.round(r1 * 25),
      verified: true,
      yearsOperating: 2 + (seed % 9),
      satisfactionScore: Math.round((4.2 + r2 * 0.7) * 10) / 10,
    },
    rules: {
      foodPolicy: "Outside food is allowed for booked add-ons only; otherwise order through the venue.",
      outsideCateringPolicy: "Outside catering is allowed with prior notice of at least 4 hours.",
      visitorPolicy: "All visitors must register at reception with a valid photo ID.",
      timingPolicy: "Rooms must be vacated 10 minutes before the next booking begins.",
      noisePolicy: "Please maintain reasonable noise levels out of respect for neighbouring rooms.",
      cancellationPolicy: "Free cancellation up to 2 hours before the booking start time.",
      refundPolicy: "Refunds are processed within 3-5 business days to the original payment method.",
      securityRules: "CCTV monitored premises; valid ID required for entry.",
    },
    ratingBreakdown: [
      { star: 5, percent: fiveStar },
      { star: 4, percent: fourStar },
      { star: 3, percent: threeStar },
      { star: 2, percent: twoStar },
      { star: 1, percent: oneStar },
    ],
    reviews,
    aiReviewSummary: ["Fast booking", "Excellent internet", "Easy metro access", "Helpful staff", "Comfortable seating", "Professional atmosphere"],
  };
}
