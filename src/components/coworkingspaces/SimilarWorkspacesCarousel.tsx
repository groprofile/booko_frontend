import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Star } from "lucide-react";
import type { CoworkingSpace } from "../../data/coworkingSpaces";
import { CITY_NAMES } from "../../data/coworkingSpaces";
import SectionLabel from "./SectionLabel";

interface SimilarWorkspacesCarouselProps {
  spaces: CoworkingSpace[];
}

type Tab = "nearby" | "top-rated" | "most-booked" | "premium";

const tabs: { key: Tab; label: string }[] = [
  { key: "nearby", label: "Nearby Spaces" },
  { key: "top-rated", label: "Top Rated Spaces" },
  { key: "most-booked", label: "Most Booked Spaces" },
  { key: "premium", label: "Premium Spaces" },
];

export default function SimilarWorkspacesCarousel({ spaces }: SimilarWorkspacesCarouselProps) {
  const [tab, setTab] = useState<Tab>("nearby");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const candidates = useMemo(() => {
    if (tab === "top-rated") return [...spaces].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 10);
    if (tab === "most-booked") return [...spaces].sort((a, b) => Number(b.reviews) - Number(a.reviews)).slice(0, 10);
    if (tab === "premium") return spaces.filter((space) => space.premium).slice(0, 10);
    return [...spaces].sort((a, b) => Number(a.distanceKm) - Number(b.distanceKm)).slice(0, 10);
  }, [spaces, tab]);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section>
      <SectionLabel
        title="Similar Workspaces"
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
        <p className="text-sm text-[#64748B]">No workspaces found in this category yet.</p>
      ) : (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {candidates.map((space) => (
            <Link
              key={space.id}
              to={`/${space.city}/coworking-spaces`}
              className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-soft transition-transform hover:-translate-y-1"
            >
              <div className="h-[140px] w-full overflow-hidden">
                <img src={space.image} alt={space.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-sm font-bold text-[#0F172A] line-clamp-1">{space.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                  <MapPin size={12} />
                  {space.locality}, {CITY_NAMES[space.city] ?? space.city}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                  <Star size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
                  {Number(space.rating ?? 0).toFixed(1)}
                </p>
                <p className="mt-2 text-sm font-bold text-[#0F172A]">From ₹{Number(space.startingPrice ?? 0).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
