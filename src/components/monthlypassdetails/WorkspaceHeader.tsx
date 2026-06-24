import { BadgeCheck, MapPin, Star, Train } from "lucide-react";
import type { MonthlyPassListing } from "../../data/monthlyPassListings";

interface WorkspaceHeaderProps {
  listing: MonthlyPassListing;
  badges: string[];
  cityName: string;
}

export default function WorkspaceHeader({ listing, badges, cityName }: WorkspaceHeaderProps) {
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#2563EB]"
          >
            <BadgeCheck size={12} />
            {badge}
          </span>
        ))}
      </div>

      <h1 className="mt-2 text-2xl font-extrabold text-[#0F172A] sm:text-[32px]">{listing.name}</h1>
      <p className="mt-1 text-sm font-semibold text-[#64748B]">{listing.brand}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[#64748B]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          {listing.locality}, {cityName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Train size={14} />
          {listing.distanceKm} km from Metro
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-[#0F172A]">
          <Star size={14} className="fill-[#FBBF24] text-[#FBBF24]" />
          {listing.rating.toFixed(2)}
        </span>
        <span>({listing.reviews.toLocaleString()} Reviews)</span>
      </div>
    </div>
  );
}
