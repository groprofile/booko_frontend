import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Star } from "lucide-react";
import type { MonthlyPassListing } from "../../data/monthlyPassListings";
import { slugify } from "../../utils/slug";
import SectionLabel from "./SectionLabel";

interface NearbyWorkspacesSectionProps {
  current: MonthlyPassListing;
  allListings: MonthlyPassListing[];
}

type Tab = "area" | "budget" | "premium" | "top-rated" | "popular";

const tabs: { key: Tab; label: string }[] = [
  { key: "area", label: "Same Area" },
  { key: "budget", label: "Same Budget" },
  { key: "premium", label: "Premium Spaces" },
  { key: "top-rated", label: "Top Rated" },
  { key: "popular", label: "Popular Workspaces" },
];

export default function NearbyWorkspacesSection({ current, allListings }: NearbyWorkspacesSectionProps) {
  const [tab, setTab] = useState<Tab>("area");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const candidates = useMemo(() => {
    const others = allListings.filter((listing) => listing.id !== current.id);
    if (tab === "area") {
      return others.filter((listing) => listing.locality === current.locality).slice(0, 8);
    }
    if (tab === "budget") {
      return [...others]
        .sort((a, b) => Math.abs(a.bestPrice - current.bestPrice) - Math.abs(b.bestPrice - current.bestPrice))
        .slice(0, 8);
    }
    if (tab === "premium") {
      return others.filter((listing) => listing.premier).slice(0, 8);
    }
    if (tab === "top-rated") {
      return [...others].sort((a, b) => b.rating - a.rating).slice(0, 8);
    }
    return others.filter((listing) => listing.popular).slice(0, 8);
  }, [allListings, current, tab]);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section>
      <SectionLabel
        title="Nearby Workspaces"
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
        <p className="text-sm text-[#64748B]">No nearby workspaces found in this category.</p>
      ) : (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {candidates.map((listing) => (
            <Link
              key={listing.id}
              to={`/monthly-pass/${slugify(listing.name)}`}
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
                <p className="mt-2 text-sm font-bold text-[#0F172A]">₹{listing.bestPrice.toLocaleString()}/mo</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
