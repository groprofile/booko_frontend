import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { HotelListing } from "../../data/hotelListings";
import ListingCardShell from "../common/ListingCardShell";
import { OfferBadge, OfferPriceBlock } from "../common/OfferPrice";

interface HotelListingCardProps {
  listing: HotelListing;
  layout?: "row" | "grid";
}

const badgeStyles: Record<string, string> = {
  Premium: "bg-blue-50 text-primary-blue",
  Luxury: "bg-[#F5F3FF] text-[#7C3AED]",
  "Best Seller": "bg-[#FFFBEB] text-[#B45309]",
  "Top Rated": "bg-[#ECFDF5] text-[#16A34A]",
};

export default function HotelListingCard({ listing, layout = "row" }: HotelListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const href = `/hotels/${listing.id}`;

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  return (
    <ListingCardShell
      href={href}
      images={listing.images}
      name={listing.name}
      imageIndex={imageIndex}
      onPrevImage={showPrev}
      onNextImage={showNext}
      topLeftBadge={<OfferBadge vertical="hotel" price={listing.bestPrice} centerId={listing.id} />}
      ratingBadge={
        listing.rating > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-sm bg-[#0F172A] px-2 py-1 text-[11px] font-bold text-white">
            <Star size={11} strokeWidth={1.75} className="fill-[#FBBF24] text-[#FBBF24]" />
            {listing.rating.toFixed(1)}
            {listing.reviews > 0 ? ` (${listing.reviews})` : ""}
          </span>
        ) : undefined
      }
      extraBadges={listing.badges.slice(0, 1).map((badge) => (
        <span
          key={badge}
          className={"rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide " + (badgeStyles[badge] ?? "bg-bg text-secondary-text")}
        >
          {badge}
        </span>
      ))}
      title={listing.name}
      subtitle={listing.category}
      locality={listing.locality}
      distanceKm={listing.distanceKm}
      tags={listing.amenities}
      layout={layout}
      priceBlock={<OfferPriceBlock vertical="hotel" price={listing.bestPrice} centerId={listing.id} unit="/night" />}
      actions={
        <Link
          to={href}
          className="rounded-sm bg-[#111111] px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition-colors hover:bg-black"
        >
          Book Now
        </Link>
      }
    />
  );
}
