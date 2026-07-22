import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import DayPassSearchBar from "../components/daypass/DayPassSearchBar";
import WorkspaceSearchBar from "../components/daypass/WorkspaceSearchBar";
import FilterSidebar from "../components/daypass/FilterSidebar";
import ListingCard from "../components/daypass/ListingCard";
import OffersStrip from "../components/offers/OffersStrip";
import ListingCardSkeleton from "../components/daypass/ListingCardSkeleton";
import ListingsMap from "../components/common/ListingsMap";
import ListingsViewControls from "../components/common/ListingsViewControls";
import { CITY_NAMES } from "../data/dayPassListings";
import type { DayPassFilters, DayPassListing, SortOption } from "../data/dayPassListings";
import { apiGet } from "../lib/api";
import { apiToDayPassListing, PRODUCT_TYPE, type CentreApiRow } from "../lib/centreAdapter";
import { findByDeslug, slugify } from "../utils/slug";
import { uniqueSorted } from "../utils/filterOptions";
import { metroBySlug, centerInMetro, haversineKm, NEAR_ME_RADIUS_KM } from "../data/metros";
import { useGeolocation } from "../hooks/useGeolocation";

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
  const params = useParams<{ city?: string }>();
  const lockedCitySlug = params.city ? params.city.toLowerCase() : null;
  const citySlug = lockedCitySlug ?? "";
  const cityName = lockedCitySlug ? cityLabel(lockedCitySlug) : "India";

  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [members, setMembers] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [showMap, setShowMap] = useState(true);
  const mapVisible = layout === "list" && showMap;
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [listings, setListings] = useState<DayPassListing[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const near = searchParams.get("near") === "1";
  const geo = useGeolocation();

  // Ask for the user's location once when "Near me" is chosen.
  useEffect(() => {
    if (near && !geo.coords && geo.status === "idle") geo.request();
  }, [near, geo]);

  const fetchListings = useCallback(() => {
    setApiLoading(true);
    // City-locked route → narrow by the metro's geo box (includes Thane / Navi
    // Mumbai etc.); tightened to the exact radius client-side. Unknown slug →
    // fall back to the plain city= filter. The geo box only matches centers
    // that have latitude/longitude saved — most don't yet, so if the
    // geo-scoped fetch comes back empty for a known metro, retry once with a
    // plain city= text match rather than silently showing zero results.
    const metro = metroBySlug(lockedCitySlug);
    const geoScope = metro ? `&lat=${metro.lat}&lng=${metro.lng}&radius=${metro.radiusKm}` : "";
    const cityScope = lockedCitySlug ? `&city=${encodeURIComponent(cityName)}` : "";
    const scope = geoScope || cityScope;
    apiGet<{ data: CentreApiRow[]; page: number; pageSize: number }>(
      `/centers/list?productType=${PRODUCT_TYPE.dayPass}&pageSize=100${scope}`,
    )
      .then((res) => {
        if (res.data.length === 0 && geoScope && cityScope) {
          return apiGet<{ data: CentreApiRow[]; page: number; pageSize: number }>(
            `/centers/list?productType=${PRODUCT_TYPE.dayPass}&pageSize=100${cityScope}`,
          ).then((fallback) => setListings(fallback.data.map(apiToDayPassListing)));
        }
        setListings(res.data.map(apiToDayPassListing));
      })
      .catch(() => setListings([]))
      .finally(() => setApiLoading(false));
  }, [lockedCitySlug, cityName]);

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

  // Filter options are derived from the real fetched centres, so the sidebar
  // only ever offers values that some centre can actually match.
  const seatingOptions = useMemo(() => uniqueSorted(listings.flatMap((l) => l.seatingTypes)), [listings]);
  const brandOptions = useMemo(() => uniqueSorted(listings.map((l) => l.brand)), [listings]);
  const accessibilityOptions = useMemo(() => uniqueSorted(listings.flatMap((l) => l.accessibility)), [listings]);
  const spaceTypeOptions = useMemo(() => uniqueSorted(listings.map((l) => l.spaceType)), [listings]);

  const filters: DayPassFilters = useMemo(() => {
    const parseList = (key: string, options: readonly string[]) => {
      const raw = searchParams.get(key)?.split(",").filter(Boolean) ?? [];
      return raw
        .map((slug) => findByDeslug(options, slug))
        .filter((value): value is string => Boolean(value));
    };
    const spaceTypeSlug = searchParams.get("spaceType");
    return {
      seating: parseList("seating", seatingOptions),
      brands: parseList("brands", brandOptions),
      accessibility: parseList("accessibility", accessibilityOptions),
      timings: searchParams.get("timings")?.split(",").filter(Boolean) ?? [],
      spaceType: spaceTypeSlug ? findByDeslug(spaceTypeOptions, spaceTypeSlug) ?? null : null,
      priceMin: Number(searchParams.get("priceMin") ?? 0),
      priceMax: Number(searchParams.get("priceMax") ?? 2000),
      sort: (searchParams.get("sort") as SortOption) ?? "recommended",
      q: searchParams.get("q") ?? "",
    };
  }, [searchParams, seatingOptions, brandOptions, accessibilityOptions, spaceTypeOptions]);

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

  const nearActive = near && geo.coords != null;

  const filteredListings = useMemo(() => {
    let list = listings.slice();

    // Tighten the metro geo box to the true radius + city aliases.
    const lockedMetro = metroBySlug(lockedCitySlug);
    if (lockedMetro) list = list.filter((l) => centerInMetro(l, lockedMetro));

    // "Near me": keep only centers within range of the user.
    if (nearActive) {
      list = list.filter(
        (l) => l.latitude != null && l.longitude != null &&
          haversineKm(geo.coords!.lat, geo.coords!.lng, l.latitude, l.longitude) <= NEAR_ME_RADIUS_KM,
      );
    }

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
    if (nearActive) sorted.sort((a, b) =>
      haversineKm(geo.coords!.lat, geo.coords!.lng, a.latitude ?? 0, a.longitude ?? 0) -
      haversineKm(geo.coords!.lat, geo.coords!.lng, b.latitude ?? 0, b.longitude ?? 0));
    else if (filters.sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (filters.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (filters.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    // Default ("recommended"): admin-promoted centers lead — by priority rank
    // among themselves — then popular, then rating. Explicit price/distance
    // sorts are left untouched.
    else sorted.sort((a, b) => {
      const feat = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
      if (feat) return feat;
      if (a.isFeatured && b.isFeatured) {
        const rank = (a.featuredRank ?? Infinity) - (b.featuredRank ?? Infinity);
        if (rank) return rank;
      }
      return Number(b.popular) - Number(a.popular) || b.rating - a.rating;
    });

    return sorted;
  }, [citySlug, filters, location, listings, lockedCitySlug, nearActive, geo.coords]);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-text">
            <Link to="/" className="hover:text-brand">
              Home
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-primary-text">Day Pass</span>
          </nav>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-primary-text sm:text-3xl">
            Book Coworking Day Pass in {cityName}
          </h1>

          <div className="mt-6">
            <DayPassSearchBar
              citySlug={citySlug}
              near={near}
              date={date}
              onDateChange={setDate}
              members={members}
              onMembersChange={setMembers}
              location={location}
              onLocationChange={setLocationQuery}
              onSubmit={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
          </div>


          <div className="mt-8 max-w-xl">
            <WorkspaceSearchBar value={filters.q} onChange={setQuery} />
          </div>

          <div
            ref={resultsRef}
            className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-base font-semibold text-primary-text">
              Showing {filteredListings.length} results in {cityName}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold text-secondary-text transition-colors hover:border-[#94A3B8] lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <ListingsViewControls layout={layout} onLayoutChange={setLayout} showMap={showMap} onToggleMap={() => setShowMap((v) => !v)} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-sm border border-border bg-card p-5">
                <FilterSidebar
                  filters={filters}
                  seatingOptions={seatingOptions}
                  brandOptions={brandOptions}
                  accessibilityOptions={accessibilityOptions}
                  spaceTypeOptions={spaceTypeOptions}
                  toggleArrayValue={toggleArrayValue}
                  setSpaceType={setSpaceType}
                  setSort={setSort}
                  setPriceRange={setPriceRange}
                />
              </div>
            </aside>

            <div>
              <OffersStrip vertical="day-pass" />
              {apiLoading ? (
                <div className={layout === "grid" ? "grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:pb-0" : "flex flex-col gap-3 pb-16 lg:pb-0"}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ListingCardSkeleton key={i} layout={layout === "grid" ? "grid" : "row"} />
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center rounded-sm border border-border bg-card text-center">
                  {listings.length === 0 ? (
                    <>
                      <p className="text-base font-bold text-primary-text">Coming soon to {cityName}</p>
                      <p className="mt-1 text-sm text-muted-text">We're onboarding workspaces in this city — check back soon.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-bold text-primary-text">No workspaces match your filters</p>
                      <p className="mt-1 text-sm text-muted-text">Try adjusting or clearing some filters.</p>
                    </>
                  )}
                </div>
              ) : mapVisible ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                  <div className="flex flex-col gap-3 pb-16 lg:pb-0">
                    {filteredListings.map((listing, i) => (
                      <div key={listing.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                        <ListingCard listing={listing} layout="row" />
                      </div>
                    ))}
                  </div>
                  <div className="hidden xl:block">
                    <div className="sticky top-24 h-[calc(100vh-7rem)] overflow-hidden rounded-sm border border-border">
                      <ListingsMap
                        items={filteredListings
                          .filter((l) => l.latitude != null && l.longitude != null)
                          .map((l) => ({
                            id: l.id,
                            name: l.name,
                            image: l.images[0],
                            priceLabel: `₹${l.bestPrice}/day`,
                            lat: l.latitude as number,
                            lng: l.longitude as number,
                            href: `/day-pass/${l.id}`,
                          }))}
                        fallbackCenter={metroBySlug(lockedCitySlug) ?? { lat: 19.076, lng: 72.8777 }}
                      />
                    </div>
                  </div>
                </div>
              ) : layout === "grid" ? (
                <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:pb-0">
                  {filteredListings.map((listing, i) => (
                    <div key={listing.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <ListingCard listing={listing} layout="grid" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-16 lg:pb-0">
                  {filteredListings.map((listing, i) => (
                    <div key={listing.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <ListingCard listing={listing} layout="row" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#0F172A]/55"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative flex max-h-[88vh] w-full flex-col rounded-t-[24px] bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="mx-auto h-1.5 w-10 rounded-full bg-[#E2E8F0]" />
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-muted-text hover:bg-[#F8FAFC]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterSidebar
                filters={filters}
                seatingOptions={seatingOptions}
                brandOptions={brandOptions}
                accessibilityOptions={accessibilityOptions}
                spaceTypeOptions={spaceTypeOptions}
                toggleArrayValue={toggleArrayValue}
                setSpaceType={setSpaceType}
                setSort={setSort}
                setPriceRange={setPriceRange}
              />
            </div>
            <div className="sticky bottom-0 border-t border-border bg-card p-4">
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
    </MainLayout>
  );
}
