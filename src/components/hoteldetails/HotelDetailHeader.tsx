import { MapPin, Plane, Star, TrainFront } from "lucide-react";
import type { HotelListing } from "../../data/hotelListings";
import type { HotelDetails } from "../../data/hotelDetails";

interface HotelDetailHeaderProps {
  listing: HotelListing;
  details: HotelDetails;
  cityName: string;
}

const badgeStyles: Record<string, string> = {
  Premium: "bg-[#EFF6FF] text-[#2563EB]",
  Luxury: "bg-[#F5F3FF] text-[#7C3AED]",
  "Best Seller": "bg-[#FFFBEB] text-[#B45309]",
  "Top Rated": "bg-[#ECFDF5] text-[#16A34A]",
};

export default function HotelDetailHeader({ listing, details, cityName }: HotelDetailHeaderProps) {
  const allBadges = [
    ...listing.badges,
    ...(listing.stayTypes.includes("Business Hotel") ? ["Business Friendly"] : []),
    ...listing.popularTags.filter((tag) => tag === "Couple Friendly"),
    ...listing.trustSignals.filter((s) => s === "Accepts Local ID"),
    "Instant Confirmation",
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-[#0F172A] px-2.5 py-1 text-xs font-bold text-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.round(listing.rating) ? "fill-[#FBBF24] text-[#FBBF24]" : "fill-white/20 text-white/20"}
            />
          ))}
          <span className="ml-1">{listing.rating.toFixed(1)} ({listing.reviews} reviews)</span>
        </span>
        {allBadges.map((badge) => (
          <span
            key={badge}
            className={"rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide " + (badgeStyles[badge] ?? "bg-[#F1F5F9] text-[#475569]")}
          >
            {badge}
          </span>
        ))}
      </div>

      <h1 className="mt-3 text-[28px] font-extrabold tracking-tight text-[#0F172A] sm:text-[36px] lg:text-[42px]">
        {listing.name}
      </h1>
      <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">{details.propertyType}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#64748B]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={15} className="shrink-0" />
          {listing.locality}, {cityName} · {listing.distanceKm} Kms away
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Plane size={15} className="shrink-0" />
          {details.distanceAirportKm} Kms from Airport
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TrainFront size={15} className="shrink-0" />
          {details.distanceMetroKm} Kms from Metro
        </span>
      </div>
    </div>
  );
}
