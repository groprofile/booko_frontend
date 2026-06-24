import { slugify } from "./slug";
import { CURRENT_LOCATION } from "../components/LocationField";

const CITY_SYNONYMS: Record<string, string> = {
  bengaluru: "bangalore",
  "delhi-ncr": "delhi",
};

export const DEFAULT_CITY_SLUG = "mumbai";

export function citySlugFromLabel(label: string | null): string {
  if (!label || label === CURRENT_LOCATION) return DEFAULT_CITY_SLUG;
  const slug = slugify(label);
  return CITY_SYNONYMS[slug] ?? slug;
}
