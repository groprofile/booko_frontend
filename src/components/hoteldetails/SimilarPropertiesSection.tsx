import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Star } from "lucide-react";
import type { HotelListing } from "../../data/hotelListings";
import { slugify } from "../../utils/slug";
import SectionLabel from "./SectionLabel";

interface SimilarPropertiesSectionProps {
  current: HotelListing;
  allListings: HotelListing[];
}

type Tab = "nearby" | "budget" | "luxury" | "hourly";

const tabs: { key: Tab; label: string }[] = [
  { key: "nearby", label: "Nearby Hotels" },
  { key: "budget", label: "Same Budget Hotels" },
  { key: "luxury", label: "Luxury Hotels" },
  { key: "hourly", label: "Hourly Hotels Nearby" },
];

export default function SimilarPropertiesSection({ current, allListings }: SimilarPropertiesSectionProps) {
  const [tab, setTab] = useState<Tab>("nearby");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const candidates = useMemo(() => {
    const others = allListings.filter((listing) => listing.id !== current.id);
    if (tab === "budget") {
      return others
        .filter((listing) => Math.abs(listing.bestPrice - current.bestPrice) <= current.bestPrice * 0.35)
        .slice(0, 8);
    }
    if (tab === "luxury") {
      return others.filter((listing) => listing.category === "Luxury" || listing.category === "Premium").slice(0, 8);
    }
    if (tab === "hourly") {
      return others
        .filter((listing) => listing.stayTypes.includes("Hourly Stay"))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 8);
    }
    return [...others].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 8);
  }, [allListings, current, tab]);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section>
      <SectionLabel
        title="Similar Properties"
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

      <div className="mb-4 flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
        {tabs.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setTab(option.key)}
            className={
              "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors " +
              (tab === option.key ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8]")
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-[#64748B]">No similar properties found in this category.</p>
      ) : (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {candidates.map((listing) => (
            <Link
              key={listing.id}
              to={`/hotels/${slugify(listing.name)}`}
              className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-soft transition-transform hover:-translate-y-1"
            >
              <div className="h-[140px] w-full overflow-hidden">
                <img src={listing.images[0]} alt={listing.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-sm font-bold text-[#0F172A] line-clamp-1">{listing.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                  <MapPin size={12} />
                  {listing.locality}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                  <Star size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
                  {listing.rating.toFixed(1)}
                </p>
                <p className="mt-2 text-sm font-bold text-[#0F172A]">₹{listing.bestPrice.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
