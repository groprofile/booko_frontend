import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import type { MonthlyPassListing } from "../../data/monthlyPassListings";
import { CITY_NAMES } from "../../data/dayPassListings";
import { apiGet } from "../../lib/api";
import { apiToMonthlyPassDetails, type CentreApiRow } from "../../lib/centreAdapter";
import RecommendedBadge from "../RecommendedBadge";
import ListingCardShell from "../common/ListingCardShell";
import { OfferPriceBlock } from "../common/OfferPrice";

interface MonthlyPassListingCardProps {
  listing: MonthlyPassListing;
  layout?: "row" | "grid";
}

function cityLabel(slug: string) {
  return CITY_NAMES[slug] ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function MonthlyPassListingCard({ listing, layout = "row" }: MonthlyPassListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams<{ city: string }>();
  const citySlug = params.city ?? listing.city;
  const cityName = cityLabel(citySlug);
  const href = `/monthly-pass/${listing.id}`;

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  async function handleBookNow() {
    setBookingLoading(true);
    try {
      const raw = await apiGet<CentreApiRow>(`/centers/${listing.id}`);
      const details = apiToMonthlyPassDetails(raw);
      navigate("/checkout", {
        state: {
          productType: "monthly-pass" as const,
          listingId: listing.id,
          workspaceName: listing.name,
          brand: listing.brand,
          citySlug,
          cityName,
          locality: listing.locality,
          image: listing.images[0],
          rating: listing.rating,
          reviews: listing.reviews,
          membershipTypes: details.membershipTypes,
          selectedMembershipKey: details.membershipTypes[1]?.key ?? details.membershipTypes[0].key,
          billingKey: "monthly" as const,
          seats: 1,
        },
      });
    } catch {
      alert("Couldn't load this workspace right now. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <ListingCardShell
      href={href}
      images={listing.images}
      name={listing.name}
      imageIndex={imageIndex}
      onPrevImage={showPrev}
      onNextImage={showNext}
      topLeftBadge={listing.isFeatured ? <RecommendedBadge size="sm" /> : undefined}
      topRightBadge={
        listing.popular ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#F97316] shadow-soft">
            <Star size={11} strokeWidth={1.75} className="fill-[#F97316] text-[#F97316]" />
            Popular
          </span>
        ) : undefined
      }
      ratingBadge={
        listing.rating > 0 ? (
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-text">
            <Star size={13} strokeWidth={1.75} className="fill-[#FBBF24] text-[#FBBF24]" />
            {listing.rating.toFixed(2)}
          </span>
        ) : undefined
      }
      extraBadges={
        listing.premier ? (
          <span className="rounded-sm bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary-blue">Premier</span>
        ) : undefined
      }
      title={listing.name}
      subtitle={`${listing.lockIn} lock-in`}
      locality={listing.locality}
      distanceKm={listing.distanceKm}
      tags={listing.seatingTypes}
      layout={layout}
      priceBlock={<OfferPriceBlock vertical="monthly-pass" price={listing.bestPrice} centerId={listing.id} unit="/seat/mo" />}
      actions={
        <button
          type="button"
          onClick={handleBookNow}
          disabled={bookingLoading}
          className="rounded-sm bg-[#111111] px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bookingLoading ? "…" : "Book Now"}
        </button>
      }
    />
  );
}
