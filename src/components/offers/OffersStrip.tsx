import { useActiveOffers } from "../../hooks/useActiveOffers";
import { offersForVertical, type Vertical } from "../../lib/offers";
import OfferCard from "./OfferCard";

/**
 * Slim, contextual offers strip for the top of a listing page — shows only the
 * offers that apply to that vertical. Renders nothing when there are none.
 */
export default function OffersStrip({ vertical }: { vertical: Vertical }) {
  // Banner surfaces show only image-bearing offers (the image is the banner).
  const offers = offersForVertical(useActiveOffers(), vertical).filter((o) => o.image_url);
  if (offers.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-sm font-bold text-primary-text">Offers for you</span>
        <span className="text-xs text-muted-text">· applied automatically at checkout</span>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
