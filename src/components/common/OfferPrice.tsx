import { useActiveOffers } from "../../hooks/useActiveOffers";
import { bestOfferForListing, type AppliedOffer, type Vertical } from "../../lib/offers";

/** Resolves the best active offer for a listing (cached, shared fetch). */
export function useListingOffer(
  vertical: Vertical,
  price: number,
  centerId?: string,
): AppliedOffer | null {
  const offers = useActiveOffers();
  return bestOfferForListing(offers, vertical, price, centerId);
}

interface OfferPriceBlockProps {
  vertical: Vertical;
  price: number;
  centerId?: string;
  /** e.g. "/night", "/day", "/hr". */
  unit?: string;
}

/**
 * Price block that shows the struck-through original + discounted price when an
 * offer applies, otherwise the plain price — the professional booking-app pattern.
 */
export function OfferPriceBlock({ vertical, price, centerId, unit }: OfferPriceBlockProps) {
  const applied = useListingOffer(vertical, price, centerId);
  const unitEl = unit ? <span className="text-[10px] font-medium text-muted-text"> {unit}</span> : null;

  if (!applied) {
    return (
      <p className="text-sm font-extrabold leading-none text-primary-text">
        ₹{price.toLocaleString()}
        {unitEl}
      </p>
    );
  }

  return (
    <div className="leading-none">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-extrabold text-primary-text">
          ₹{applied.finalRupees.toLocaleString()}
          {unitEl}
        </p>
        <span className="text-[10px] font-semibold text-[#94A3B8] line-through">
          ₹{price.toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-[10px] font-bold text-success">
        {applied.percentOff}% OFF · applied at checkout
      </p>
    </div>
  );
}

/** A "% OFF" corner badge for the card image (pass to ListingCardShell topLeftBadge). */
export function OfferBadge({ vertical, price, centerId }: OfferPriceBlockProps) {
  const applied = useListingOffer(vertical, price, centerId);
  if (!applied) return null;
  return (
    <span className="rounded-sm bg-success px-2 py-0.5 text-[11px] font-bold text-white shadow-soft">
      {applied.percentOff}% OFF
    </span>
  );
}
