import type { HotelListing } from "./hotelListings";

export interface StayOption {
  key: string;
  label: string;
  price: number;
  available: boolean;
  isWorkcation?: boolean;
}

export interface MealOption {
  key: string;
  label: string;
  priceDelta: number;
}

export interface RoomOption {
  id: string;
  name: string;
  images: string[];
  sizeSqft: number;
  occupancy: number;
  bedType: string;
  amenities: string[];
  description: string;
  pricing: StayOption[];
  breakfastIncluded: boolean;
  cancellationPolicy: string;
}

export interface NearbyPlace {
  category: string;
  name: string;
  distanceKm: number;
}

export interface AmenityCategory {
  category: string;
  items: string[];
}

export interface PropertyRules {
  checkIn: string;
  checkOut: string;
  couplePolicy: string;
  localIdPolicy: string;
  childPolicy: string;
  smokingPolicy: string;
  petPolicy: string;
  cancellationPolicy: string;
  refundPolicy: string;
}

export interface ReviewItem {
  name: string;
  date: string;
  rating: number;
  comment: string;
  travelerType: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountPercent: number;
}

export interface HotelDetails {
  galleryImages: string[];
  propertyType: string;
  distanceAirportKm: number;
  distanceMetroKm: number;
  distanceRailwayKm: number;
  description: string;
  aboutLocation: string;
  whyStayHere: string;
  aiHighlights: string[];
  whyBookCards: string[];
  rooms: RoomOption[];
  mealOptions: MealOption[];
  amenityCategories: AmenityCategory[];
  nearbyPlaces: NearbyPlace[];
  rules: PropertyRules;
  ratingBreakdown: { star: number; percent: number }[];
  reviews: ReviewItem[];
  aiReviewSummary: string[];
  coupons: Coupon[];
}

const galleryPhotoIds = [
  "1566073771259-6a8506099945",
  "1551882547-ff40c63fe5fa",
  "1542314831-068cd1dbfeeb",
  "1520250497591-112f2f40a3f4",
  "1582719478250-c89cae4dc85b",
  "1564501049412-61c2a3083791",
  "1611892440504-42a792e24d32",
  "1590490360182-c33d57733427",
];

const galleryImages = galleryPhotoIds.map(
  (id) => `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop&q=80&auto=format`,
);

const roomImages = [
  "1566073771259-6a8506099945",
  "1551882547-ff40c63fe5fa",
  "1582719478250-c89cae4dc85b",
  "1564501049412-61c2a3083791",
].map((id) => `https://images.unsplash.com/photo-${id}?w=700&h=460&fit=crop&q=80&auto=format`);

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

const amenityPool: AmenityCategory[] = [
  { category: "General", items: ["Free Wifi", "24x7 Reception", "Daily Housekeeping", "Power Backup"] },
  { category: "Business", items: ["Meeting Rooms", "Business Center", "Printing & Fax", "Workspace Desk"] },
  { category: "Food", items: ["Restaurant", "Room Service", "Breakfast Buffet", "Cafe"] },
  { category: "Wellness", items: ["Swimming Pool", "Gym", "Spa", "Sauna"] },
  { category: "Entertainment", items: ["Flat-screen TV", "Streaming Apps", "Indoor Games"] },
  { category: "Accessibility", items: ["Wheelchair Access", "Elevator", "Accessible Bathroom"] },
  { category: "Transportation", items: ["Airport Transfer", "Parking", "Car Rental Desk"] },
];

const roomTemplates = [
  { name: "Standard Room", sizeSqft: 180, occupancy: 2, bedType: "Queen Bed", multiplier: 1, breakfast: false },
  { name: "Deluxe Room", sizeSqft: 240, occupancy: 2, bedType: "King Bed", multiplier: 1.25, breakfast: true },
  { name: "Executive Room", sizeSqft: 300, occupancy: 3, bedType: "King Bed + Sofa", multiplier: 1.55, breakfast: true },
  { name: "Premium Suite", sizeSqft: 420, occupancy: 4, bedType: "King Bed + Twin", multiplier: 2, breakfast: true },
];

const roomAmenityPool = ["Free Wifi", "AC", "Flat-screen TV", "Mini Fridge", "Work Desk", "Rain Shower"];

const reviewerNames = [
  "Priyanka Ingawale",
  "Tanmaya Pradhan",
  "Arjun Mehta",
  "Sneha Kulkarni",
  "Rohit Sharma",
  "Ayesha Khan",
  "Vikram Nair",
  "Divya Reddy",
];

const reviewMonths = ["Jan-2026", "Dec-2025", "Nov-2025", "Oct-2025", "Sep-2025", "Aug-2025"];

const travelerTypes = ["Family", "Couples", "Business", "Solo", "Friends"];

const reviewComments = [
  "Clean and cozy rooms with modern amenities.",
  "Friendly and helpful staff ensuring excellent service throughout the stay.",
  "Conveniently located close to everything we needed.",
  "Delicious breakfast buffet with a variety of options.",
  "Smooth check-in process and comfortable beds.",
  "Great value for the price, would book again.",
];

const aiHighlightPool = [
  "Frequently praised for fast, hassle-free check-in",
  "Popular with business travellers for its central location",
  "Known for spacious, well-maintained rooms",
  "Highly rated breakfast spread",
  "Quiet rooms despite the central location",
];

export function getHotelDetails(listing: HotelListing): HotelDetails {
  const seed = hashSeed(listing.id);
  const r1 = seededRandom(seed * 1.7);
  const r2 = seededRandom(seed * 2.9);
  const r3 = seededRandom(seed * 4.1);

  const fullDayTier = listing.pricing.find((tier) => tier.key === "full-day");
  const workcationPrice = fullDayTier ? Math.round((fullDayTier.price * 1.5) / 10) * 10 : 0;

  const stayOptions: StayOption[] = [
    ...listing.pricing.map((tier) => ({ key: tier.key, label: tier.label, price: tier.price, available: tier.available })),
    {
      key: "workcation",
      label: "Workcation",
      price: workcationPrice,
      available: Boolean(fullDayTier?.available),
      isWorkcation: true,
    },
  ];

  const rooms: RoomOption[] = roomTemplates.map((template, index) => {
    const pricing: StayOption[] = stayOptions.map((tier) => ({
      ...tier,
      price: Math.round((tier.price * template.multiplier) / 10) * 10,
    }));
    return {
      id: `${listing.id}-room-${index}`,
      name: template.name,
      images: [roomImages[index % roomImages.length], roomImages[(index + 1) % roomImages.length]],
      sizeSqft: template.sizeSqft,
      occupancy: template.occupancy,
      bedType: template.bedType,
      amenities: roomAmenityPool.slice(0, 4 + (index % 3)),
      description: `A ${template.name.toLowerCase()} offering ${template.sizeSqft} sq.ft of comfortable space, ideal for ${
        template.occupancy
      } guests with a ${template.bedType.toLowerCase()}.`,
      pricing,
      breakfastIncluded: template.breakfast,
      cancellationPolicy: index === 0 ? "Non-refundable" : "Free cancellation up to 24 hours before check-in",
    };
  });

  const mealOptions: MealOption[] = [
    { key: "room-only", label: "Room Only", priceDelta: 0 },
    { key: "breakfast", label: "Breakfast Included", priceDelta: 350 },
    { key: "breakfast-dinner", label: "Breakfast + Dinner", priceDelta: 650 },
    { key: "all-meals", label: "Breakfast + Lunch + Dinner", priceDelta: 950 },
  ];

  const reviews: ReviewItem[] = Array.from({ length: 6 }, (_, index) => {
    const ra = seededRandom(seed + index * 11.7);
    const rb = seededRandom(seed + index * 5.3);
    return {
      name: reviewerNames[Math.floor(ra * reviewerNames.length) % reviewerNames.length],
      date: reviewMonths[index % reviewMonths.length],
      rating: rb > 0.75 ? 4 : 5,
      comment: reviewComments[Math.floor(ra * reviewComments.length) % reviewComments.length],
      travelerType: travelerTypes[index % travelerTypes.length],
    };
  });

  const fiveStarBase = Math.round(50 + (listing.rating - 3.6) * 25);
  const fiveStar = Math.min(92, Math.max(40, fiveStarBase));
  const remaining = 100 - fiveStar;
  const fourStar = Math.round(remaining * 0.55);
  const threeStar = Math.round(remaining * 0.22);
  const twoStar = Math.round(remaining * 0.13);
  const oneStar = Math.max(0, 100 - fiveStar - fourStar - threeStar - twoStar);

  return {
    galleryImages: [listing.images[0], ...galleryImages.slice(0, 8)],
    propertyType: `${listing.category} ${listing.stayTypes.includes("Business Hotel") ? "Business Hotel" : "Hotel"}`,
    distanceAirportKm: Math.round((3 + r1 * 20) * 10) / 10,
    distanceMetroKm: Math.round((0.4 + r2 * 2.5) * 10) / 10,
    distanceRailwayKm: Math.round((1 + r3 * 5) * 10) / 10,
    description: `${listing.name} is a ${listing.category.toLowerCase()} property located in ${
      listing.locality
    }, offering ${listing.stayTypes.join(", ").toLowerCase()} options tailored for modern travellers. With ${
      listing.amenities.length
    }+ amenities and a ${listing.rating.toFixed(1)} rating from ${listing.reviews} guests, it's designed for comfort, convenience and reliability.`,
    aboutLocation: `Located in ${listing.locality}, this property is well connected to business districts, transit hubs and local attractions, making it a convenient base for both work and leisure stays.`,
    whyStayHere: `Guests choose ${listing.chain} for its consistent service quality, flexible stay durations and central location in ${listing.locality}.`,
    aiHighlights: aiHighlightPool.slice(0, 3 + (seed % 2)),
    whyBookCards: [
      "Free Wifi",
      "Prime Location",
      listing.amenities.includes("Breakfast") ? "Breakfast Available" : "Room Service",
      listing.stayTypes.includes("Business Hotel") ? "Business Friendly" : "Couple Friendly",
      listing.amenities.includes("Meeting Room") ? "Meeting Rooms" : "24x7 Reception",
      "Airport Transfer",
      listing.amenities.includes("Swimming Pool") ? "Swimming Pool" : "Parking",
      listing.amenities.includes("Gym") ? "Gym" : "Restaurant",
    ],
    rooms,
    mealOptions,
    amenityCategories: amenityPool,
    nearbyPlaces: [
      { category: "Airport", name: `${listing.city.charAt(0).toUpperCase()}${listing.city.slice(1)} International Airport`, distanceKm: Math.round((3 + r1 * 20) * 10) / 10 },
      { category: "Metro", name: `${listing.locality} Metro Station`, distanceKm: Math.round((0.4 + r2 * 2.5) * 10) / 10 },
      { category: "Railway Station", name: `${listing.locality} Railway Station`, distanceKm: Math.round((1 + r3 * 5) * 10) / 10 },
      { category: "Mall", name: `${listing.locality} City Mall`, distanceKm: Math.round((0.5 + r1 * 3) * 10) / 10 },
      { category: "Hospital", name: `${listing.locality} Multispeciality Hospital`, distanceKm: Math.round((0.8 + r2 * 4) * 10) / 10 },
      { category: "Business District", name: `${listing.locality} Business District`, distanceKm: Math.round((0.6 + r3 * 3) * 10) / 10 },
      { category: "Tourist Attraction", name: `${listing.locality} Landmark`, distanceKm: Math.round((1 + r1 * 6) * 10) / 10 },
    ],
    rules: {
      checkIn: "2:00 PM",
      checkOut: "12:00 PM (Noon)",
      couplePolicy: "Unmarried couples allowed. Local IDs are accepted.",
      localIdPolicy: "Aadhaar, Passport, Driving Licence and Voter ID accepted as valid ID proof.",
      childPolicy: "Children of all ages are welcome. Extra bedding available on request.",
      smokingPolicy: "Smoking is not permitted inside the property premises.",
      petPolicy: "Pets are not allowed.",
      cancellationPolicy: "Free cancellation up to 24 hours before check-in on most room types.",
      refundPolicy: "Refunds are processed within 5-7 business days to the original payment method.",
    },
    ratingBreakdown: [
      { star: 5, percent: fiveStar },
      { star: 4, percent: fourStar },
      { star: 3, percent: threeStar },
      { star: 2, percent: twoStar },
      { star: 1, percent: oneStar },
    ],
    reviews,
    aiReviewSummary: ["Clean rooms", "Fast check-in", "Excellent staff", "Prime location", "Good breakfast"],
    coupons: [],
  };
}
