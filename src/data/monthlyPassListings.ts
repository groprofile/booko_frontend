import { CITY_NAMES, cityToLocalities } from "./dayPassListings";

export type MonthlySortOption = "recommended" | "distance" | "price-asc" | "price-desc";

export interface MonthlyPassFilters {
  seating: string[];
  brands: string[];
  accessibility: string[];
  lockIn: string[];
  spaceType: string | null;
  priceMin: number;
  priceMax: number;
  sort: MonthlySortOption;
  q: string;
}

export interface MonthlyPassListing {
  id: string;
  city: string;
  brand: string;
  name: string;
  spaceType: "Coworking Space" | "Managed Office";
  locality: string;
  distanceKm: number;
  seatingTypes: string[];
  accessibility: string[];
  lockIn: string;
  price: number;
  bestPrice: number;
  offerCode: string;
  offerCount: number;
  rating: number;
  reviews: number;
  popular: boolean;
  premier: boolean;
  // Admin-promoted center — pins to the top of default-sorted results and
  // shows the "Bokko Recommended" badge. Optional: mock data omits it.
  isFeatured?: boolean;
  // Admin priority (lower = shown first). Breaks ties among promoted centers.
  featuredRank?: number | null;
  // Center coordinates — used to fetch its "Nearby" carousel from the live API.
  latitude?: number | null;
  longitude?: number | null;
  images: string[];
}

export { CITY_NAMES, cityToLocalities };

const images = [
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
].map((id) => `https://images.unsplash.com/photo-${id}?w=560&h=380&fit=crop&q=80&auto=format`);

interface MonthlyTemplate {
  brand: string;
  nameSuffix: string;
  spaceType: "Coworking Space" | "Managed Office";
  seatingTypes: string[];
  accessibility: string[];
  lockIn: string;
  basePrice: number;
  popular: boolean;
  premier: boolean;
}

const templates: MonthlyTemplate[] = [
  {
    brand: "WeWork",
    nameSuffix: "Managed Office - Nesco IT Park",
    spaceType: "Managed Office",
    seatingTypes: ["Managed Office", "Dedicated Desk"],
    accessibility: ["Metro Connectivity", "Parking (Free/Paid)"],
    lockIn: "6 Months",
    basePrice: 12000,
    popular: true,
    premier: true,
  },
  {
    brand: "awfis",
    nameSuffix: "Dedicated Desk - Business Park",
    spaceType: "Coworking Space",
    seatingTypes: ["Dedicated Desk"],
    accessibility: ["Parking (Free/Paid)"],
    lockIn: "No Lock-in",
    basePrice: 7500,
    popular: true,
    premier: false,
  },
  {
    brand: "COWRKS",
    nameSuffix: "Private Cabin - Winchester",
    spaceType: "Coworking Space",
    seatingTypes: ["Private Cabin", "Dedicated Desk"],
    accessibility: ["Metro Connectivity"],
    lockIn: "3 Months",
    basePrice: 14500,
    popular: true,
    premier: true,
  },
  {
    brand: "CorporatEdge",
    nameSuffix: "Team Desk Suite - One International Center",
    spaceType: "Managed Office",
    seatingTypes: ["Team Desk", "Private Cabin"],
    accessibility: ["Metro Connectivity", "Parking (Free/Paid)", "Wheelchair Access"],
    lockIn: "12 Months",
    basePrice: 16500,
    popular: true,
    premier: false,
  },
  {
    brand: "Smartworks",
    nameSuffix: "Enterprise Floor - Tech Park",
    spaceType: "Managed Office",
    seatingTypes: ["Managed Office", "Team Desk"],
    accessibility: ["Metro Connectivity"],
    lockIn: "12 Months",
    basePrice: 18500,
    popular: false,
    premier: true,
  },
  {
    brand: "WeWork",
    nameSuffix: "Dedicated Desk - Zenia",
    spaceType: "Coworking Space",
    seatingTypes: ["Dedicated Desk", "Private Cabin"],
    accessibility: [],
    lockIn: "6 Months",
    basePrice: 9500,
    popular: true,
    premier: false,
  },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildListings(): MonthlyPassListing[] {
  const listings: MonthlyPassListing[] = [];
  let seed = 7;

  Object.keys(CITY_NAMES).forEach((city) => {
    const localities = cityToLocalities[city];
    if (!localities) return;
    templates.forEach((template, index) => {
      seed += 1;
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed * 2.13);
      const r3 = seededRandom(seed * 3.7);

      const locality = localities[(index + 2) % localities.length];
      const distanceKm = Math.round((2 + r1 * 20) * 100) / 100;
      const price = template.basePrice + Math.round(r2 * 2000);
      const discountPercent = 10 + Math.round(r3 * 20);
      const bestPrice = Math.round((price * (100 - discountPercent)) / 100);
      const rating = Math.round((4.1 + r1 * 0.8) * 100) / 100;
      const reviews = Math.round(30 + r2 * 4000);

      listings.push({
        id: `${city}-mp-${template.brand.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        city,
        brand: template.brand,
        name: `${template.brand} - ${template.nameSuffix}`,
        spaceType: template.spaceType,
        locality,
        distanceKm,
        seatingTypes: template.seatingTypes,
        accessibility: template.accessibility,
        lockIn: template.lockIn,
        price,
        bestPrice,
        offerCode: `BOKKO${discountPercent}`,
        offerCount: 1 + Math.round(r1 * 3),
        rating,
        reviews,
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

export const monthlyPassListings: MonthlyPassListing[] = buildListings();

export const allMonthlyBrands = Array.from(new Set(templates.map((t) => t.brand)));
export const allMonthlySeatingTypes = ["Dedicated Desk", "Private Cabin", "Managed Office", "Team Desk"];
export const allMonthlyAccessibility = ["Metro Connectivity", "Parking (Free/Paid)", "Wheelchair Access"];
export const allMonthlySpaceTypes = ["Coworking Space", "Managed Office"];
export const allLockInOptions = ["No Lock-in", "3 Months", "6 Months", "12 Months"];
