import type { MonthlyPassListing } from "./monthlyPassListings";

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  }
  return hash || 1;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface BillingTier {
  key: "monthly" | "quarterly" | "yearly";
  label: string;
  multiplier: number;
}

export const billingTiers: BillingTier[] = [
  { key: "monthly", label: "Monthly", multiplier: 1 },
  { key: "quarterly", label: "Quarterly", multiplier: 2.7 },
  { key: "yearly", label: "Yearly", multiplier: 10 },
];

export interface MembershipType {
  key: string;
  name: string;
  price: number;
  accessHours: string;
  meetingRoomCredits: string;
  guestsAllowed: string;
  storage: string;
  communityAccess: string;
}

export interface SeatingOption {
  key: string;
  name: string;
  image: string;
  capacity: string;
  benefits: string[];
  available: boolean;
}

export interface NearbyPlace {
  category: "Cafe" | "Restaurant" | "Hotel" | "Business Hub";
  name: string;
  distanceKm: number;
}

export interface SeatTier {
  seats: number | "Enterprise";
  label: string;
  estimatedMonthly: number | null;
}

export interface ReviewItem {
  id: string;
  authorInitial: string;
  authorType: string;
  rating: number;
  date: string;
  comment: string;
}

export interface RatingBucket {
  stars: number;
  percent: number;
}

export interface AiLovedTag {
  tag: string;
  mentions: number;
}

export interface MatchScoreItem {
  label: string;
  achieved: boolean;
}

export interface MonthlyPassDetails {
  galleryImages: string[];
  badges: string[];
  metroDistanceKm: number;
  railwayDistanceKm: number;
  airportDistanceKm: number;
  membershipTypes: MembershipType[];
  whyChooseFeatures: string[];
  seatingOptions: SeatingOption[];
  amenities: string[];
  nearbyPlaces: NearbyPlace[];
  whoIsThisFor: string[];
  seatTiers: SeatTier[];
  communityBenefits: string[];
  ratingBreakdown: RatingBucket[];
  aiLovedTags: AiLovedTag[];
  reviews: ReviewItem[];
  matchScoreItems: MatchScoreItem[];
  matchScore: number;
  aiRecommendedFor: { persona: string; reason: string }[];
}

const seatingImageIds = [
  "1497366811353-6870744d04b2",
  "1524758631624-e2822e304c36",
  "1604328698692-f76ea9498e76",
  "1556761175-b413da4baf72",
  "1559136555-9303baea8ebd",
  "1572025442646-866d16c84a54",
];

const cafeNames = ["Third Wave Coffee", "Blue Tokai Coffee Roasters", "Cafe Mocha", "Starbucks Reserve", "The Coffee Bean"];
const restaurantNames = ["Social", "Farzi Cafe", "The Bombay Canteen", "Smoke House Deli", "Cafe Arpora"];
const hotelNames = ["Lemon Tree Premier", "Ginger Hotel", "ITC Hotel", "Fairfield by Marriott", "Holiday Inn Express"];
const businessHubNames = ["One BKC", "World Trade Center", "Cyber Hub", "DLF Cyber City", "RMZ Ecoworld"];

export function getMonthlyPassDetails(listing: MonthlyPassListing): MonthlyPassDetails {
  const seed = hashSeed(listing.id);
  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed * 2.13);
  const r3 = seededRandom(seed * 3.7);
  const r4 = seededRandom(seed * 5.21);

  const galleryImages = [
    listing.images[0],
    listing.images[1] ?? listing.images[0],
    listing.images[2] ?? listing.images[0],
    listing.images[0],
    listing.images[1] ?? listing.images[0],
  ];

  const badges: string[] = [];
  if (listing.premier) badges.push("Premium");
  if (listing.popular) badges.push("Most Booked");
  badges.push("Verified Workspace");
  if (listing.rating >= 4.5) badges.push("Top Startup Choice");

  const dedicatedDeskPrice = listing.price;
  const openDeskPrice = Math.round(dedicatedDeskPrice * 0.7);
  const privateCabinPrice = Math.round(dedicatedDeskPrice * 1.8);
  const teamOfficePrice = Math.round(dedicatedDeskPrice * 3.4);

  const membershipTypes: MembershipType[] = [
    {
      key: "open-desk",
      name: "Open Desk",
      price: openDeskPrice,
      accessHours: "9 AM - 9 PM",
      meetingRoomCredits: "2 hrs/month",
      guestsAllowed: "1 Guest/day",
      storage: "Shared Locker",
      communityAccess: "Basic Access",
    },
    {
      key: "dedicated-desk",
      name: "Dedicated Desk",
      price: dedicatedDeskPrice,
      accessHours: "24/7 Access",
      meetingRoomCredits: "4 hrs/month",
      guestsAllowed: "2 Guests/day",
      storage: "Personal Locker",
      communityAccess: "Full Access",
    },
    {
      key: "private-cabin",
      name: "Private Cabin",
      price: privateCabinPrice,
      accessHours: "24/7 Access",
      meetingRoomCredits: "8 hrs/month",
      guestsAllowed: "4 Guests/day",
      storage: "Lockable Cabinet",
      communityAccess: "Full Access",
    },
    {
      key: "team-office",
      name: "Team Office",
      price: teamOfficePrice,
      accessHours: "24/7 Access",
      meetingRoomCredits: "16 hrs/month",
      guestsAllowed: "8 Guests/day",
      storage: "Private Storage Unit",
      communityAccess: "Full Access + Priority",
    },
  ];

  const whyChooseFeatures = [
    "High Speed WiFi",
    "Power Backup",
    "Meeting Rooms",
    "Reception",
    "Printing",
    "Community Events",
    "Networking",
    "Tea/Coffee",
    ...(listing.accessibility.includes("Parking (Free/Paid)") ? ["Parking"] : []),
    "Phone Booths",
    "Lounge Area",
    "24/7 Security",
  ];

  const seatingTemplates: Array<{ key: string; name: string; capacity: string; benefits: string[] }> = [
    { key: "open-desk", name: "Open Desk", capacity: "1 Person", benefits: ["Flexible seating", "Community access", "High speed WiFi"] },
    { key: "dedicated-desk", name: "Dedicated Desk", capacity: "1 Person", benefits: ["Fixed seat", "Personal locker", "24/7 access"] },
    { key: "private-cabin", name: "Private Cabin", capacity: "2-4 People", benefits: ["Lockable door", "Dedicated AC", "Meeting credits"] },
    { key: "team-cabin", name: "Team Cabin", capacity: "5-8 People", benefits: ["Private team space", "Whiteboard", "Priority booking"] },
    { key: "private-office", name: "Private Office", capacity: "8-15 People", benefits: ["Custom branding", "Dedicated reception", "Meeting room credits"] },
    { key: "enterprise-suite", name: "Enterprise Suite", capacity: "15-50 People", benefits: ["Full floor access", "Dedicated support", "Custom SLAs"] },
  ];

  const seatingOptions: SeatingOption[] = seatingTemplates.map((template, index) => ({
    key: template.key,
    name: template.name,
    image: seatingImageIds[index % seatingImageIds.length]
      ? `https://images.unsplash.com/photo-${seatingImageIds[index % seatingImageIds.length]}?w=480&h=320&fit=crop&q=80&auto=format`
      : listing.images[0],
    capacity: template.capacity,
    benefits: template.benefits,
    available: seededRandom(seed * (index + 11)) > 0.2,
  }));

  const amenities = [
    "WiFi",
    "AC",
    "Power Backup",
    "Meeting Rooms",
    "Reception",
    "Printing",
    "Lockers",
    "Pantry",
    "Coffee",
    "Snacks",
    ...(listing.accessibility.includes("Parking (Free/Paid)") ? ["Parking"] : []),
    "Event Space",
    "Phone Booths",
    "Security",
    "CCTV",
  ];

  const nearbyPlaces: NearbyPlace[] = [
    { category: "Cafe", name: cafeNames[Math.floor(r1 * cafeNames.length)], distanceKm: Math.round((0.2 + r1 * 1.2) * 10) / 10 },
    { category: "Restaurant", name: restaurantNames[Math.floor(r2 * restaurantNames.length)], distanceKm: Math.round((0.3 + r2 * 1.5) * 10) / 10 },
    { category: "Hotel", name: hotelNames[Math.floor(r3 * hotelNames.length)], distanceKm: Math.round((0.5 + r3 * 2.5) * 10) / 10 },
    { category: "Business Hub", name: businessHubNames[Math.floor(r4 * businessHubNames.length)], distanceKm: Math.round((0.4 + r4 * 2) * 10) / 10 },
  ];

  const whoIsThisFor = [
    "Startup Teams",
    "Freelancers",
    "Remote Workers",
    "Consultants",
    "Founders",
    "Sales Teams",
    "Agencies",
    "SMEs",
    "Corporate Teams",
  ];

  const seatDiscount = (seats: number) => Math.max(0.78, 1 - seats * 0.0022);
  const seatTiers: SeatTier[] = [5, 10, 25, 50, 100].map((seats) => ({
    seats,
    label: `${seats} Seats`,
    estimatedMonthly: Math.round(seats * dedicatedDeskPrice * seatDiscount(seats)),
  }));
  seatTiers.push({ seats: "Enterprise", label: "Enterprise Solutions", estimatedMonthly: null });

  const communityBenefits = [
    "Founder Network",
    "Startup Events",
    "Investor Meetups",
    "Workshops",
    "Business Networking",
    "Learning Sessions",
    "Partner Benefits",
  ];

  const fiveStarPercent = Math.round(40 + r1 * 25);
  const fourStarPercent = Math.round(20 + r2 * 15);
  const threeStarPercent = Math.round(5 + r3 * 10);
  const twoStarPercent = Math.round(2 + r4 * 5);
  const oneStarPercent = Math.max(0, 100 - fiveStarPercent - fourStarPercent - threeStarPercent - twoStarPercent);
  const ratingBreakdown: RatingBucket[] = [
    { stars: 5, percent: fiveStarPercent },
    { stars: 4, percent: fourStarPercent },
    { stars: 3, percent: threeStarPercent },
    { stars: 2, percent: twoStarPercent },
    { stars: 1, percent: oneStarPercent },
  ];

  const aiLovedTags: AiLovedTag[] = [
    { tag: "Great Community", mentions: Math.round(20 + r1 * 80) },
    { tag: "Fast Internet", mentions: Math.round(25 + r2 * 90) },
    { tag: "Helpful Staff", mentions: Math.round(18 + r3 * 70) },
    { tag: "Excellent Location", mentions: Math.round(30 + r4 * 95) },
    { tag: "Premium Environment", mentions: Math.round(15 + r1 * 60) },
    { tag: "Networking Opportunities", mentions: Math.round(12 + r2 * 55) },
  ].sort((a, b) => b.mentions - a.mentions);

  const reviewTemplates: Array<{ authorType: string; comment: string }> = [
    { authorType: "Startup Founder", comment: "The community here is incredible — found two of our early hires through events at this workspace." },
    { authorType: "Remote Developer", comment: "Internet has never dropped once in 6 months. Exactly what I need for client calls." },
    { authorType: "Sales Lead", comment: "Meeting rooms are always clean and the booking process is instant. Great for client pitches." },
    { authorType: "Agency Owner", comment: "Moved our 8-person team here from a smaller space. Scaling seats up was painless." },
    { authorType: "Freelance Designer", comment: "Loved the quiet phone booths and the coffee is genuinely good, not just office-grade instant stuff." },
    { authorType: "Operations Manager", comment: "Reception staff handle our courier and guest check-ins flawlessly every single day." },
  ];
  const reviews: ReviewItem[] = reviewTemplates.map((template, index) => {
    const rr = seededRandom(seed * (index + 21));
    const ratingValue = Math.min(5, Math.round((listing.rating - 0.3 + rr * 0.6) * 10) / 10);
    return {
      id: `${listing.id}-review-${index}`,
      authorInitial: template.authorType.charAt(0),
      authorType: template.authorType,
      rating: Math.max(3.5, ratingValue),
      date: `${1 + Math.floor(rr * 8)} weeks ago`,
      comment: template.comment,
    };
  });

  const matchScoreItems: MatchScoreItem[] = [
    { label: "Near Metro", achieved: listing.accessibility.includes("Metro Connectivity") },
    { label: "Startup Friendly", achieved: listing.spaceType === "Coworking Space" || listing.popular },
    { label: "High Speed Internet", achieved: listing.rating >= 4.0 },
    { label: "Meeting Rooms Included", achieved: listing.premier || listing.seatingTypes.length > 1 },
    { label: "Parking Available", achieved: listing.accessibility.includes("Parking (Free/Paid)") },
    { label: "Networking Community", achieved: listing.popular || listing.premier },
  ];
  const achievedCount = matchScoreItems.filter((item) => item.achieved).length;
  const matchScore = Math.min(99, 62 + achievedCount * 6 + Math.round(r1 * 4));

  const aiRecommendedFor = [
    { persona: "Founders", reason: "On-demand meeting rooms and a founder network to help you raise, hire and grow faster." },
    { persona: "Remote Teams", reason: "24/7 secure access and dedicated desks keep distributed teams productive in one shared base." },
    { persona: "Freelancers", reason: "Flexible open desks and a built-in community make it easy to network between projects." },
  ];

  return {
    galleryImages,
    badges,
    metroDistanceKm: listing.distanceKm,
    railwayDistanceKm: Math.round((listing.distanceKm + 1.5 + r2 * 3) * 10) / 10,
    airportDistanceKm: Math.round((8 + r3 * 18) * 10) / 10,
    membershipTypes,
    whyChooseFeatures,
    seatingOptions,
    amenities,
    nearbyPlaces,
    whoIsThisFor,
    seatTiers,
    communityBenefits,
    ratingBreakdown,
    aiLovedTags,
    reviews,
    matchScoreItems,
    matchScore,
    aiRecommendedFor,
  };
}
