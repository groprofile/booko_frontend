// Curated "top metros" catalog — the single source of truth for city search on
// the customer listing screens. We deliberately DON'T derive the city list from
// center data (GET /cities), because a center's `city` is uncontrolled free
// text ("Mumbai", "Thane", "Navi Mumbai" all appear separately). Instead we show
// a fixed set of metros and decide membership by geography (a center's lat/lng
// within the metro's radius — the map approach) with a slug/alias fallback for
// centers that are missing coordinates.
//
// `slug` matches the existing CITY_NAMES keys + the /:city/<product> routes, so
// routing is unchanged. `aliases` are SLUGIFIED sub-city strings (they compare
// against the already-slugified `city` on listing models, e.g. cityToSlug in
// centreAdapter turns "Navi Mumbai" into "navi-mumbai").

export interface Metro {
  slug: string;
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
  aliases: string[];
}

export const METROS: Metro[] = [
  {
    slug: "mumbai",
    label: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    radiusKm: 55,
    aliases: [
      "mumbai", "navi-mumbai", "thane", "thane-west", "kalyan", "dombivli",
      "panvel", "vashi", "mira-road", "mira-bhayandar", "bhiwandi", "kharghar",
      "ulwe", "airoli",
    ],
  },
  {
    slug: "delhi",
    label: "Delhi NCR",
    lat: 28.6139,
    lng: 77.209,
    radiusKm: 60,
    aliases: [
      "delhi", "new-delhi", "delhi-ncr", "ncr", "gurugram", "gurgaon", "noida",
      "greater-noida", "ghaziabad", "faridabad", "sonipat",
    ],
  },
  {
    slug: "bangalore",
    label: "Bangalore",
    lat: 12.9716,
    lng: 77.5946,
    radiusKm: 45,
    aliases: ["bangalore", "bengaluru", "electronic-city", "whitefield", "hosur"],
  },
  {
    slug: "pune",
    label: "Pune",
    lat: 18.5204,
    lng: 73.8567,
    radiusKm: 40,
    aliases: ["pune", "pimpri", "pimpri-chinchwad", "chinchwad", "hinjewadi", "wakad"],
  },
  {
    slug: "hyderabad",
    label: "Hyderabad",
    lat: 17.385,
    lng: 78.4867,
    radiusKm: 45,
    aliases: ["hyderabad", "secunderabad", "gachibowli", "madhapur", "hitech-city"],
  },
  {
    slug: "chennai",
    label: "Chennai",
    lat: 13.0827,
    lng: 80.2707,
    radiusKm: 45,
    aliases: ["chennai", "omr", "tambaram", "sriperumbudur"],
  },
  {
    slug: "kolkata",
    label: "Kolkata",
    lat: 22.5726,
    lng: 88.3639,
    radiusKm: 40,
    aliases: ["kolkata", "calcutta", "salt-lake", "howrah", "new-town"],
  },
  {
    slug: "ahmedabad",
    label: "Ahmedabad",
    lat: 23.0225,
    lng: 72.5714,
    radiusKm: 35,
    aliases: ["ahmedabad", "gandhinagar"],
  },
  {
    slug: "jaipur",
    label: "Jaipur",
    lat: 26.9124,
    lng: 75.7873,
    radiusKm: 30,
    aliases: ["jaipur"],
  },
  {
    slug: "kochi",
    label: "Kochi",
    lat: 9.9312,
    lng: 76.2673,
    radiusKm: 30,
    aliases: ["kochi", "cochin", "ernakulam"],
  },
  {
    slug: "indore",
    label: "Indore",
    lat: 22.7196,
    lng: 75.8577,
    radiusKm: 30,
    aliases: ["indore"],
  },
  {
    slug: "chandigarh",
    label: "Chandigarh",
    lat: 30.7333,
    lng: 76.7794,
    radiusKm: 30,
    aliases: ["chandigarh", "mohali", "panchkula", "tricity"],
  },
  {
    slug: "lucknow",
    label: "Lucknow",
    lat: 26.8467,
    lng: 80.9462,
    radiusKm: 30,
    aliases: ["lucknow"],
  },
  {
    slug: "coimbatore",
    label: "Coimbatore",
    lat: 11.0168,
    lng: 76.9558,
    radiusKm: 30,
    aliases: ["coimbatore"],
  },
  {
    slug: "nagpur",
    label: "Nagpur",
    lat: 21.1458,
    lng: 79.0882,
    radiusKm: 30,
    aliases: ["nagpur"],
  },
  {
    slug: "surat",
    label: "Surat",
    lat: 21.1702,
    lng: 72.8311,
    radiusKm: 30,
    aliases: ["surat"],
  },
  {
    slug: "bhubaneswar",
    label: "Bhubaneswar",
    lat: 20.2961,
    lng: 85.8245,
    radiusKm: 30,
    aliases: ["bhubaneswar", "cuttack"],
  },
  {
    slug: "vadodara",
    label: "Vadodara",
    lat: 22.3072,
    lng: 73.1812,
    radiusKm: 30,
    aliases: ["vadodara", "baroda"],
  },
  {
    slug: "visakhapatnam",
    label: "Visakhapatnam",
    lat: 17.6868,
    lng: 83.2185,
    radiusKm: 30,
    aliases: ["visakhapatnam", "vizag", "vizag-visakhapatnam"],
  },
  {
    slug: "mysore",
    label: "Mysore",
    lat: 12.2958,
    lng: 76.6394,
    radiusKm: 25,
    aliases: ["mysore", "mysuru"],
  },
];

const METRO_BY_SLUG = new Map(METROS.map((m) => [m.slug, m]));

export function metroBySlug(slug: string | null | undefined): Metro | undefined {
  return slug ? METRO_BY_SLUG.get(slug) : undefined;
}

/** Great-circle distance in km (haversine, R=6371). */
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

interface MetroCandidate {
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Does a center belong to a metro? True if it is within the metro's radius
 * (preferred, when coordinates exist) OR its slugified `city` matches the
 * metro's slug/aliases (fallback for coordinate-less centers).
 */
export function centerInMetro(c: MetroCandidate, metro: Metro): boolean {
  if (c.latitude != null && c.longitude != null) {
    if (haversineKm(c.latitude, c.longitude, metro.lat, metro.lng) <= metro.radiusKm) {
      return true;
    }
  }
  const slug = (c.city ?? "").toLowerCase();
  return slug === metro.slug || metro.aliases.includes(slug);
}

/** The nearest metro whose radius contains the point, else null. */
export function nearestMetro(lat: number, lng: number): Metro | null {
  let best: Metro | null = null;
  let bestDist = Infinity;
  for (const m of METROS) {
    const d = haversineKm(lat, lng, m.lat, m.lng);
    if (d <= m.radiusKm && d < bestDist) {
      best = m;
      bestDist = d;
    }
  }
  return best;
}

// Sentinel slug for the "Use my location" option in city selectors.
export const NEAR_ME_SLUG = "__near_me__";
export const NEAR_ME_RADIUS_KM = 30;

// Navigation target for a listing search-bar city <select>:
// "" → national route, NEAR_ME_SLUG → national route with ?near=1 (geolocation),
// a metro slug → /:city/<product>.
export function cityNavTarget(value: string, productPath: string): string {
  if (value === NEAR_ME_SLUG) return `/${productPath}?near=1`;
  if (!value) return `/${productPath}`;
  return `/${value}/${productPath}`;
}
