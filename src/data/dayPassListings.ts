export type SortOption = "recommended" | "distance" | "price-asc" | "price-desc";

export interface DayPassFilters {
  seating: string[];
  brands: string[];
  accessibility: string[];
  timings: string[];
  spaceType: string | null;
  priceMin: number;
  priceMax: number;
  sort: SortOption;
  q: string;
}

export interface DayPassListing {
  id: string;
  city: string;
  brand: string;
  name: string;
  spaceType: "Coworking Space" | "Work Cafe";
  locality: string;
  distanceKm: number;
  openTime: string;
  closeTime: string;
  opensEarly: boolean;
  closesLate: boolean;
  openNow: boolean;
  seatingTypes: string[];
  accessibility: string[];
  price: number;
  bestPrice: number;
  offerCode: string;
  offerCount: number;
  rating: number;
  reviews: number;
  popular: boolean;
  premier: boolean;
  images: string[];
}

export const CITY_NAMES: Record<string, string> = {
  mumbai: "Mumbai",
  delhi: "Delhi",
  bangalore: "Bangalore",
  pune: "Pune",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
};

export const cityToLocalities: Record<string, string[]> = {
  mumbai: ["Lower Parel", "Thane West", "Powai", "Goregaon", "BKC", "Andheri East", "Worli", "Malad"],
  delhi: ["Connaught Place", "Saket", "Cyber City, Gurugram", "Nehru Place", "Aerocity", "Karol Bagh", "Noida Sector 62", "Vasant Kunj"],
  bangalore: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "MG Road", "Electronic City", "Marathahalli", "JP Nagar"],
  pune: ["Koregaon Park", "Hinjewadi", "Baner", "Viman Nagar", "Kharadi", "Aundh", "Wakad", "Magarpatta"],
  hyderabad: ["Hitech City", "Gachibowli", "Banjara Hills", "Madhapur", "Kondapur", "Jubilee Hills", "Begumpet", "Kukatpally"],
  chennai: ["T Nagar", "OMR", "Anna Nagar", "Velachery", "Guindy", "Nungambakkam", "Adyar", "Porur"],
};

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
  "1517502884422-41eaead166d4",
  "1497366216548-37526070297c",
].map((id) => `https://images.unsplash.com/photo-${id}?w=560&h=380&fit=crop&q=80&auto=format`);

interface ListingTemplate {
  brand: string;
  nameSuffix: string;
  spaceType: "Coworking Space" | "Work Cafe";
  seatingTypes: string[];
  accessibility: string[];
  openTime: string;
  closeTime: string;
  basePrice: number;
  popular: boolean;
  premier: boolean;
}

const templates: ListingTemplate[] = [
  {
    brand: "WeWork",
    nameSuffix: "Nesco IT Park",
    spaceType: "Coworking Space",
    seatingTypes: ["Open Desk", "Lounge Spot", "Premium Desk"],
    accessibility: ["Metro Connectivity", "Parking (Free/Paid)"],
    openTime: "09:00",
    closeTime: "20:00",
    basePrice: 750,
    popular: true,
    premier: true,
  },
  {
    brand: "awfis",
    nameSuffix: "Business Park",
    spaceType: "Coworking Space",
    seatingTypes: ["Open Desk", "Private Cabin"],
    accessibility: ["Parking (Free/Paid)"],
    openTime: "09:00",
    closeTime: "19:00",
    basePrice: 349,
    popular: true,
    premier: false,
  },
  {
    brand: "COWRKS",
    nameSuffix: "Winchester",
    spaceType: "Coworking Space",
    seatingTypes: ["Premium Desk", "Lounge Spot"],
    accessibility: ["Metro Connectivity"],
    openTime: "09:00",
    closeTime: "20:00",
    basePrice: 799,
    popular: true,
    premier: true,
  },
  {
    brand: "CorporatEdge",
    nameSuffix: "One International Center",
    spaceType: "Coworking Space",
    seatingTypes: ["Premium Desk"],
    accessibility: ["Metro Connectivity", "Parking (Free/Paid)", "Wheelchair Access"],
    openTime: "08:30",
    closeTime: "18:30",
    basePrice: 950,
    popular: true,
    premier: false,
  },
  {
    brand: "Smartworks",
    nameSuffix: "Tech Park",
    spaceType: "Coworking Space",
    seatingTypes: ["Open Desk", "Premium Desk", "Private Cabin"],
    accessibility: ["Metro Connectivity"],
    openTime: "09:00",
    closeTime: "19:00",
    basePrice: 599,
    popular: false,
    premier: false,
  },
  {
    brand: "WeWork",
    nameSuffix: "Zenia",
    spaceType: "Coworking Space",
    seatingTypes: ["Open Desk", "Premium Desk"],
    accessibility: [],
    openTime: "09:00",
    closeTime: "20:00",
    basePrice: 650,
    popular: true,
    premier: false,
  },
  {
    brand: "awfis",
    nameSuffix: "Supreme Business Park",
    spaceType: "Work Cafe",
    seatingTypes: ["Lounge Spot"],
    accessibility: [],
    openTime: "09:00",
    closeTime: "19:00",
    basePrice: 349,
    popular: false,
    premier: false,
  },
  {
    brand: "COWRKS",
    nameSuffix: "Forum Square",
    spaceType: "Coworking Space",
    seatingTypes: ["Private Cabin", "Premium Desk"],
    accessibility: ["Wheelchair Access"],
    openTime: "08:00",
    closeTime: "21:00",
    basePrice: 899,
    popular: false,
    premier: true,
  },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildListings(): DayPassListing[] {
  const listings: DayPassListing[] = [];
  let seed = 1;

  Object.keys(CITY_NAMES).forEach((city) => {
    const localities = cityToLocalities[city];
    templates.forEach((template, index) => {
      seed += 1;
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed * 2.13);
      const r3 = seededRandom(seed * 3.7);

      const locality = localities[index % localities.length];
      const distanceKm = Math.round((3 + r1 * 22) * 100) / 100;
      const price = template.basePrice + Math.round(r2 * 150);
      const discountPercent = 20 + Math.round(r3 * 30);
      const bestPrice = Math.round((price * (100 - discountPercent)) / 100);
      const rating = Math.round((4.1 + r1 * 0.8) * 100) / 100;
      const reviews = Math.round(40 + r2 * 8600);

      listings.push({
        id: `${city}-${template.brand.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        city,
        brand: template.brand,
        name: `Desk | ${template.brand} - ${template.nameSuffix}`,
        spaceType: template.spaceType,
        locality,
        distanceKm,
        openTime: template.openTime,
        closeTime: template.closeTime,
        opensEarly: template.openTime <= "08:30",
        closesLate: template.closeTime >= "19:30",
        openNow: r3 > 0.3,
        seatingTypes: template.seatingTypes,
        accessibility: template.accessibility,
        price,
        bestPrice,
        offerCode: `MYHQ${discountPercent}`,
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

export const dayPassListings: DayPassListing[] = buildListings();

export const allBrands = Array.from(new Set(templates.map((t) => t.brand)));
export const allSeatingTypes = ["Open Desk", "Premium Desk", "Private Cabin", "Lounge Spot"];
export const allAccessibility = ["Metro Connectivity", "Parking (Free/Paid)", "Wheelchair Access"];
export const allSpaceTypes = ["Coworking Space", "Work Cafe"];
