import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Star } from "lucide-react";
import type { DayPassListing } from "../../data/dayPassListings";
import SectionLabel from "./SectionLabel";

interface SimilarWorkspacesSectionProps {
  current: DayPassListing;
  cityName: string;
  citySlug: string;
  allListings: DayPassListing[];
}

type Tab = "nearby" | "city";

export default function SimilarWorkspacesSection({
  current,
  cityName,
  citySlug,
  allListings,
}: SimilarWorkspacesSectionProps) {
  const [tab, setTab] = useState<Tab>("nearby");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const candidates = useMemo(() => {
    const others = allListings.filter((listing) => listing.id !== current.id);
    if (tab === "nearby") {
      return [...others].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 8);
    }
    return others.slice(0, 8);
  }, [allListings, current.id, tab]);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section>
      <SectionLabel
        title="Explore Day Pass in Similar Workspaces"
        action={
          <button
            type="button"
            onClick={() => scrollByAmount(320)}
            aria-label="Scroll right"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#334155] shadow-soft hover:border-[#94A3B8] sm:flex"
          >
            <ChevronRight size={18} />
          </button>
        }
      />

      <div className="mb-4 flex border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setTab("nearby")}
          className={
            "border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors " +
            (tab === "nearby" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#64748B]")
          }
        >
          Spaces Nearby
        </button>
        <button
          type="button"
          onClick={() => setTab("city")}
          className={
            "border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors " +
            (tab === "city" ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#64748B]")
          }
        >
          Spaces in {cityName}
        </button>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {candidates.map((listing) => (
          <div
            key={listing.id}
            className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-soft"
          >
            <div className="h-[140px] w-full overflow-hidden">
              <img src={listing.images[0]} alt={listing.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-sm font-bold text-[#0F172A] line-clamp-1">{listing.name}</p>
              <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
                {listing.seatingTypes[0]}
              </span>
              <p className="mt-2 flex items-center gap-1 text-xs text-[#64748B]">
                <MapPin size={12} />
                {listing.locality}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                <Star size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
                {listing.rating.toFixed(2)}
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#0F172A]">{listing.bestPrice}</span>
                <span className="text-xs text-[#94A3B8] line-through">{listing.price}</span>
              </div>
              <Link
                to={`/${citySlug}/day-pass/${listing.id}`}
                className="mt-3 text-sm font-semibold text-[#2563EB] hover:underline"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
