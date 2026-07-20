import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Star } from "lucide-react";
import type { VirtualOfficeListing } from "../../data/virtualOfficeListings";
import { fetchNearbyPromotedFirst } from "../../lib/centreFeed";
import { apiToVirtualOfficeListing, PRODUCT_TYPE } from "../../lib/centreAdapter";
import RecommendedBadge from "../RecommendedBadge";
import SectionLabel from "./SectionLabel";

interface SimilarOfficesSectionProps {
  current: VirtualOfficeListing;
}

type Tab = "nearby" | "premium" | "value" | "popular";

const tabs: { key: Tab; label: string }[] = [
  { key: "nearby", label: "Nearby" },
  { key: "premium", label: "Premium Locations" },
  { key: "value", label: "Best Value" },
  { key: "popular", label: "Most Popular" },
];

export default function SimilarOfficesSection({ current }: SimilarOfficesSectionProps) {
  const [tab, setTab] = useState<Tab>("nearby");
  const [listings, setListings] = useState<VirtualOfficeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Live nearby virtual-office centers, promoted-first (admin-ranked lead).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNearbyPromotedFirst(PRODUCT_TYPE.virtualOffice, current.latitude, current.longitude, {
      excludeId: current.id,
      pageSize: 12,
    })
      .then((rows) => {
        if (!cancelled) setListings(rows.map(apiToVirtualOfficeListing));
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [current.id, current.latitude, current.longitude]);

  const candidates = useMemo(() => {
    if (tab === "premium") {
      return listings.filter((listing) => listing.premier).slice(0, 8);
    }
    if (tab === "value") {
      return [...listings].sort((a, b) => a.bestPrice - b.bestPrice).slice(0, 8);
    }
    if (tab === "popular") {
      return listings.filter((listing) => listing.popular).slice(0, 8);
    }
    // "nearby" keeps the API's promoted-first-then-distance order.
    return listings.slice(0, 8);
  }, [listings, tab]);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section>
      <SectionLabel
        title="Similar Virtual Offices"
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

      {loading ? (
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[232px] w-[260px] shrink-0 animate-pulse rounded-[18px] bg-[#F1F5F9]" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-[#64748B]">No similar virtual offices found in this category.</p>
      ) : (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {candidates.map((listing) => (
            <Link
              key={listing.id}
              to={`/virtual-office/${listing.id}`}
              className="relative flex w-[260px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-soft transition-transform hover:-translate-y-1"
            >
              {listing.isFeatured && <RecommendedBadge size="sm" className="absolute left-3 top-3 z-10" />}
              <div className="h-[140px] w-full overflow-hidden">
                <img src={listing.images[0]} alt={listing.centerName} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-sm font-bold text-[#0F172A] line-clamp-1">{listing.centerName}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                  <MapPin size={12} />
                  {listing.area}
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
