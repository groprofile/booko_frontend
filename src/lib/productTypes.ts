// Single source of truth for the bookable product-type model shared by the
// vendor dashboard (Rooms & Pricing) and vendor onboarding (Services & Pricing).
// Mirrors the backend's CATEGORY_PRODUCT_TYPES (create-membership-plan.dto.ts).

export type ProductType =
  | "hotel_room"
  | "coworking_day_pass"
  | "coworking_monthly_pass"
  | "coworking_meeting_room"
  | "gym_slot"
  | "turf_slot";

export const PRODUCT_META: Record<ProductType, { label: string; unit: string; slotBased: boolean }> = {
  hotel_room:             { label: "Hotel Room",   unit: "night", slotBased: false },
  coworking_day_pass:     { label: "Day Pass",     unit: "day",   slotBased: false },
  coworking_monthly_pass: { label: "Monthly Pass", unit: "month", slotBased: false },
  coworking_meeting_room: { label: "Meeting Room", unit: "hour",  slotBased: true },
  gym_slot:               { label: "Gym Session",  unit: "slot",  slotBased: true },
  turf_slot:              { label: "Turf Slot",    unit: "hour",  slotBased: true },
};

// Which product types a center may offer, derived from its category name.
export function typesForCategory(name?: string): ProductType[] {
  const n = (name ?? "").toLowerCase();
  if (n.includes("hotel") || n.includes("stay")) return ["hotel_room"];
  if (n.includes("work") || n.includes("desk") || n.includes("coworking"))
    return ["coworking_day_pass", "coworking_monthly_pass", "coworking_meeting_room"];
  if (n.includes("gym")) return ["gym_slot"];
  if (n.includes("turf")) return ["turf_slot"];
  return Object.keys(PRODUCT_META) as ProductType[];
}

// Is this plan booked via time-slots? (meeting room / gym / turf, or hotel day-use)
export function isSlotBased(p: { product_type: ProductType; plan_type?: string | null }): boolean {
  if (PRODUCT_META[p.product_type]?.slotBased) return true;
  return p.product_type === "hotel_room" && p.plan_type === "hourly";
}
