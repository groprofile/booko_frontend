import { CITY_NAMES, cityToLocalities } from "./dayPassListings";

export { CITY_NAMES, cityToLocalities };

export type VOSortOption = "recommended" | "popularity" | "price-asc" | "price-desc" | "rating";

export interface VOPlan {
  key: string;
  name: string;
  price: number;
  description: string;
}

export interface VirtualOfficeFilters {
  areas: string[];
  services: string[];
  durations: string[];
  priceMin: number;
  priceMax: number;
  popularTags: string[];
  buildingTypes: string[];
  brands: string[];
  ratings: number[];
  sort: VOSortOption;
  q: string;
}

export interface VirtualOfficeListing {
  id: string;
  city: string;
  brand: string;
  centerName: string;
  area: string;
  buildingType: string;
  address: string;
  rating: number;
  reviews: number;
  popularTags: string[];
  servicesIncluded: string[];
  durations: string[];
  metroConnectivity: boolean;
  businessAddressAvailable: boolean;
  gstEligible: boolean;
  premier: boolean;
  popular: boolean;
  plans: VOPlan[];
  bestPrice: number;
  images: string[];
}

export const allServices = [
  "GST Registration",
  "Business Address",
  "Company Registration",
  "Mail Handling",
  "Courier Handling",
  "Reception Support",
  "Meeting Room Credits",
  "Call Answering",
];

export const allDurations = ["Monthly", "Quarterly", "Half Yearly", "Yearly"];

export const allPopularTags = [
  "Most Popular",
  "GST Approved",
  "Startup Friendly",
  "Best Seller",
  "Premium Location",
  "Affordable",
];

export const allBuildingTypes = [
  "Coworking",
  "Business Center",
  "Commercial Tower",
  "Premium Business Hub",
];

export const allBrands = ["WeWork", "Awfis", "Smartworks", "IndiQube", "Regus", "CorporatEdge"];

export const allRatingThresholds = [4.5, 4, 3.5];

const images = [
  "1497366811353-6870744d04b2",
  "1497366754035-f200968a6e72",
  "1497366216548-37526070297c",
  "1604328698692-f76ea9498e76",
  "1521737711867-e3b97375f902",
  "1556761175-b413da4baf72",
  "1431540015161-0bf868a2d407",
  "1517502884422-41eaead166d4",
].map((id) => `https://images.unsplash.com/photo-${id}?w=560&h=380&fit=crop&q=80&auto=format`);

interface VOTemplate {
  brand: string;
  nameSuffix: string;
  buildingType: string;
  popularTags: string[];
  servicesIncluded: string[];
  durations: string[];
  metroConnectivity: boolean;
  premier: boolean;
  popular: boolean;
  basePrice: number;
}

const templates: VOTemplate[] = [
  {
    brand: "WeWork",
    nameSuffix: "BKC",
    buildingType: "Premium Business Hub",
    popularTags: ["Most Popular", "GST Approved", "Premium Location"],
    servicesIncluded: ["GST Registration", "Business Address", "Mail Handling", "Reception Support", "Meeting Room Credits"],
    durations: ["Monthly", "Quarterly", "Half Yearly", "Yearly"],
    metroConnectivity: true,
    premier: true,
    popular: true,
    basePrice: 999,
  },
  {
    brand: "Awfis",
    nameSuffix: "Business Park",
    buildingType: "Coworking",
    popularTags: ["Startup Friendly", "Affordable"],
    servicesIncluded: ["GST Registration", "Business Address", "Mail Handling"],
    durations: ["Monthly", "Quarterly", "Yearly"],
    metroConnectivity: false,
    premier: false,
    popular: false,
    basePrice: 799,
  },
  {
    brand: "Smartworks",
    nameSuffix: "Tech Park",
    buildingType: "Commercial Tower",
    popularTags: ["GST Approved", "Best Seller"],
    servicesIncluded: ["GST Registration", "Business Address", "Company Registration", "Mail Handling", "Call Answering"],
    durations: ["Monthly", "Quarterly", "Half Yearly", "Yearly"],
    metroConnectivity: true,
    premier: false,
    popular: true,
    basePrice: 899,
  },
  {
    brand: "IndiQube",
    nameSuffix: "Orion",
    buildingType: "Business Center",
    popularTags: ["Startup Friendly", "Affordable", "GST Approved"],
    servicesIncluded: ["GST Registration", "Business Address", "Mail Handling", "Courier Handling"],
    durations: ["Monthly", "Quarterly", "Yearly"],
    metroConnectivity: false,
    premier: false,
    popular: false,
    basePrice: 849,
  },
  {
    brand: "Regus",
    nameSuffix: "One International Center",
    buildingType: "Premium Business Hub",
    popularTags: ["Premium Location", "Best Seller", "GST Approved"],
    servicesIncluded: [
      "GST Registration",
      "Business Address",
      "Company Registration",
      "Mail Handling",
      "Courier Handling",
      "Reception Support",
      "Meeting Room Credits",
      "Call Answering",
    ],
    durations: ["Monthly", "Quarterly", "Half Yearly", "Yearly"],
    metroConnectivity: true,
    premier: true,
    popular: true,
    basePrice: 1299,
  },
  {
    brand: "CorporatEdge",
    nameSuffix: "Forum Square",
    buildingType: "Commercial Tower",
    popularTags: ["GST Approved", "Premium Location"],
    servicesIncluded: ["GST Registration", "Business Address", "Company Registration", "Reception Support"],
    durations: ["Monthly", "Quarterly", "Half Yearly", "Yearly"],
    metroConnectivity: true,
    premier: false,
    popular: false,
    basePrice: 1099,
  },
  {
    brand: "WeWork",
    nameSuffix: "Zenia",
    buildingType: "Coworking",
    popularTags: ["Most Popular", "Startup Friendly"],
    servicesIncluded: ["GST Registration", "Business Address", "Mail Handling", "Meeting Room Credits"],
    durations: ["Monthly", "Quarterly", "Yearly"],
    metroConnectivity: false,
    premier: false,
    popular: true,
    basePrice: 949,
  },
  {
    brand: "Awfis",
    nameSuffix: "Supreme Business Park",
    buildingType: "Business Center",
    popularTags: ["Affordable", "Startup Friendly"],
    servicesIncluded: ["GST Registration", "Business Address"],
    durations: ["Monthly", "Quarterly"],
    metroConnectivity: false,
    premier: false,
    popular: false,
    basePrice: 699,
  },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildPlans(basePrice: number): { plans: VOPlan[]; bestPrice: number } {
  const plans: VOPlan[] = [
    {
      key: "virtual-office",
      name: "Virtual Office",
      price: Math.round(basePrice / 10) * 10,
      description: "Registered business address for your company",
    },
    {
      key: "gst-registration",
      name: "GST Registration",
      price: Math.round((basePrice * 1.5) / 10) * 10,
      description: "Business address + GST registration support",
    },
    {
      key: "business-address-gst",
      name: "Business Address + GST",
      price: Math.round((basePrice * 2.5) / 10) * 10,
      description: "Everything in GST plan plus mail & courier handling",
    },
    {
      key: "premium-package",
      name: "Premium Package",
      price: Math.round((basePrice * 4) / 10) * 10,
      description: "Full service package with reception & meeting credits",
    },
  ];
  return { plans, bestPrice: plans[0].price };
}

function buildListings(): VirtualOfficeListing[] {
  const listings: VirtualOfficeListing[] = [];
  let seed = 1;

  Object.keys(CITY_NAMES).forEach((city) => {
    const localities = cityToLocalities[city];
    templates.forEach((template, index) => {
      seed += 1;
      const r1 = seededRandom(seed);
      const r2 = seededRandom(seed * 2.13);
      const r3 = seededRandom(seed * 3.7);

      const area = localities[index % localities.length];
      const priceVariance = Math.round(r2 * 150);
      const { plans, bestPrice } = buildPlans(template.basePrice + priceVariance);
      const rating = Math.round((3.8 + r1 * 1.1) * 10) / 10;
      const reviews = Math.round(20 + r2 * 300);

      listings.push({
        id: `${city}-${template.brand.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        city,
        brand: template.brand,
        centerName: `${template.brand} - ${template.nameSuffix}`,
        area,
        buildingType: template.buildingType,
        address: `${template.nameSuffix}, ${area}, ${city.charAt(0).toUpperCase()}${city.slice(1)}`,
        rating,
        reviews,
        popularTags: template.popularTags,
        servicesIncluded: template.servicesIncluded,
        durations: template.durations,
        metroConnectivity: template.metroConnectivity,
        businessAddressAvailable: true,
        gstEligible: template.servicesIncluded.includes("GST Registration"),
        premier: template.premier,
        popular: template.popular,
        plans,
        bestPrice,
        images: [
          images[(index * 2) % images.length],
          images[(index * 2 + 1) % images.length],
          images[(index * 2 + 2) % images.length],
        ],
      });
      void r3;
    });
  });

  return listings;
}

export const virtualOfficeListings: VirtualOfficeListing[] = buildListings();
