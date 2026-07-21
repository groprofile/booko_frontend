import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, Star } from "lucide-react";
import type { VirtualOfficeListing } from "../../data/virtualOfficeListings";
import { CITY_NAMES } from "../../data/dayPassListings";
import RecommendedBadge from "../RecommendedBadge";
import ListingCardShell from "../common/ListingCardShell";

interface VirtualOfficeListingCardProps {
  listing: VirtualOfficeListing;
  layout?: "row" | "grid";
}

function cityLabel(slug: string) {
  return CITY_NAMES[slug] ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function VirtualOfficeListingCard({ listing, layout = "row" }: VirtualOfficeListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();
  const params = useParams<{ city: string }>();
  const citySlug = params.city ?? listing.city;
  const cityName = cityLabel(citySlug);
  const href = `/virtual-office/${listing.id}`;
  const startingPlan = listing.plans[0];

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  function handleBookNow() {
    navigate("/checkout", {
      state: {
        productType: "virtual-office" as const,
        listingId: listing.id,
        centerName: listing.centerName,
        brand: listing.brand,
        citySlug,
        cityName,
        area: listing.area,
        address: listing.address,
        image: listing.images[0],
        rating: listing.rating,
        reviews: listing.reviews,
        gstEligible: listing.gstEligible,
        businessAddressAvailable: listing.businessAddressAvailable,
        servicesIncluded: listing.servicesIncluded,
        plans: listing.plans,
        selectedPlanKey: startingPlan.key,
        billingKey: "monthly" as const,
      },
    });
  }

  return (
    <ListingCardShell
      href={href}
      images={listing.images}
      name={listing.centerName}
      imageIndex={imageIndex}
      onPrevImage={showPrev}
      onNextImage={showNext}
      topLeftBadge={listing.isFeatured ? <RecommendedBadge size="sm" /> : undefined}
      topRightBadge={
        listing.premier ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-primary-blue shadow-soft">
            Premium
          </span>
        ) : undefined
      }
      ratingBadge={
        listing.rating > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-sm bg-[#0F172A] px-2 py-1 text-[11px] font-bold text-white">
            <Star size={11} strokeWidth={1.75} className="fill-[#FBBF24] text-[#FBBF24]" />
            {listing.rating.toFixed(1)}
            {listing.reviews > 0 ? ` (${listing.reviews})` : ""}
          </span>
        ) : undefined
      }
      extraBadges={
        listing.gstEligible ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-success">
            <ShieldCheck size={11} strokeWidth={1.75} />
            GST Eligible
          </span>
        ) : undefined
      }
      title={listing.centerName}
      subtitle={listing.buildingType}
      locality={listing.area}
      tags={listing.servicesIncluded}
      layout={layout}
      priceBlock={
        <div>
          <p className="text-sm font-extrabold leading-none text-primary-text">
            ₹{startingPlan.price.toLocaleString()}
            <span className="text-[10px] font-medium text-muted-text"> /mo</span>
          </p>
          <p className="text-[10px] font-semibold text-muted-text">Starting price</p>
        </div>
      }
      actions={
        <button
          type="button"
          onClick={handleBookNow}
          className="rounded-sm bg-[#111111] px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition-colors hover:bg-black"
        >
          Book Now
        </button>
      }
    />
  );
}
