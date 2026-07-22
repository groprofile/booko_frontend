// Customer-facing offers. One `coupons` row is an "offer": it auto-applies the
// best eligible discount at checkout, and here it also drives the home rail and
// the struck-through "% OFF" prices on listing/detail cards. Codes are never
// shown to customers — the discount just appears.

export type DiscountType = "PERCENT" | "FLAT";
export type ScopeType = "GLOBAL" | "CATEGORY" | "CENTER";

export interface ActiveOffer {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  image_url: string | null;
  valid_to: string | null;
  scope_type: ScopeType;
  category_id: string | null;
  center_id: string | null;
  scope_label: string | null;
  terms?: string | null;
  priority?: number;
  // Eligibility fields the client CAN check without knowing who's signed in —
  // used to avoid showing a discount that would silently fail to apply at
  // checkout. user_segment/per_user_limit require the current user's booking
  // history, which this anonymous feed doesn't have, so those are enforced
  // only server-side (at quote/booking time), not filtered here.
  min_booking_paise?: number;
  max_discount_paise?: number | null;
  usage_limit?: number | null;
  used_count?: number;
}

// One row of the checkout "Coupons & Offers" list — computed by the backend for
// the exact booking amount (see the /bookings/quote `availableCoupons` field).
export interface AvailableCoupon {
  couponId: string;
  code: string;
  headline: string;
  description: string | null;
  terms: string | null;
  imageUrl: string | null;
  scopeLabel: string | null;
  discountRupees: number;
  eligible: boolean;
  reason: string | null;
  best: boolean;
}

// Each listing page is one vertical. A CATEGORY offer is matched to a vertical
// by keyword against its scope_label (the category name), so we don't need the
// listing to carry a category_id.
export type Vertical =
  | "hotel"
  | "coworking"
  | "day-pass"
  | "monthly-pass"
  | "meeting-room"
  | "virtual-office"
  | "gym"
  | "turf";

const VERTICAL_KEYWORDS: Record<Vertical, string[]> = {
  hotel: ["hotel"],
  coworking: ["cowork", "day pass", "desk"],
  "day-pass": ["cowork", "day"],
  "monthly-pass": ["cowork", "month"],
  "meeting-room": ["meeting", "cowork"],
  "virtual-office": ["virtual", "cowork"],
  gym: ["gym", "fitness"],
  turf: ["turf", "sport", "ground"],
};

/** The listing/hub route an offer should deep-link to. */
export function offerHref(offer: ActiveOffer): string {
  const label = (offer.scope_label ?? "").toLowerCase();
  if (offer.scope_type === "CATEGORY") {
    if (label.includes("hotel")) return "/hotels";
    if (label.includes("meeting")) return "/meeting-rooms";
    if (label.includes("month")) return "/monthly-pass";
    if (label.includes("virtual")) return "/virtual-office";
    if (label.includes("day")) return "/day-pass";
    if (label.includes("cowork")) return "/coworking-spaces";
  }
  // GLOBAL / CENTER (vertical of a specific centre isn't known here): send to
  // the most common bookable hub.
  return "/hotels";
}

export function offerBadgeLabel(offer: ActiveOffer): string {
  return offer.discount_type === "PERCENT"
    ? `${offer.discount_value}% OFF`
    : `₹${offer.discount_value} OFF`;
}

export function offerHeadline(offer: ActiveOffer): string {
  return offer.discount_type === "PERCENT"
    ? `${offer.discount_value}% OFF`
    : `Flat ₹${offer.discount_value} OFF`;
}

function offerMatchesListing(offer: ActiveOffer, vertical: Vertical, centerId?: string): boolean {
  if (offer.scope_type === "GLOBAL") return true;
  if (offer.scope_type === "CENTER") return !!centerId && offer.center_id === centerId;
  const label = (offer.scope_label ?? "").toLowerCase();
  return VERTICAL_KEYWORDS[vertical].some((k) => label.includes(k));
}

// The one globally-checkable eligibility rule that isn't price-dependent: a
// coupon with a total redemption cap that's already been fully claimed can
// never apply again, for anyone — showing it as an active discount would
// always silently fail at checkout.
function offerUsageAvailable(offer: ActiveOffer): boolean {
  if (offer.usage_limit == null) return true;
  return (offer.used_count ?? 0) < offer.usage_limit;
}

/** Offers relevant to a vertical's listing page (GLOBAL + matching category). */
export function offersForVertical(offers: ActiveOffer[], vertical: Vertical): ActiveOffer[] {
  return offers
    .filter((o) => o.scope_type === "GLOBAL" || (o.scope_type === "CATEGORY" && offerMatchesListing(o, vertical)))
    .filter(offerUsageAvailable);
}

/** Offers a customer could apply to this specific booking (GLOBAL + category + this centre). */
export function offersForCheckout(
  offers: ActiveOffer[],
  vertical: Vertical,
  centerId?: string,
): ActiveOffer[] {
  return offers.filter((o) => offerMatchesListing(o, vertical, centerId) && offerUsageAvailable(o));
}

// Mirrors the backend's computeDiscountPaise (coupons.service.ts): PERCENT
// discounts respect max_discount_paise, and neither type can exceed the price
// itself. Getting this wrong is exactly how a card can show a bigger "% OFF"
// than what actually gets deducted at payment.
function discountRupees(offer: ActiveOffer, priceRupees: number): number {
  if (offer.discount_type === "PERCENT") {
    let amt = Math.round((priceRupees * offer.discount_value) / 100);
    const capRupees = offer.max_discount_paise != null ? offer.max_discount_paise / 100 : null;
    if (capRupees != null && amt > capRupees) amt = capRupees;
    return Math.min(amt, priceRupees);
  }
  return Math.min(offer.discount_value, priceRupees);
}

export interface AppliedOffer {
  offer: ActiveOffer;
  discountRupees: number;
  finalRupees: number;
  /** Rounded percent for a "% OFF" badge, even for FLAT offers. */
  percentOff: number;
}

/**
 * The best offer that applies to a given listing at a given price — the same
 * "largest discount wins" rule the backend uses to auto-apply at checkout.
 * Returns null when nothing applies (so cards render their normal price).
 */
export function bestOfferForListing(
  offers: ActiveOffer[],
  vertical: Vertical,
  priceRupees: number,
  centerId?: string,
): AppliedOffer | null {
  if (!priceRupees || priceRupees <= 0) return null;
  let best: AppliedOffer | null = null;
  for (const offer of offers) {
    if (!offerMatchesListing(offer, vertical, centerId)) continue;
    if (!offerUsageAvailable(offer)) continue;
    // The backend rejects a coupon below its minimum order value (see
    // evaluateCoupon's "Add ₹X more to use this coupon") — must match here too,
    // or the badge advertises a discount this exact booking can't actually get.
    const minRupees = (offer.min_booking_paise ?? 0) / 100;
    if (priceRupees < minRupees) continue;
    const amt = discountRupees(offer, priceRupees);
    if (amt <= 0) continue;
    if (!best || amt > best.discountRupees) {
      best = {
        offer,
        discountRupees: amt,
        finalRupees: Math.max(0, priceRupees - amt),
        percentOff: Math.round((amt / priceRupees) * 100),
      };
    }
  }
  return best;
}
