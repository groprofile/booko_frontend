import type { DayPassListing } from "./dayPassListings";

export interface SeatingOptionDetail {
  planId?: string;
  type: string;
  description: string;
  features: string[];
  availability: string;
  price: number;
  bestPrice: number;
  offerCode: string;
  image: string;
}

export interface ReviewItem {
  name: string;
  date: string;
  rating: number;
  comment: string;
  tag: string;
}

export interface RatingBreakdownItem {
  star: number;
  percent: number;
}

export interface DayPassDetails {
  galleryImages: string[];
  description: string;
  rules: string[];
  internetSpeed: string;
  parkingDetails: string;
  foodBeverage: string;
  address: string;
  metroStation: string;
  metroDistanceKm: number;
  railwayStation: string;
  railwayDistanceKm: number;
  landmarks: string[];
  travelTimeMin: number;
  amenities: string[];
  seatingOptions: SeatingOptionDetail[];
  ratingBreakdown: RatingBreakdownItem[];
  reviews: ReviewItem[];
}

const galleryPhotoIds = [
  "1497366811353-6870744d04b2",
  "1556761175-5973dc0f32e7",
  "1524758631624-e2822e304c36",
  "1521737711867-e3b97375f902",
  "1497366754035-f200968a6e72",
  "1604328698692-f76ea9498e76",
  "1556761175-b413da4baf72",
  "1559136555-9303baea8ebd",
  "1497215728101-856f4ea42174",
  "1572025442646-866d16c84a54",
  "1593642634367-d91a135587b5",
  "1431540015161-0bf868a2d407",
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

const seatingCopy: Record<string, { description: string; features: string[] }> = {
  "Open Desk": {
    description: "Pay per use — bring your laptop, pick a spot and get working.",
    features: ["High-speed WiFi", "Power Backup", "Drinking Water", "Shared Pantry"],
  },
  "Premium Desk": {
    description: "An upgraded desk experience with extra space and a quieter zone.",
    features: ["Ergonomic Chair", "Extra Desk Space", "High-speed WiFi", "Power Backup"],
  },
  "Private Cabin": {
    description: "A fully private, lockable cabin for focused, distraction-free work.",
    features: ["Lockable Door", "Whiteboard", "High-speed WiFi", "Power Backup"],
  },
  "Lounge Spot": {
    description: "Relaxed lounge seating, ideal for informal work or quick catch-ups.",
    features: ["Sofa Seating", "Natural Light", "High-speed WiFi", "Power Backup"],
  },
};

const ruleSets = [
  "Carry a valid photo ID for entry at the front desk",
  "Maintain workspace etiquette and reasonable noise levels",
  "Outside food is not permitted in meeting rooms",
  "Smoking is not allowed anywhere inside the premises",
  "Day pass timings are non-transferable across locations",
];

const metroPool = ["Metro Station", "Local Train Station", "Rapid Transit Stop"];
const railwayPool = ["Railway Station", "Suburban Station", "Junction Station"];
const landmarkPool = [
  "Business Park Junction",
  "Tech Hub Circle",
  "City Centre Mall",
  "Central Square Towers",
  "Riverside Commercial Complex",
  "Metro Plaza",
];

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

const reviewComments = [
  "Great location, easily accessible, and the staff were very hospitable.",
  "Clean workspace with excellent amenities and a productive atmosphere.",
  "Loved the ambience — perfect for a full day of focused work.",
  "Smooth check-in process and the seating was comfortable throughout the day.",
  "Good value for the price, would book again for client meetings.",
  "WiFi was fast and reliable, exactly what I needed for back-to-back calls.",
];

const reviewMonths = [
  "Jan-2026",
  "Dec-2025",
  "Nov-2025",
  "Oct-2025",
  "Sep-2025",
  "Aug-2025",
];

function buildSeatingOptions(listing: DayPassListing, seed: number): SeatingOptionDetail[] {
  return listing.seatingTypes.map((type, index) => {
    const r = seededRandom(seed + index * 7.3);
    const variance = Math.round((r - 0.5) * 140);
    const price = Math.max(199, listing.price + variance);
    const discount = 20 + Math.round(seededRandom(seed + index * 3.1) * 30);
    const bestPrice = Math.round((price * (100 - discount)) / 100);
    const copy = seatingCopy[type] ?? {
      description: "A comfortable, well-equipped seating option for productive work.",
      features: ["High-speed WiFi", "Power Backup"],
    };
    return {
      type,
      description: copy.description,
      features: copy.features,
      availability: r > 0.2 ? "Available today" : "Limited availability",
      price,
      bestPrice,
      offerCode: `BOKKO${discount}`,
      image: listing.images[index % listing.images.length],
    };
  });
}

function buildRatingBreakdown(rating: number, seed: number): RatingBreakdownItem[] {
  const fiveStarBase = Math.round(55 + (rating - 4) * 80);
  const fiveStar = Math.min(94, Math.max(50, fiveStarBase));
  const remaining = 100 - fiveStar;
  const fourStar = Math.round(remaining * 0.6);
  const threeStar = Math.round(remaining * 0.2);
  const twoStar = Math.round(remaining * 0.12);
  const oneStar = Math.max(0, 100 - fiveStar - fourStar - threeStar - twoStar);
  void seed;
  return [
    { star: 5, percent: fiveStar },
    { star: 4, percent: fourStar },
    { star: 3, percent: threeStar },
    { star: 2, percent: twoStar },
    { star: 1, percent: oneStar },
  ];
}

function buildReviews(listing: DayPassListing, seed: number): ReviewItem[] {
  const count = 4;
  return Array.from({ length: count }, (_, index) => {
    const r1 = seededRandom(seed + index * 11.7);
    const r2 = seededRandom(seed + index * 5.3);
    const tagOptions = listing.seatingTypes.length ? listing.seatingTypes : ["Day Pass"];
    return {
      name: reviewerNames[Math.floor(r1 * reviewerNames.length) % reviewerNames.length],
      date: reviewMonths[index % reviewMonths.length],
      rating: r2 > 0.75 ? 4 : 5,
      comment: reviewComments[Math.floor(r1 * reviewComments.length) % reviewComments.length],
      tag: tagOptions[index % tagOptions.length],
    };
  });
}

export function getDayPassDetails(listing: DayPassListing): DayPassDetails {
  const seed = hashSeed(listing.id);
  const r1 = seededRandom(seed * 1.7);
  const r2 = seededRandom(seed * 2.9);
  const r3 = seededRandom(seed * 4.1);

  const gallery = Array.from({ length: 9 }, (_, index) => galleryImages[(seed + index) % galleryImages.length]);

  const adjective = listing.premier ? "premium" : "vibrant";

  return {
    galleryImages: [listing.images[0], ...gallery.slice(0, 8)],
    description: `${listing.name.replace("Desk | ", "")}, located in the ${adjective} ${listing.locality} area of ${listing.city
      .charAt(0)
      .toUpperCase()}${listing.city.slice(1)}, offers a dependable ${listing.spaceType.toLowerCase()} experience tailored for modern professionals. The workspace features ${listing.seatingTypes
      .join(", ")
      .toLowerCase()} options designed for comfort and productivity, with high-speed connectivity and a professional environment suited to freelancers, startups, and remote teams alike.`,
    rules: ruleSets.slice(0, 4),
    internetSpeed: `${100 + Math.round(r1 * 100)} Mbps Dedicated Line`,
    parkingDetails: listing.accessibility.includes("Parking (Free/Paid)")
      ? "2-wheeler and 4-wheeler paid parking available on-site"
      : "Limited on-site parking; nearby paid parking available",
    foodBeverage: "Complimentary tea & coffee, with a paid cafe/snack bar available on-site",
    address: `${listing.name.split(" - ")[1] ?? listing.brand}, ${listing.locality}, ${listing.city
      .charAt(0)
      .toUpperCase()}${listing.city.slice(1)}`,
    metroStation: `${listing.locality} ${metroPool[seed % metroPool.length]}`,
    metroDistanceKm: Math.round((0.5 + r2 * 2.5) * 10) / 10,
    railwayStation: `${listing.locality} ${railwayPool[seed % railwayPool.length]}`,
    railwayDistanceKm: Math.round((1 + r3 * 4) * 10) / 10,
    landmarks: [
      landmarkPool[seed % landmarkPool.length],
      landmarkPool[(seed + 1) % landmarkPool.length],
      landmarkPool[(seed + 2) % landmarkPool.length],
    ],
    travelTimeMin: 10 + Math.round(r1 * 25),
    amenities: [
      "High Speed WiFi",
      "Power Backup",
      "Meeting Rooms",
      "Parking",
      "Air Conditioning",
      "Printing",
      "Reception",
      "Cafe",
    ],
    seatingOptions: buildSeatingOptions(listing, seed),
    ratingBreakdown: buildRatingBreakdown(listing.rating, seed),
    reviews: buildReviews(listing, seed),
  };
}
