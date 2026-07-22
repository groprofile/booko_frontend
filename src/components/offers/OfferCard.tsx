import type { ActiveOffer } from "../../lib/offers";

/**
 * Offer banner — shows the actual admin-uploaded banner image, edge to edge,
 * with nothing overlaid (the marketing image already contains all the copy).
 * Offers without an image are not rendered as banners (they still appear in the
 * checkout coupon list). `width` picks a fixed strip card vs a responsive grid tile.
 */
export default function OfferCard({ offer, width = "fixed" }: { offer: ActiveOffer; width?: "fixed" | "full" }) {
  if (!offer.image_url) return null;
  return (
    <div
      className={
        "relative shrink-0 snap-start overflow-hidden rounded-2xl shadow-soft " +
        (width === "fixed" ? "aspect-[16/7] w-[320px]" : "aspect-[16/7] w-full")
      }
    >
      <img src={offer.image_url} alt={offer.description ?? "Offer"} className="h-full w-full object-cover" />
    </div>
  );
}
