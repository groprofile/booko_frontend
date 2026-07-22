import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Star } from "lucide-react";
import type { CoworkingSpace } from "../../data/coworkingSpaces";
import RecommendedBadge from "../RecommendedBadge";
import ListingCardShell from "../common/ListingCardShell";
import { OfferPriceBlock } from "../common/OfferPrice";

interface WorkspaceCardProps {
  space: CoworkingSpace;
  layout?: "row" | "grid";
}

const primaryCtaLabels: Record<string, string> = {
  dayPass: "View Day Pass",
  meetingRoom: "View Meeting Rooms",
  monthlyPass: "View Monthly Pass",
  virtualOffice: "View Virtual Office",
};

export default function WorkspaceCard({ space, layout = "row" }: WorkspaceCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = space.images?.length ? space.images : [space.image];
  const primaryService = space.services.find((service) => primaryCtaLabels[service.key]) ?? space.services[0];
  const href = primaryService?.href ?? "#";
  const amenityTags = [
    space.metroConnectivity ? "Metro Connectivity" : null,
    space.parking ? "Parking" : null,
    space.access247 ? "24x7 Access" : null,
    space.gstCompliant ? "GST Compliant" : null,
  ].filter((v): v is string => Boolean(v));

  const showPrev = () => setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <ListingCardShell
      href={href}
      images={images}
      name={space.name}
      imageIndex={imageIndex}
      onPrevImage={showPrev}
      onNextImage={showNext}
      topLeftBadge={space.isFeatured ? <RecommendedBadge size="sm" /> : undefined}
      topRightBadge={
        space.premium ? (
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-primary-blue shadow-soft">Premium</span>
        ) : undefined
      }
      ratingBadge={
        Number(space.rating ?? 0) > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-sm bg-[#0F172A] px-2 py-1 text-[11px] font-bold text-white">
            <Star size={11} strokeWidth={1.75} className="fill-[#FBBF24] text-[#FBBF24]" />
            {Number(space.rating).toFixed(1)}
            {Number(space.reviews ?? 0) > 0 ? ` (${Number(space.reviews).toLocaleString()})` : ""}
          </span>
        ) : undefined
      }
      extraBadges={
        space.gstCompliant ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-success">
            <ShieldCheck size={11} strokeWidth={1.75} />
            GST Ready
          </span>
        ) : undefined
      }
      title={space.name}
      subtitle={space.brand !== space.name ? space.brand : undefined}
      locality={space.locality}
      distanceKm={space.distanceKm}
      tags={amenityTags}
      layout={layout}
      priceBlock={<OfferPriceBlock vertical="coworking" price={space.startingPrice} centerId={space.id} unit="starting" />}
      actions={
        <Link
          to={href}
          className="rounded-sm bg-[#111111] px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition-colors hover:bg-black"
        >
          {primaryService ? (primaryCtaLabels[primaryService.key] ?? "Explore") : "Explore"}
        </Link>
      }
    />
  );
}
