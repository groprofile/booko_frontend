import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Briefcase, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VirtualOfficeSearchBar from "../components/virtualoffice/VirtualOfficeSearchBar";
import TrustStrip from "../components/virtualoffice/TrustStrip";
import StatsStrip from "../components/virtualoffice/StatsStrip";
import PromoStrip from "../components/virtualoffice/PromoStrip";
import TrustBadgesRow from "../components/virtualoffice/TrustBadgesRow";
import VirtualOfficeFilterSidebar from "../components/virtualoffice/VirtualOfficeFilterSidebar";
import VirtualOfficeListingCard from "../components/virtualoffice/VirtualOfficeListingCard";
import VirtualOfficeListingCardSkeleton from "../components/virtualoffice/VirtualOfficeListingCardSkeleton";
import BokkoExpertGlassCard from "../components/virtualoffice/BokkoExpertGlassCard";
import {
  CITY_NAMES,
  allBrands,
  allBuildingTypes,
  allDurations,
  allPopularTags,
  allRatingThresholds,
  allServices,
  cityToLocalities,
} from "../data/virtualOfficeListings";
import type { VirtualOfficeListing, VirtualOfficeFilters, VOSortOption } from "../data/virtualOfficeListings";
import { apiGet } from "../lib/api";
import { apiToVirtualOfficeListing, PRODUCT_TYPE, type CentreApiRow } from "../lib/centreAdapter";
import { findByDeslug, slugify } from "../utils/slug";

const PRICE_MIN = 500;
const PRICE_MAX = 2000;
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
  const areas = lockedCitySlug ? cityToLocalities[lockedCitySlug] ?? [] : [];
  const rawAreaSlug = params.area ?? areaSlug;
  const resolvedAreaParam = rawAreaSlug ? findByDeslug(areas, rawAreaSlug) : undefined;
  const pageLabel = "Virtual Office";
  const locationLabel = resolvedAreaParam ? `${resolvedAreaParam}, ${cityName}` : cityName;

  const [searchParams, setSearchParams] = useSearchParams();
  const seeded = useRef(false);

  const [areaField, setAreaField] = useState("");
  const [planType, setPlanType] = useState("");
  const [gstRequired, setGstRequired] = useState(false);
  const [priceRangeField, setPriceRangeField] = useState("Any Budget");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [listings, setListings] = useState<VirtualOfficeListing[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

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
      areas: parseList("areas", areas),
      services: parseList("services", allServices),
      durations: parseList("durations", allDurations),
      priceMin: Number(searchParams.get("priceMin") ?? PRICE_MIN),
      priceMax: Number(searchParams.get("priceMax") ?? PRICE_MAX),
      popularTags: parseList("popularTags", allPopularTags),
      buildingTypes: parseList("buildingTypes", allBuildingTypes),
      brands: parseList("brands", allBrands),
      ratings: ratingsRaw.map(Number).filter((n) => allRatingThresholds.includes(n)),
      sort: (searchParams.get("sort") as VOSortOption) ?? "recommended",
      q: searchParams.get("q") ?? "",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, citySlug]);

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
        const match = areas.find((area) => area.toLowerCase().includes(areaField.trim().toLowerCase()));
        if (match) next.set("areas", slugify(match));
      }
      if (gstRequired) {
        const current = next.get("services")?.split(",").filter(Boolean) ?? [];
        const gstSlug = slugify("GST Registration");
        if (!current.includes(gstSlug)) next.set("services", [...current, gstSlug].join(","));
      }
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
    else sorted.sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating);

    return sorted;
  }, [citySlug, filters, listings]);

  const visibleListings = filteredListings.slice(0, visibleCount);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 pb-10">
        <VirtualOfficeSearchBar
          citySlug={citySlug}
          area={areaField}
          onAreaChange={setAreaField}
          planType={planType}
          onPlanTypeChange={setPlanType}
          gstRequired={gstRequired}
          onGstRequiredChange={setGstRequired}
          priceRange={priceRangeField}
          onPriceRangeChange={setPriceRangeField}
          onSubmit={applySearchBarFilters}
        />

        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
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
            <span className="font-semibold text-[#0F172A]">{pageLabel}</span>
          </nav>

          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[34px] lg:text-[42px]">
            {pageLabel} in {locationLabel}
          </h1>

          <div className="mt-5">
            <TrustStrip />
          </div>

          <div className="mt-6">
            <StatsStrip />
          </div>

          <div className="mt-6">
            <PromoStrip />
          </div>

          <div className="mt-6">
            <TrustBadgesRow />
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-semibold text-[#0F172A]">
              Showing {filteredListings.length} Virtual Offices in {locationLabel}
            </p>
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
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
            <aside className="hidden lg:block">
              <div className="sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                <VirtualOfficeFilterSidebar
                  filters={filters}
                  areas={areas}
                  toggleArrayValue={toggleArrayValue}
                  toggleRating={toggleRating}
                  setSort={setSort}
                  setPriceRange={setPriceRange}
                />
              </div>
            </aside>

            <div className="min-w-0">
              {apiLoading ? (
                <div className="flex flex-col gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <VirtualOfficeListingCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[#E2E8F0] bg-white text-center">
                  <Briefcase size={40} strokeWidth={1.5} className="text-[#94A3B8]" />
                  <p className="text-base font-bold text-[#0F172A]">No Virtual Offices Found</p>
                  <p className="text-sm text-[#64748B]">Try changing filters</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {visibleListings.map((listing, i) => (
                    <div key={listing.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <VirtualOfficeListingCard listing={listing} />
                    </div>
                  ))}

                  {visibleCount < filteredListings.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                      className="mx-auto mt-2 rounded-xl border border-[#E2E8F0] bg-white px-8 py-3 text-sm font-bold text-[#334155] shadow-soft transition-colors hover:border-[#94A3B8]"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-44">
                <BokkoExpertGlassCard />
              </div>
            </aside>
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
          <div className="relative flex max-h-[88vh] w-full flex-col rounded-t-[24px] bg-[#F8FAFC]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-5 py-4">
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
              <VirtualOfficeFilterSidebar
                filters={filters}
                areas={areas}
                toggleArrayValue={toggleArrayValue}
                toggleRating={toggleRating}
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
