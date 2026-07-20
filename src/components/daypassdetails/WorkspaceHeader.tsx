import { Clock, MapPin, ShieldCheck, Star, Train } from "lucide-react";
import type { DayPassListing } from "../../data/dayPassListings";
import RecommendedBadge from "../RecommendedBadge";

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

// Minutes-since-midnight for an "HH:MM" string, or null if unparseable.
function toMinutes(time: string): number | null {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

// Real open/closed status from the center's timings vs. the viewer's clock —
// replaces the hardcoded `openNow: false` that listing cards carry. Handles
// overnight windows (close < open, e.g. 24x7-ish or late-night centers).
function isOpenNow(openTime: string, closeTime: string): boolean {
  const open = toMinutes(openTime);
  const close = toMinutes(closeTime);
  if (open === null || close === null) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  if (close <= open) return cur >= open || cur < close; // wraps past midnight
  return cur >= open && cur < close;
}

export default function WorkspaceHeader({ listing, cityName }: WorkspaceHeaderProps) {
  const openNow = isOpenNow(listing.openTime, listing.closeTime);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {listing.isFeatured && <RecommendedBadge size="sm" />}
        {listing.premier && (
          <span className="rounded-sm bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB]">
            Premier
          </span>
        )}
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-bold " +
            (openNow ? "bg-[#ECFDF5] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]")
          }
        >
          <span className={"h-1.5 w-1.5 rounded-full " + (openNow ? "bg-[#16A34A]" : "bg-[#DC2626]")} />
          {openNow ? "Open now" : "Closed"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-sm bg-[#FFFBEB] px-2.5 py-1 text-xs font-bold text-[#B45309]">
          <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
          {listing.rating.toFixed(2)} ({listing.reviews.toLocaleString()} Brand Reviews)
        </span>
        <span className="inline-flex items-center gap-1 rounded-sm bg-[#ECFDF5] px-2.5 py-1 text-xs font-bold text-[#16A34A]">
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
