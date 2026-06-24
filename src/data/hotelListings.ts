import { CITY_NAMES, cityToLocalities } from "./dayPassListings";

export { CITY_NAMES, cityToLocalities };

export type HotelSortOption =
  | "recommended"
  | "popularity"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "distance";

export interface HotelPriceTier {
  key: "3" | "6" | "12" | "full-day";
  label: string;
  price: number;
  available: boolean;
}

export interface HotelFilters {
  stayTypes: string[];
  durations: string[];
  areas: string[];
  priceMin: number;
  priceMax: number;
  ratings: number[];
  categories: string[];
  popularTags: string[];
  chains: string[];
  amenities: string[];
  sort: HotelSortOption;
  q: string;
}

export interface HotelListing {
  id: string;
  city: string;
  chain: string;
  name: string;
  locality: string;
  distanceKm: number;
  stayTypes: string[];
  category: string;
  badges: string[];
  rating: number;
  reviews: number;
  amenities: string[];
  trustSignals: string[];
  popularTags: string[];
  pricing: HotelPriceTier[];
  bestPrice: number;
  offerCode: string;
  popular: boolean;
  images: string[];
}

export const allStayTypes = ["Hourly Stay", "Full Day Stay", "Workcation", "Business Hotel"];
export const allDurations = ["3", "6", "12", "24"];
export const allRatingThresholds = [4.5, 4, 3.5, 3];
export const allCategories = ["Premium", "Luxury", "Business", "Budget", "Boutique"];
export const allPopularTags = [
  "Couple Friendly",
  "Pay At Hotel",
  "Instant Confirmation",
  "Free Cancellation",
  "Early Check-in",
  "Late Check-out",
];
export const allHotelChains = ["Lemon Tree", "Bloom Hotel", "Ginger", "Radisson", "Ibis", "Marriott"];
export const allHotelAmenities = [
  "Wifi",
  "Parking",
  "AC",
  "Breakfast",
  "Swimming Pool",
  "Gym",
  "Restaurant",
  "Meeting Room",
  "Workspace",
];
export const allTrustSignals = [
  "Accepts Local ID",
  "Couple Friendly",
  "Instant Confirmation",
  "Pay At Hotel",
  "Free Cancellation",
  "Business Friendly",
  "Workspace Available",
];

const images = [
  "1566073771259-6a8506099945",
  "1551882547-ff40c63fe5fa",
  "1542314831-068cd1dbfeeb",
  "1520250497591-112f2f40a3f4",
  "1582719478250-c89cae4dc85b",
  "1564501049412-61c2a3083791",
  "1611892440504-42a792e24d32",
  "1590490360182-c33d57733427",
].map((id) => `https://images.unsplash.com/photo-${id}?w=560&h=380&fit=crop&q=80&auto=format`);

interface HotelTemplate {
  chain: string;
  nameSuffix: string;
  stayTypes: string[];
  category: string;
  badges: string[];
  amenities: string[];
  trustSignals: string[];
  popularTags: string[];
  baseRate: number;
  popular: boolean;
}

const templates: HotelTemplate[] = [
  {
    chain: "Lemon Tree",
    nameSuffix: "Premiere",
    stayTypes: ["Hourly Stay", "Full Day Stay"],
    category: "Business",
    badges: ["Premium"],
    amenities: ["Wifi", "Parking", "AC", "Breakfast", "Restaurant", "Meeting Room"],
    trustSignals: ["Accepts Local ID", "Instant Confirmation", "Business Friendly", "Workspace Available"],
    popularTags: ["Pay At Hotel", "Instant Confirmation", "Early Check-in"],
    baseRate: 950,
    popular: true,
  },
  {
    chain: "Bloom Hotel",
    nameSuffix: "Residency",
    stayTypes: ["Hourly Stay"],
    category: "Budget",
    badges: [],
    amenities: ["Wifi", "AC", "Breakfast"],
    trustSignals: ["Accepts Local ID", "Couple Friendly", "Pay At Hotel"],
    popularTags: ["Couple Friendly", "Pay At Hotel"],
    baseRate: 480,
    popular: false,
  },
  {
    chain: "Ginger",
    nameSuffix: "Business Suites",
    stayTypes: ["Hourly Stay", "Business Hotel"],
    category: "Business",
    badges: ["Best Seller"],
    amenities: ["Wifi", "Parking", "AC", "Gym", "Restaurant", "Meeting Room", "Workspace"],
    trustSignals: ["Accepts Local ID", "Instant Confirmation", "Business Friendly", "Workspace Available"],
    popularTags: ["Instant Confirmation", "Free Cancellation"],
    baseRate: 780,
    popular: true,
  },
  {
    chain: "Radisson",
    nameSuffix: "Blu Suites",
    stayTypes: ["Full Day Stay", "Workcation", "Business Hotel"],
    category: "Luxury",
    badges: ["Luxury", "Top Rated"],
    amenities: ["Wifi", "Parking", "AC", "Breakfast", "Swimming Pool", "Gym", "Restaurant", "Meeting Room"],
    trustSignals: ["Instant Confirmation", "Free Cancellation", "Business Friendly", "Workspace Available"],
    popularTags: ["Free Cancellation", "Late Check-out"],
    baseRate: 2400,
    popular: true,
  },
  {
    chain: "Ibis",
    nameSuffix: "Style",
    stayTypes: ["Hourly Stay", "Full Day Stay"],
    category: "Premium",
    badges: ["Premium"],
    amenities: ["Wifi", "Parking", "AC", "Breakfast", "Restaurant"],
    trustSignals: ["Accepts Local ID", "Couple Friendly", "Instant Confirmation", "Pay At Hotel"],
    popularTags: ["Couple Friendly", "Instant Confirmation", "Pay At Hotel"],
    baseRate: 1100,
    popular: false,
  },
  {
    chain: "Marriott",
    nameSuffix: "Executive Apartments",
    stayTypes: ["Full Day Stay", "Workcation"],
    category: "Luxury",
    badges: ["Luxury", "Top Rated"],
    amenities: ["Wifi", "Parking", "AC", "Breakfast", "Swimming Pool", "Gym", "Restaurant", "Workspace"],
    trustSignals: ["Instant Confirmation", "Free Cancellation", "Business Friendly", "Workspace Available"],
    popularTags: ["Free Cancellation", "Late Check-out"],
    baseRate: 3200,
    popular: true,
  },
  {
    chain: "Lemon Tree",
    nameSuffix: "Boutique Stay",
    stayTypes: ["Full Day Stay"],
    category: "Boutique",
    badges: ["Top Rated"],
    amenities: ["Wifi", "AC", "Breakfast", "Restaurant"],
    trustSignals: ["Couple Friendly", "Free Cancellation"],
    popularTags: ["Couple Friendly", "Free Cancellation", "Late Check-out"],
    baseRate: 1850,
    popular: false,
  },
  {
    chain: "Bloom Hotel",
    nameSuffix: "Express",
    stayTypes: ["Hourly Stay", "Full Day Stay"],
    category: "Budget",
    badges: [],
    amenities: ["Wifi", "AC", "Parking"],
    trustSignals: ["Accepts Local ID", "Couple Friendly", "Pay At Hotel"],
    popularTags: ["Couple Friendly", "Pay At Hotel", "Early Check-in"],
    baseRate: 560,
    popular: true,
  },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildPricing(template: HotelTemplate, baseRate: number): { pricing: HotelPriceTier[]; bestPrice: number } {
  const hourlyAvailable = template.stayTypes.includes("Hourly Stay");
  const fullDayAvailable =
    template.stayTypes.includes("Full Day Stay") ||
    template.stayTypes.includes("Workcation") ||
    template.stayTypes.includes("Business Hotel");

  const pricing: HotelPriceTier[] = [
    { key: "3", label: "3 Hrs", price: Math.round((baseRate * 1) / 10) * 10, available: hourlyAvailable },
    { key: "6", label: "6 Hrs", price: Math.round((baseRate * 1.4) / 10) * 10, available: hourlyAvailable },
    { key: "12", label: "12 Hrs", price: Math.round((baseRate * 2.1) / 10) * 10, available: hourlyAvailable },
    {
      key: "full-day",
      label: "Full Day",
      price: Math.round((hourlyAvailable ? baseRate * 3.2 : baseRate) / 10) * 10,
      available: fullDayAvailable,
    },
  ];

  const firstAvailable = pricing.find((tier) => tier.available) ?? pricing[0];
  return { pricing, bestPrice: firstAvailable.price };
}

function buildListings(): HotelListing[] {
  const listings: HotelListing[] = [];
  let seed = 1;

  Object.keys(CITY_NAMES).forEach((city) => {
    const localities = cityToLocalities[city];
    templates.forEach((template, index) => {
      seed += 1;
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed * 2.13);
      const r3 = seededRandom(seed * 3.7);

      const locality = localities[index % localities.length];
      const distanceKm = Math.round((1 + r1 * 18) * 100) / 100;
      const rateVariance = Math.round(r2 * 200);
      const { pricing, bestPrice } = buildPricing(template, template.baseRate + rateVariance);
      const discountPercent = 20 + Math.round(r3 * 25);
      const discountedBest = Math.round((bestPrice * (100 - discountPercent)) / 100);
      const rating = Math.round((3.6 + r1 * 1.2) * 10) / 10;
      const reviews = Math.round(30 + r2 * 400);

      listings.push({
        id: `${city}-${template.chain.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        city,
        chain: template.chain,
        name: `Hotel ${template.chain} ${template.nameSuffix}`,
        locality,
        distanceKm,
        stayTypes: template.stayTypes,
        category: template.category,
        badges: template.badges,
        rating,
        reviews,
        amenities: template.amenities,
        trustSignals: template.trustSignals,
        popularTags: template.popularTags,
        pricing,
        bestPrice: discountedBest,
        offerCode: `BOKKO${discountPercent}`,
        popular: template.popular,
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

export const hotelListings: HotelListing[] = buildListings();
