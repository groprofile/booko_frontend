import { CITY_NAMES, cityToLocalities, dayPassListings } from "./dayPassListings";
import type { DayPassListing } from "./dayPassListings";
import { meetingRoomListings } from "./meetingRoomListings";
import type { MeetingRoomListing } from "./meetingRoomListings";
import { monthlyPassListings } from "./monthlyPassListings";
import type { MonthlyPassListing } from "./monthlyPassListings";
import { virtualOfficeListings } from "./virtualOfficeListings";
import type { VirtualOfficeListing } from "./virtualOfficeListings";
import { getMeetingRoomDetails } from "./meetingRoomDetails";
import { slugify } from "../utils/slug";

export { CITY_NAMES, cityToLocalities };

export type ServiceKey =
  | "dayPass"
  | "meetingRoom"
  | "monthlyPass"
  | "virtualOffice"
  | "privateCabin"
  | "managedOffice"
  | "trainingRoom"
  | "boardRoom";

export interface ServiceLink {
  key: ServiceKey;
  label: string;
  priceLabel: string;
  href: string;
}

export interface MatchScoreItem {
  label: string;
  achieved: boolean;
}

export interface CoworkingSpace {
  id: string;
  city: string;
  brand: string;
  locationLabel: string;
  name: string;
  locality: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  startingPrice: number;
  image: string;
  images: string[];
  premium: boolean;
  popular: boolean;
  metroConnectivity: boolean;
  parking: boolean;
  access247: boolean;
  instantBooking: boolean;
  corporateFriendly: boolean;
  gstCompliant: boolean;
  services: ServiceLink[];
  serviceKeys: ServiceKey[];
  matchScoreItems: MatchScoreItem[];
  matchScore: number;
  // Admin-promoted center — pins to the top of default-sorted results and
  // shows the "Bokko Recommended" badge. Optional: mock data omits it.
  isFeatured?: boolean;
  // Admin priority (lower = shown first). Breaks ties among promoted centers.
  featuredRank?: number | null;
  // Center coordinates — used to fetch its "Nearby" carousel from the live API.
  latitude?: number | null;
  longitude?: number | null;
}

export const allServiceOptions: { key: ServiceKey; label: string }[] = [
  { key: "dayPass", label: "Day Pass" },
  { key: "meetingRoom", label: "Meeting Room" },
  { key: "monthlyPass", label: "Monthly Pass" },
  { key: "privateCabin", label: "Private Cabin" },
  { key: "virtualOffice", label: "Virtual Office" },
  { key: "managedOffice", label: "Managed Office" },
  { key: "trainingRoom", label: "Training Room" },
  { key: "boardRoom", label: "Board Room" },
];

export const comingSoonCities: { slug: string; label: string }[] = [
  { slug: "kolkata", label: "Kolkata" },
  { slug: "ahmedabad", label: "Ahmedabad" },
  { slug: "noida", label: "Noida" },
  { slug: "gurgaon", label: "Gurgaon" },
];

export type SortOption =
  | "popularity"
  | "top-rated"
  | "most-booked"
  | "newest"
  | "price-asc"
  | "price-desc";

const BRAND_DISPLAY: Record<string, string> = {
  wework: "WeWork",
  awfis: "Awfis",
  cowrks: "COWRKS",
  corporatedge: "CorporatEdge",
  smartworks: "Smartworks",
  indiqube: "IndiQube",
  regus: "Regus",
};

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

function lastSegment(value: string): string {
  const parts = value.split(" - ");
  return parts[parts.length - 1].trim();
}

interface JoinEntry {
  brandKey: string;
  locationLabel: string;
  dp?: DayPassListing;
  mr?: MeetingRoomListing;
  mp?: MonthlyPassListing;
  vo?: VirtualOfficeListing;
}

function buildSpace(city: string, key: string, entry: JoinEntry): CoworkingSpace {
  const { dp, mr, mp, vo } = entry;
  const brand = BRAND_DISPLAY[entry.brandKey] ?? entry.brandKey;
  const name = `${brand} - ${entry.locationLabel}`;
  const id = `${city}-cw-${key.replace(/[^a-z0-9]+/g, "-")}`;
  const seed = hashSeed(id);
  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed * 2.31);

  const localities = cityToLocalities[city];
  const locality = dp?.locality ?? mr?.locality ?? mp?.locality ?? vo?.area ?? localities[Math.floor(r1 * localities.length)];
  const images = [...new Set([...(dp?.images ?? []), ...(mr?.images ?? []), ...(vo?.images ?? []), ...(mp?.images ?? [])])].filter(Boolean);
  const image = images[0] ?? "";
  const distanceKm = dp?.distanceKm ?? mr?.distanceKm ?? mp?.distanceKm ?? Math.round((2 + r1 * 18) * 10) / 10;

  const realRatings: number[] = [];
  if (dp) realRatings.push(dp.rating);
  if (mp) realRatings.push(mp.rating);
  if (vo) realRatings.push(vo.rating);

  let rating: number;
  let reviews: number;
  if (realRatings.length > 0) {
    rating = Math.round((realRatings.reduce((sum, value) => sum + value, 0) / realRatings.length) * 100) / 100;
    reviews = (dp?.reviews ?? 0) + (mp?.reviews ?? 0) + (vo?.reviews ?? 0);
    if (mr) reviews += getMeetingRoomDetails(mr).reviewCount;
  } else if (mr) {
    const mrDetails = getMeetingRoomDetails(mr);
    rating = mrDetails.rating;
    reviews = mrDetails.reviewCount;
  } else {
    rating = Math.round((4 + r1 * 0.8) * 100) / 100;
    reviews = Math.round(20 + r2 * 200);
  }

  const premium = Boolean(dp?.premier || mr?.premier || mp?.premier || vo?.premier);
  const popularFlag = Boolean(dp?.popular || mr?.popular || mp?.popular || vo?.popular);

  const metroConnectivity = Boolean(
    dp?.accessibility.includes("Metro Connectivity") ||
      mp?.accessibility.includes("Metro Connectivity") ||
      vo?.metroConnectivity,
  );
  const parking = Boolean(
    dp?.accessibility.includes("Parking (Free/Paid)") ||
      mp?.accessibility.includes("Parking (Free/Paid)") ||
      mr?.amenities.includes("Parking"),
  );
  const access247 = Boolean(mp);
  const instantBooking = Boolean(dp || mp || mr?.bookingOptions.includes("Instant Confirmation"));
  const corporateFriendly = Boolean(
    (mp && (mp.spaceType === "Managed Office" || mp.seatingTypes.includes("Team Desk"))) ||
      mr?.bookingOptions.includes("Corporate Billing") ||
      vo?.servicesIncluded.includes("Company Registration"),
  );
  const gstCompliant = Boolean(vo?.gstEligible);

  const services: ServiceLink[] = [];
  if (dp) {
    services.push({
      key: "dayPass",
      label: "Day Pass",
      priceLabel: `Day Pass from ₹${dp.bestPrice}`,
      href: `/day-pass/${dp.id}`,
    });
  }
  if (mr) {
    services.push({
      key: "meetingRoom",
      label: "Meeting Rooms",
      priceLabel: `Meeting Room from ₹${mr.bestPrice}/hr`,
      href: `/meeting-rooms/${slugify(mr.workspaceName)}`,
    });
  }
  if (mp) {
    services.push({
      key: "monthlyPass",
      label: "Monthly Pass",
      priceLabel: `Monthly Pass from ₹${mp.bestPrice.toLocaleString()}`,
      href: `/monthly-pass/${slugify(mp.name)}`,
    });
  }
  if (vo) {
    services.push({
      key: "virtualOffice",
      label: "Virtual Office",
      priceLabel: `Virtual Office from ₹${vo.bestPrice}/month`,
      href: `/virtual-office/${slugify(vo.centerName)}`,
    });
  }
  if (mp?.seatingTypes.includes("Private Cabin")) {
    services.push({
      key: "privateCabin",
      label: "Private Cabin",
      priceLabel: "Private Cabin Available",
      href: `/monthly-pass/${slugify(mp.name)}`,
    });
  } else if (dp?.seatingTypes.includes("Private Cabin")) {
    services.push({
      key: "privateCabin",
      label: "Private Cabin",
      priceLabel: "Private Cabin Available",
      href: `/day-pass/${dp.id}`,
    });
  }
  if (mp?.spaceType === "Managed Office") {
    services.push({
      key: "managedOffice",
      label: "Managed Office",
      priceLabel: "Managed Office Available",
      href: `/monthly-pass/${slugify(mp.name)}`,
    });
  }
  if (mr?.roomType === "Training Room") {
    services.push({
      key: "trainingRoom",
      label: "Training Room",
      priceLabel: `Training Room from ₹${mr.bestPrice}/hr`,
      href: `/meeting-rooms/${slugify(mr.workspaceName)}`,
    });
  }
  if (mr?.roomType === "Board Room") {
    services.push({
      key: "boardRoom",
      label: "Board Room",
      priceLabel: `Board Room from ₹${mr.bestPrice}/hr`,
      href: `/meeting-rooms/${slugify(mr.workspaceName)}`,
    });
  }

  const startingPrice = Math.min(
    ...[dp?.bestPrice, mr?.bestPrice, mp?.bestPrice, vo?.bestPrice].filter((value): value is number => typeof value === "number"),
  );

  const matchScoreItems: MatchScoreItem[] = [
    { label: "Startup Friendly", achieved: popularFlag || Boolean(vo?.popularTags.includes("Startup Friendly")) },
    { label: "Near Metro", achieved: metroConnectivity },
    { label: "Fast Internet", achieved: rating >= 4.0 },
    { label: "Meeting Rooms Available", achieved: services.some((service) => service.key === "meetingRoom") },
    { label: "Parking Available", achieved: parking },
  ];
  const achievedCount = matchScoreItems.filter((item) => item.achieved).length;
  const matchScore = Math.min(99, 58 + achievedCount * 7 + Math.round(r2 * 4));

  return {
    id,
    city,
    brand,
    locationLabel: entry.locationLabel,
    name,
    locality,
    distanceKm,
    rating,
    reviews,
    startingPrice,
    image,
    images: images.length ? images : [image],
    premium,
    popular: popularFlag,
    metroConnectivity,
    parking,
    access247,
    instantBooking,
    corporateFriendly,
    gstCompliant,
    services,
    serviceKeys: services.map((service) => service.key),
    matchScoreItems,
    matchScore,
  };
}

function buildCoworkingSpaces(): CoworkingSpace[] {
  const spaces: CoworkingSpace[] = [];

  Object.keys(CITY_NAMES).forEach((city) => {
    const map = new Map<string, JoinEntry>();

    function upsert(brand: string, sourceName: string, patch: Partial<JoinEntry>) {
      const brandKey = brand.toLowerCase();
      const locationLabel = lastSegment(sourceName);
      const key = `${brandKey}|${locationLabel.toLowerCase()}`;
      const existing = map.get(key) ?? { brandKey, locationLabel };
      map.set(key, { ...existing, ...patch });
    }

    dayPassListings.filter((listing) => listing.city === city).forEach((listing) => upsert(listing.brand, listing.name, { dp: listing }));
    meetingRoomListings
      .filter((listing) => listing.city === city)
      .forEach((listing) => upsert(listing.brand, listing.workspaceName, { mr: listing }));
    monthlyPassListings.filter((listing) => listing.city === city).forEach((listing) => upsert(listing.brand, listing.name, { mp: listing }));
    virtualOfficeListings
      .filter((listing) => listing.city === city)
      .forEach((listing) => upsert(listing.brand, listing.centerName, { vo: listing }));

    map.forEach((entry, key) => {
      spaces.push(buildSpace(city, key, entry));
    });
  });

  return spaces;
}

export const coworkingSpaces: CoworkingSpace[] = buildCoworkingSpaces();

export const allProviders: string[] = Array.from(new Set(coworkingSpaces.map((space) => space.brand))).sort();

export function sortSpaces(list: CoworkingSpace[], sort: SortOption): CoworkingSpace[] {
  const sorted = [...list];
  if (sort === "top-rated") sorted.sort((a, b) => b.rating - a.rating);
  else if (sort === "most-booked") sorted.sort((a, b) => b.reviews - a.reviews);
  else if (sort === "newest") sorted.sort((a, b) => hashSeed(b.id) - hashSeed(a.id));
  else if (sort === "price-asc") sorted.sort((a, b) => a.startingPrice - b.startingPrice);
  else if (sort === "price-desc") sorted.sort((a, b) => b.startingPrice - a.startingPrice);
  // Default ("popularity"): admin-promoted centers lead — by priority rank
  // among themselves — then popular, then rating. Explicit sorts (price/
  // top-rated/most-booked) are left untouched so an intentional choice like
  // "price low to high" is always respected.
  else sorted.sort((a, b) => {
    const feat = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    if (feat) return feat;
    if (a.isFeatured && b.isFeatured) {
      const rank = (a.featuredRank ?? Infinity) - (b.featuredRank ?? Infinity);
      if (rank) return rank;
    }
    return Number(b.popular) - Number(a.popular) || b.rating - a.rating;
  });
  return sorted;
}
