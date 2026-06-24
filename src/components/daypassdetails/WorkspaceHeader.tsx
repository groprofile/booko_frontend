import { Clock, MapPin, ShieldCheck, Star, Train } from "lucide-react";
import type { DayPassListing } from "../../data/dayPassListings";

interface WorkspaceHeaderProps {
  listing: DayPassListing;
  cityName: string;
}

function formatTime(time: string) {
  const [hourStr, minute] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

export default function WorkspaceHeader({ listing, cityName }: WorkspaceHeaderProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {listing.premier && (
          <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB]">
            Premier
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-md bg-[#FFFBEB] px-2.5 py-1 text-xs font-bold text-[#B45309]">
          <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
          {listing.rating.toFixed(2)} ({listing.reviews.toLocaleString()} Brand Reviews)
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF5] px-2.5 py-1 text-xs font-bold text-[#16A34A]">
          <ShieldCheck size={13} />
          Verified Workspace
        </span>
      </div>

      <h1 className="mt-3 text-[28px] font-extrabold tracking-tight text-[#0F172A] sm:text-[36px] lg:text-[42px]">
        {listing.name}
      </h1>
      <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">
        {listing.spaceType}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#64748B]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={15} className="shrink-0" />
          {listing.locality}, {cityName} · {listing.distanceKm} Kms away
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={15} className="shrink-0" />
          {formatTime(listing.openTime)} - {formatTime(listing.closeTime)} (Mon)
        </span>
        {listing.accessibility.includes("Metro Connectivity") && (
          <span className="inline-flex items-center gap-1.5">
            <Train size={15} className="shrink-0" />
            Metro Connectivity
          </span>
        )}
      </div>
    </div>
  );
}
