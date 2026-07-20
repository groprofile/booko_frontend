import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Star } from "lucide-react";
import type { DayPassListing } from "../../data/dayPassListings";
import { fetchNearbyPromotedFirst } from "../../lib/centreFeed";
import { apiToDayPassListing, PRODUCT_TYPE } from "../../lib/centreAdapter";
import RecommendedBadge from "../RecommendedBadge";
import SectionLabel from "./SectionLabel";

interface SimilarWorkspacesSectionProps {
  current: DayPassListing;
  cityName: string;
}

type Tab = "nearby" | "city";

export default function SimilarWorkspacesSection({ current, cityName }: SimilarWorkspacesSectionProps) {
  const [tab, setTab] = useState<Tab>("nearby");
  const [listings, setListings] = useState<DayPassListing[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Pull nearby day-pass centers from the live API, promoted-first (admin-ranked
  // centers lead, the rest by distance). Replaces the old static list.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNearbyPromotedFirst(PRODUCT_TYPE.dayPass, current.latitude, current.longitude, {
      excludeId: current.id,
      pageSize: 12,
    })
      .then((rows) => {
        if (!cancelled) setListings(rows.map(apiToDayPassListing));
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

  // "nearby" keeps the API's promoted-first order; "city" re-sorts by rating.
  const candidates = useMemo(() => {
    if (tab === "city") {
      return [...listings].sort((a, b) => b.rating - a.rating).slice(0, 8);
    }
    return listings.slice(0, 8);
  }, [listings, tab]);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="m-0">
      <SectionLabel
        title="Explore Nearby"
        action={
          <button
            type="button"
            onClick={() => scrollByAmount(320)}
            aria-label="Scroll right"
            className="hidden h-10 w-10 items-center justify-center rounded-sm border border-border bg-card text-secondary-text shadow-soft hover:border-muted-text hover:shadow-soft-lg sm:flex transition-all"
          >
            <ChevronRight size={18} />
          </button>
        }
      />

      <div className="mb-6 flex gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("nearby")}
          className={
            "px-4 py-3 text-sm font-semibold transition-all " +
            (tab === "nearby"
              ? "border-b-2 border-primary-blue text-primary-blue"
              : "border-b-2 border-transparent text-muted-text hover:text-secondary-text")
          }
        >
          Spaces Nearby
        </button>
        <button
          type="button"
          onClick={() => setTab("city")}
          className={
            "px-4 py-3 text-sm font-semibold transition-all " +
            (tab === "city"
              ? "border-b-2 border-primary-blue text-primary-blue"
              : "border-b-2 border-transparent text-muted-text hover:text-secondary-text")
          }
        >
          Top Rated
        </button>
      </div>

      {loading ? (
        <div className="flex gap-5 overflow-hidden pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 w-64 shrink-0 animate-pulse rounded-sm bg-bg" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-muted-text">No nearby day pass spaces found in {cityName} yet.</p>
      ) : (
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
          {candidates.map((listing) => (
            <div
              key={listing.id}
              className="group relative flex w-72 shrink-0 flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg hover:border-primary-blue/20"
            >
              {listing.isFeatured && <RecommendedBadge size="sm" className="absolute left-4 top-4 z-10" />}
              <div className="h-44 w-full overflow-hidden bg-bg">
                <img src={listing.images[0]} alt={listing.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm font-bold text-primary-text line-clamp-2">{listing.name}</p>
                <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-sm bg-blue-50 px-3 py-1 text-xs font-semibold text-primary-blue">
                  {listing.seatingTypes[0]}
                </span>
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-text">
                  <MapPin size={13} className="flex-shrink-0" />
                  {listing.locality}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-text">
                  <Star size={13} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span className="font-semibold text-primary-text">{listing.rating.toFixed(2)}</span>
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-base font-bold text-primary-text">₹{listing.bestPrice}</span>
                  <span className="text-xs text-muted-text">/day</span>
                </div>
                <Link
                  to={`/day-pass/${listing.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-blue transition-colors hover:text-primary-blue/80"
                >
                  View Details
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
