import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, Map, SlidersHorizontal, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DayPassSearchBar from "../components/daypass/DayPassSearchBar";
import DayPassOffersRail from "../components/daypass/DayPassOffersRail";
import WorkspaceSearchBar from "../components/daypass/WorkspaceSearchBar";
import FilterSidebar from "../components/daypass/FilterSidebar";
import ListingCard from "../components/daypass/ListingCard";
import {
  CITY_NAMES,
  allAccessibility,
  allBrands,
  allSeatingTypes,
  allSpaceTypes,
} from "../data/dayPassListings";
import type { DayPassFilters, DayPassListing, SortOption } from "../data/dayPassListings";
import { apiGet } from "../lib/api";
import { apiToDayPassListing, type CentreApiRow } from "../lib/centreAdapter";
import { findByDeslug, slugify } from "../utils/slug";

function cityLabel(slug: string) {
  return (
    CITY_NAMES[slug] ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export default function DayPassListingPage() {
  const params = useParams<{ city: string }>();
  const citySlug = (params.city ?? "mumbai").toLowerCase();
  const cityName = cityLabel(citySlug);

  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [members, setMembers] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapView, setMapView] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [listings, setListings] = useState<DayPassListing[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  const fetchListings = useCallback(() => {
    setApiLoading(true);
    apiGet<{ data: CentreApiRow[]; page: number; pageSize: number }>(
      `/centers/list?productType=day-pass&city=${encodeURIComponent(cityName)}&pageSize=100`,
    )
      .then((res) => setListings(res.data.map(apiToDayPassListing)))
      .catch(() => setListings([]))
      .finally(() => setApiLoading(false));
  }, [cityName]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    document.title = `Day Pass in ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book coworking day passes in ${cityName} with Bokko. Compare workspaces, pricing and availability instantly.`,
    );
  }, [cityName]);

  const location = searchParams.get("location") ?? "";

  const filters: DayPassFilters = useMemo(() => {
    const parseList = (key: string, options: readonly string[]) => {
      const raw = searchParams.get(key)?.split(",").filter(Boolean) ?? [];
      return raw
        .map((slug) => findByDeslug(options, slug))
        .filter((value): value is string => Boolean(value));
    };
    const spaceTypeSlug = searchParams.get("spaceType");
    return {
      seating: parseList("seating", allSeatingTypes),
      brands: parseList("brands", allBrands),
      accessibility: parseList("accessibility", allAccessibility),
      timings: searchParams.get("timings")?.split(",").filter(Boolean) ?? [],
      spaceType: spaceTypeSlug ? findByDeslug(allSpaceTypes, spaceTypeSlug) ?? null : null,
      priceMin: Number(searchParams.get("priceMin") ?? 0),
      priceMax: Number(searchParams.get("priceMax") ?? 2000),
      sort: (searchParams.get("sort") as SortOption) ?? "recommended",
      q: searchParams.get("q") ?? "",
    };
  }, [searchParams]);

  const activeFilterCount =
    filters.seating.length +
    filters.brands.length +
    filters.accessibility.length +
    filters.timings.length +
    (filters.spaceType ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 2000 ? 1 : 0);

  function updateParams(updater: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next, { replace: true });
  }

  function toggleArrayValue(
    key: "seating" | "brands" | "accessibility" | "timings",
    rawValue: string,
  ) {
    const slug = slugify(rawValue);
    updateParams((next) => {
      const current = next.get(key)?.split(",").filter(Boolean) ?? [];
      const nextList = current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug];
      if (nextList.length) next.set(key, nextList.join(","));
      else next.delete(key);
    });
  }

  function setSpaceType(value: string | null) {
    updateParams((next) => {
      if (value) next.set("spaceType", slugify(value));
      else next.delete("spaceType");
    });
  }

  function setSort(value: SortOption) {
    updateParams((next) => {
      if (value === "recommended") next.delete("sort");
      else next.set("sort", value);
    });
  }

  function setPriceRange(min: number, max: number) {
    updateParams((next) => {
      if (min > 0) next.set("priceMin", String(min));
      else next.delete("priceMin");
      if (max < 2000) next.set("priceMax", String(max));
      else next.delete("priceMax");
    });
  }

  function setQuery(value: string) {
    updateParams((next) => {
      if (value) next.set("q", value);
      else next.delete("q");
    });
  }

  function setLocationQuery(value: string) {
    updateParams((next) => {
      if (value) next.set("location", value);
      else next.delete("location");
    });
  }

  const filteredListings = useMemo(() => {
    let list = listings.slice();

    if (location.trim()) {
      const q = location.trim().toLowerCase();
      list = list.filter((listing) => listing.locality.toLowerCase().includes(q));
    }
    if (filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      list = list.filter(
        (listing) =>
          listing.name.toLowerCase().includes(q) ||
          listing.brand.toLowerCase().includes(q) ||
          listing.locality.toLowerCase().includes(q),
      );
    }
    if (filters.seating.length) {
      list = list.filter((listing) =>
        filters.seating.some((seating) => listing.seatingTypes.includes(seating)),
      );
    }
    if (filters.brands.length) {
      list = list.filter((listing) => filters.brands.includes(listing.brand));
    }
    if (filters.accessibility.length) {
      list = list.filter((listing) =>
        filters.accessibility.every((item) => listing.accessibility.includes(item)),
      );
    }
    if (filters.spaceType) {
      list = list.filter((listing) => listing.spaceType === filters.spaceType);
    }
    if (filters.timings.length) {
      list = list.filter((listing) =>
        filters.timings.every((timing) => {
          if (timing === "open-now") return listing.openNow;
          if (timing === "open-early") return listing.opensEarly;
          if (timing === "closes-late") return listing.closesLate;
          return true;
        }),
      );
    }
    list = list.filter(
      (listing) => listing.price >= filters.priceMin && listing.price <= filters.priceMax,
    );

    const sorted = [...list];
    if (filters.sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (filters.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating);

    return sorted;
  }, [citySlug, filters, location, listings]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">Day Pass</span>
          </nav>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            Book Coworking Day Pass in {cityName}
          </h1>

          <div className="mt-6">
            <DayPassSearchBar
              citySlug={citySlug}
              date={date}
              onDateChange={setDate}
              members={members}
              onMembersChange={setMembers}
              location={location}
              onLocationChange={setLocationQuery}
              onSubmit={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
          </div>

          <div className="mt-8">
            <DayPassOffersRail />
          </div>

          <div className="mt-8 max-w-xl">
            <WorkspaceSearchBar value={filters.q} onChange={setQuery} />
          </div>

          <div
            ref={resultsRef}
            className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-base font-semibold text-[#0F172A]">
              Showing {filteredListings.length} results in {cityName}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:border-[#94A3B8] lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMapView((v) => !v)}
                className={
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors " +
                  (mapView
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E2E8F0] bg-white text-[#334155] hover:border-[#94A3B8]")
                }
              >
                <Map size={16} />
                Map
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <FilterSidebar
                  filters={filters}
                  toggleArrayValue={toggleArrayValue}
                  setSpaceType={setSpaceType}
                  setSort={setSort}
                  setPriceRange={setPriceRange}
                />
              </div>
            </aside>

            <div>
              {mapView ? (
                <div className="flex h-[480px] items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#64748B]">
                  Map view coming soon for {cityName}.
                </div>
              ) : apiLoading ? (
                <div className="flex h-[300px] items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-sm text-[#64748B]">
                  Loading workspaces…
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-center">
                  <p className="text-base font-bold text-[#0F172A]">No workspaces match your filters</p>
                  <p className="mt-1 text-sm text-[#64748B]">Try adjusting or clearing some filters.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5 pb-16 lg:pb-0">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {filtersOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#0F172A]/55"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative flex max-h-[88vh] w-full flex-col rounded-t-[24px] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <span className="mx-auto h-1.5 w-10 rounded-full bg-[#E2E8F0]" />
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterSidebar
                filters={filters}
                toggleArrayValue={toggleArrayValue}
                setSpaceType={setSpaceType}
                setSort={setSort}
                setPriceRange={setPriceRange}
              />
            </div>
            <div className="sticky bottom-0 border-t border-[#E2E8F0] bg-white p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-xl bg-[#111111] py-3.5 text-sm font-bold text-white hover:bg-black"
              >
                Show {filteredListings.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
