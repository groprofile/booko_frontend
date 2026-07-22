import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Briefcase, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import VirtualOfficeSearchBar from "../components/virtualoffice/VirtualOfficeSearchBar";
import VirtualOfficeFilterSidebar from "../components/virtualoffice/VirtualOfficeFilterSidebar";
import VirtualOfficeListingCard from "../components/virtualoffice/VirtualOfficeListingCard";
import OffersStrip from "../components/offers/OffersStrip";
import VirtualOfficeListingCardSkeleton from "../components/virtualoffice/VirtualOfficeListingCardSkeleton";
import BokkoExpertGlassCard from "../components/virtualoffice/BokkoExpertGlassCard";
import ListingsMap from "../components/common/ListingsMap";
import ListingsViewControls from "../components/common/ListingsViewControls";
import { metroBySlug } from "../data/metros";
import { CITY_NAMES, allRatingThresholds } from "../data/virtualOfficeListings";
import type { VirtualOfficeListing, VirtualOfficeFilters, VOSortOption } from "../data/virtualOfficeListings";
import { apiGet } from "../lib/api";
import { apiToVirtualOfficeListing, PRODUCT_TYPE, type CentreApiRow } from "../lib/centreAdapter";
import { findByDeslug, slugify } from "../utils/slug";
import { uniqueSorted } from "../utils/filterOptions";

const PRICE_MIN = 500;
const PRICE_MAX = 5000;
const PAGE_SIZE = 6;

type ArrayFilterKey = "areas" | "services" | "durations" | "popularTags" | "buildingTypes" | "brands";

function cityLabel(slug: string) {
  return (
    CITY_NAMES[slug] ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

interface VirtualOfficeListingPageProps {
  areaSlug?: string;
}

export default function VirtualOfficeListingPage({ areaSlug }: VirtualOfficeListingPageProps = {}) {
  const params = useParams<{ city?: string; area?: string }>();
  const lockedCitySlug = params.city ? params.city.toLowerCase() : null;
  const citySlug = lockedCitySlug ?? "";
  const cityName = lockedCitySlug ? cityLabel(lockedCitySlug) : "India";
  const pageLabel = "Virtual Office";

  const [searchParams, setSearchParams] = useSearchParams();
  const seeded = useRef(false);

  const [areaField, setAreaField] = useState("");
  const [gstRequired, setGstRequired] = useState(false);
  const [priceRangeField, setPriceRangeField] = useState("Any Budget");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [showMap, setShowMap] = useState(true);
  const mapVisible = layout === "list" && showMap;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [listings, setListings] = useState<VirtualOfficeListing[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  // Filter options derived from the real fetched listings.
  const areaOptions = useMemo(() => uniqueSorted(listings.map((l) => l.area)), [listings]);
  const serviceOptions = useMemo(() => uniqueSorted(listings.flatMap((l) => l.servicesIncluded)), [listings]);
  const durationOptions = useMemo(() => uniqueSorted(listings.flatMap((l) => l.durations)), [listings]);
  const popularTagOptions = useMemo(() => uniqueSorted(listings.flatMap((l) => l.popularTags)), [listings]);
  const buildingTypeOptions = useMemo(() => uniqueSorted(listings.map((l) => l.buildingType)), [listings]);
  const brandOptions = useMemo(() => uniqueSorted(listings.map((l) => l.brand)), [listings]);

  const rawAreaSlug = params.area ?? areaSlug;
  const resolvedAreaParam = rawAreaSlug ? findByDeslug(areaOptions, rawAreaSlug) : undefined;
  const locationLabel = resolvedAreaParam ? `${resolvedAreaParam}, ${cityName}` : cityName;

  useEffect(() => {
    setApiLoading(true);
    const cityParam = lockedCitySlug ? `&city=${encodeURIComponent(cityName)}` : "";
    apiGet<{ data: CentreApiRow[]; page: number; pageSize: number }>(
      `/centers/list?productType=${PRODUCT_TYPE.virtualOffice}&pageSize=100${cityParam}`,
    )
      .then((res) => setListings(res.data.map(apiToVirtualOfficeListing)))
      .catch(() => setListings([]))
      .finally(() => setApiLoading(false));
  }, [lockedCitySlug, cityName]);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (!resolvedAreaParam) return;
    const next = new URLSearchParams(searchParams);
    if (!next.get("areas")) {
      next.set("areas", slugify(resolvedAreaParam));
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${pageLabel} in ${locationLabel} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book a Virtual Office in ${locationLabel} with GST registration, business address and company registration support on Bokko.`,
    );
  }, [locationLabel, pageLabel]);

  const filters: VirtualOfficeFilters = useMemo(() => {
    const parseList = (key: string, options: readonly string[]) => {
      const raw = searchParams.get(key)?.split(",").filter(Boolean) ?? [];
      return raw
        .map((slug) => findByDeslug(options, slug))
        .filter((value): value is string => Boolean(value));
    };
    const ratingsRaw = searchParams.get("ratings")?.split(",").filter(Boolean) ?? [];
    return {
      areas: parseList("areas", areaOptions),
      services: parseList("services", serviceOptions),
      durations: parseList("durations", durationOptions),
      priceMin: Number(searchParams.get("priceMin") ?? PRICE_MIN),
      priceMax: Number(searchParams.get("priceMax") ?? PRICE_MAX),
      popularTags: parseList("popularTags", popularTagOptions),
      buildingTypes: parseList("buildingTypes", buildingTypeOptions),
      brands: parseList("brands", brandOptions),
      ratings: ratingsRaw.map(Number).filter((n) => allRatingThresholds.includes(n)),
      sort: (searchParams.get("sort") as VOSortOption) ?? "recommended",
      q: searchParams.get("q") ?? "",
    };
  }, [searchParams, areaOptions, serviceOptions, durationOptions, popularTagOptions, buildingTypeOptions, brandOptions]);

  const activeFilterCount =
    filters.areas.length +
    filters.services.length +
    filters.durations.length +
    filters.popularTags.length +
    filters.buildingTypes.length +
    filters.brands.length +
    filters.ratings.length +
    (filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX ? 1 : 0);

  function updateParams(updater: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next, { replace: true });
    setVisibleCount(PAGE_SIZE);
  }

  function toggleArrayValue(key: ArrayFilterKey, rawValue: string) {
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

  function toggleRating(value: number) {
    updateParams((next) => {
      const current = next.get("ratings")?.split(",").filter(Boolean).map(Number) ?? [];
      const nextList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (nextList.length) next.set("ratings", nextList.join(","));
      else next.delete("ratings");
    });
  }

  function setSort(value: VOSortOption) {
    updateParams((next) => {
      if (value === "recommended") next.delete("sort");
      else next.set("sort", value);
    });
  }

  function setPriceRange(min: number, max: number) {
    updateParams((next) => {
      if (min > PRICE_MIN) next.set("priceMin", String(min));
      else next.delete("priceMin");
      if (max < PRICE_MAX) next.set("priceMax", String(max));
      else next.delete("priceMax");
    });
  }

  function applySearchBarFilters() {
    updateParams((next) => {
      if (areaField.trim()) {
        const match = areaOptions.find((area) => area.toLowerCase().includes(areaField.trim().toLowerCase()));
        if (match) next.set("areas", slugify(match));
      }
      if (gstRequired) {
        const current = next.get("services")?.split(",").filter(Boolean) ?? [];
        const gstSlug = slugify("GST Registration");
        if (!current.includes(gstSlug)) next.set("services", [...current, gstSlug].join(","));
      }
      if (priceRangeField === "Under ₹1000") { next.set("priceMin", "500"); next.set("priceMax", "1000"); }
      else if (priceRangeField === "₹1000 - ₹2000") { next.set("priceMin", "1000"); next.set("priceMax", "2000"); }
      else if (priceRangeField === "₹2000 - ₹3000") { next.set("priceMin", "2000"); next.set("priceMax", "3000"); }
      else if (priceRangeField === "₹3000+") { next.set("priceMin", "3000"); next.set("priceMax", String(PRICE_MAX)); }
      else { next.delete("priceMin"); next.delete("priceMax"); }
    });
  }

  const filteredListings = useMemo(() => {
    let list = listings.slice();

    if (filters.areas.length) {
      list = list.filter((listing) => filters.areas.includes(listing.area));
    }
    if (filters.services.length) {
      list = list.filter((listing) => filters.services.every((item) => listing.servicesIncluded.includes(item)));
    }
    if (filters.durations.length) {
      list = list.filter((listing) => filters.durations.some((duration) => listing.durations.includes(duration)));
    }
    if (filters.popularTags.length) {
      list = list.filter((listing) => filters.popularTags.every((tag) => listing.popularTags.includes(tag)));
    }
    if (filters.buildingTypes.length) {
      list = list.filter((listing) => filters.buildingTypes.includes(listing.buildingType));
    }
    if (filters.brands.length) {
      list = list.filter((listing) => filters.brands.includes(listing.brand));
    }
    if (filters.ratings.length) {
      const minRating = Math.min(...filters.ratings);
      list = list.filter((listing) => listing.rating >= minRating);
    }
    list = list.filter((listing) => listing.bestPrice >= filters.priceMin && listing.bestPrice <= filters.priceMax);

    const sorted = [...list];
    if (filters.sort === "popularity") sorted.sort((a, b) => Number(b.popular) - Number(a.popular));
    else if (filters.sort === "price-asc") sorted.sort((a, b) => a.bestPrice - b.bestPrice);
    else if (filters.sort === "price-desc") sorted.sort((a, b) => b.bestPrice - a.bestPrice);
    else if (filters.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    // Default ("recommended"): admin-promoted centers lead — by priority rank
    // among themselves — then popular, then rating.
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
  }, [citySlug, filters, listings]);

  const visibleListings = filteredListings.slice(0, visibleCount);

  return (
    <MainLayout>
      <div className="flex-1 pb-10">
        <VirtualOfficeSearchBar
          citySlug={citySlug}
          area={areaField}
          onAreaChange={setAreaField}
          gstRequired={gstRequired}
          onGstRequiredChange={setGstRequired}
          priceRange={priceRangeField}
          onPriceRangeChange={setPriceRangeField}
          onSubmit={applySearchBarFilters}
        />

        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-text">
            <Link to="/" className="hover:text-brand">
              Home
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            {resolvedAreaParam && (
              <>
                <ChevronRight size={14} />
                <span>{resolvedAreaParam}</span>
              </>
            )}
            <ChevronRight size={14} />
            <span className="font-semibold text-primary-text">{pageLabel}</span>
          </nav>

          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-primary-text sm:text-[34px] lg:text-[42px]">
            {pageLabel} in {locationLabel}
          </h1>


          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-semibold text-primary-text">
              Showing {filteredListings.length} Virtual Offices in {locationLabel}
            </p>
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

          <div className={"mt-6 grid grid-cols-1 gap-8 " + (mapVisible ? "lg:grid-cols-[300px_minmax(0,1fr)_420px]" : "lg:grid-cols-[300px_minmax(0,1fr)]")}>
            <aside className="hidden lg:block">
              <div className="sticky top-44 flex max-h-[calc(100vh-12rem)] flex-col gap-5 overflow-y-auto pr-1">
                <VirtualOfficeFilterSidebar
                  filters={filters}
                  areaOptions={areaOptions}
                  serviceOptions={serviceOptions}
                  durationOptions={durationOptions}
                  popularTagOptions={popularTagOptions}
                  buildingTypeOptions={buildingTypeOptions}
                  brandOptions={brandOptions}
                  toggleArrayValue={toggleArrayValue}
                  toggleRating={toggleRating}
                  setSort={setSort}
                  setPriceRange={setPriceRange}
                />
                <BokkoExpertGlassCard />
              </div>
            </aside>

            <div className="min-w-0">
              <OffersStrip vertical="virtual-office" />
              {apiLoading ? (
                <div className={layout === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "flex flex-col gap-4"}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <VirtualOfficeListingCardSkeleton key={i} layout={layout === "grid" ? "grid" : "row"} />
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-sm border border-border bg-card text-center">
                  <Briefcase size={40} strokeWidth={1.5} className="text-[#94A3B8]" />
                  {listings.length === 0 ? (
                    <>
                      <p className="text-base font-bold text-primary-text">Coming soon to {locationLabel}</p>
                      <p className="text-sm text-muted-text">We're onboarding virtual offices in this city — check back soon.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-bold text-primary-text">No Virtual Offices Found</p>
                      <p className="text-sm text-muted-text">Try changing filters</p>
                    </>
                  )}
                </div>
              ) : (
                <div className={layout === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "flex flex-col gap-4"}>
                  {visibleListings.map((listing, i) => (
                    <div key={listing.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <VirtualOfficeListingCard listing={listing} layout={layout === "grid" ? "grid" : "row"} />
                    </div>
                  ))}

                  {visibleCount < filteredListings.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                      className={"mx-auto mt-2 rounded-sm border border-border bg-card px-8 py-3 text-sm font-bold text-secondary-text shadow-soft transition-colors hover:border-[#94A3B8] " + (layout === "grid" ? "sm:col-span-2" : "")}
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </div>

            {mapVisible && (
              <aside className="hidden lg:block">
                <div className="sticky top-44 h-[calc(100vh-12rem)] overflow-hidden rounded-sm border border-border">
                  <ListingsMap
                    items={filteredListings
                      .filter((l) => l.latitude != null && l.longitude != null)
                      .map((l) => ({
                        id: l.id,
                        name: l.centerName,
                        image: l.images[0],
                        priceLabel: `₹${l.plans[0]?.price.toLocaleString() ?? 0}/mo`,
                        lat: l.latitude as number,
                        lng: l.longitude as number,
                        href: `/virtual-office/${l.id}`,
                      }))}
                    fallbackCenter={metroBySlug(lockedCitySlug) ?? { lat: 19.076, lng: 72.8777 }}
                  />
                </div>
              </aside>
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
          <div className="relative flex max-h-[88vh] w-full flex-col rounded-t-[24px] bg-bg">
            <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <span className="mx-auto h-1.5 w-10 rounded-full bg-[#E2E8F0]" />
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-muted-text hover:bg-bg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <VirtualOfficeFilterSidebar
                filters={filters}
                areaOptions={areaOptions}
                serviceOptions={serviceOptions}
                durationOptions={durationOptions}
                popularTagOptions={popularTagOptions}
                buildingTypeOptions={buildingTypeOptions}
                brandOptions={brandOptions}
                toggleArrayValue={toggleArrayValue}
                toggleRating={toggleRating}
                setSort={setSort}
                setPriceRange={setPriceRange}
              />
            </div>
            <div className="sticky bottom-0 border-t border-border bg-card p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-sm bg-[#111111] py-3.5 text-sm font-bold text-white hover:bg-black"
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
