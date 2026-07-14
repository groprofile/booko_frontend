import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HotelSearchBar from "../components/hotel/HotelSearchBar";
import HotelFilterSidebar from "../components/hotel/HotelFilterSidebar";
import HotelListingCard from "../components/hotel/HotelListingCard";
import HotelCardSkeleton from "../components/hotel/HotelCardSkeleton";
import PromoStrip from "../components/hotel/PromoStrip";
import BokkoExpertCard from "../components/hotel/BokkoExpertCard";
import {
  CITY_NAMES,
  allCategories,
  allHotelAmenities,
  allHotelChains,
  allPopularTags,
  allRatingThresholds,
  allStayTypes,
  cityToLocalities,
} from "../data/hotelListings";
import type { HotelFilters, HotelListing, HotelSortOption } from "../data/hotelListings";
import { apiGet } from "../lib/api";
import { apiToHotelListing, type CentreApiRow } from "../lib/centreAdapter";
import { findByDeslug, slugify } from "../utils/slug";

const PRICE_MIN = 300;
const PRICE_MAX = 5000;
const PAGE_SIZE = 6;

type ArrayFilterKey = "stayTypes" | "durations" | "areas" | "categories" | "popularTags" | "chains" | "amenities";

function cityLabel(slug: string) {
  return (
    CITY_NAMES[slug] ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

interface HotelListingPageProps {
  presetStayType?: string;
  presetTag?: string;
  landingLabel?: string;
}

export default function HotelListingPage({ presetStayType, presetTag, landingLabel }: HotelListingPageProps) {
  const params = useParams<{ city: string }>();
  const citySlug = (params.city ?? "mumbai").toLowerCase();
  const cityName = cityLabel(citySlug);
  const pageLabel = landingLabel ?? "Hotels";
  const areas = cityToLocalities[citySlug] ?? [];

  const [searchParams, setSearchParams] = useSearchParams();
  const seeded = useRef(false);

  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [guests, setGuests] = useState(2);
  const [hotelType, setHotelType] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<HotelListing[]>([]);

  useEffect(() => {
    setLoading(true);
    apiGet<{ data: CentreApiRow[]; page: number; pageSize: number }>(
      `/centers/list?productType=hotel&city=${encodeURIComponent(cityName)}&pageSize=100`,
    )
      .then((res) => setListings(res.data.map(apiToHotelListing)))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [cityName]);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (!presetStayType && !presetTag) return;
    const next = new URLSearchParams(searchParams);
    let changed = false;
    if (presetStayType && !next.get("stayTypes")) {
      next.set("stayTypes", slugify(presetStayType));
      changed = true;
    }
    if (presetTag && !next.get("popularTags")) {
      next.set("popularTags", slugify(presetTag));
      changed = true;
    }
    if (changed) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${pageLabel} in ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book ${pageLabel.toLowerCase()} in ${cityName} with instant confirmation on Bokko. Compare hourly stays, full day stays and business hotels.`,
    );
  }, [cityName, pageLabel]);

  const filters: HotelFilters = useMemo(() => {
    const parseList = (key: string, options: readonly string[]) => {
      const raw = searchParams.get(key)?.split(",").filter(Boolean) ?? [];
      return raw
        .map((slug) => findByDeslug(options, slug))
        .filter((value): value is string => Boolean(value));
    };
    const ratingsRaw = searchParams.get("ratings")?.split(",").filter(Boolean) ?? [];
    return {
      stayTypes: parseList("stayTypes", allStayTypes),
      durations: searchParams.get("durations")?.split(",").filter(Boolean) ?? [],
      areas: parseList("areas", areas),
      priceMin: Number(searchParams.get("priceMin") ?? PRICE_MIN),
      priceMax: Number(searchParams.get("priceMax") ?? PRICE_MAX),
      ratings: ratingsRaw.map(Number).filter((n) => allRatingThresholds.includes(n)),
      categories: parseList("categories", allCategories),
      popularTags: parseList("popularTags", allPopularTags),
      chains: parseList("chains", allHotelChains),
      amenities: parseList("amenities", allHotelAmenities),
      sort: (searchParams.get("sort") as HotelSortOption) ?? "recommended",
      q: searchParams.get("q") ?? "",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, citySlug]);

  const activeFilterCount =
    filters.stayTypes.length +
    filters.durations.length +
    filters.areas.length +
    filters.ratings.length +
    filters.categories.length +
    filters.popularTags.length +
    filters.chains.length +
    filters.amenities.length +
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

  function clearArrayFilter(key: ArrayFilterKey) {
    updateParams((next) => next.delete(key));
  }

  function toggleRating(value: number) {
    updateParams((next) => {
      const current = next.get("ratings")?.split(",").filter(Boolean).map(Number) ?? [];
      const nextList = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (nextList.length) next.set("ratings", nextList.join(","));
      else next.delete("ratings");
    });
  }

  function setSort(value: HotelSortOption) {
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

  const filteredListings = useMemo(() => {
    let list = listings.slice();

    if (filters.stayTypes.length) {
      list = list.filter((listing) => filters.stayTypes.some((type) => listing.stayTypes.includes(type)));
    }
    if (filters.durations.length) {
      list = list.filter((listing) =>
        filters.durations.some((duration) => {
          const key = duration === "24" ? "full-day" : duration;
          return listing.pricing.find((tier) => tier.key === key)?.available;
        }),
      );
    }
    if (filters.areas.length) {
      list = list.filter((listing) => filters.areas.includes(listing.locality));
    }
    if (filters.ratings.length) {
      const minRating = Math.min(...filters.ratings);
      list = list.filter((listing) => listing.rating >= minRating);
    }
    if (filters.categories.length) {
      list = list.filter((listing) => filters.categories.includes(listing.category));
    }
    if (filters.popularTags.length) {
      list = list.filter((listing) => filters.popularTags.every((tag) => listing.popularTags.includes(tag)));
    }
    if (filters.chains.length) {
      list = list.filter((listing) => filters.chains.includes(listing.chain));
    }
    if (filters.amenities.length) {
      list = list.filter((listing) => filters.amenities.every((item) => listing.amenities.includes(item)));
    }
    list = list.filter((listing) => listing.bestPrice >= filters.priceMin && listing.bestPrice <= filters.priceMax);

    const sorted = [...list];
    if (filters.sort === "popularity") sorted.sort((a, b) => Number(b.popular) - Number(a.popular));
    else if (filters.sort === "price-asc") sorted.sort((a, b) => a.bestPrice - b.bestPrice);
    else if (filters.sort === "price-desc") sorted.sort((a, b) => b.bestPrice - a.bestPrice);
    else if (filters.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (filters.sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    else sorted.sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating);

    return sorted;
  }, [citySlug, filters, listings]);

  const visibleListings = filteredListings.slice(0, visibleCount);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 pb-10">
        <HotelSearchBar
          citySlug={citySlug}
          checkIn={checkIn}
          onCheckInChange={setCheckIn}
          checkOut={checkOut}
          onCheckOutChange={setCheckOut}
          guests={guests}
          onGuestsChange={setGuests}
          hotelType={hotelType}
          onHotelTypeChange={setHotelType}
          onSubmit={() => setVisibleCount(PAGE_SIZE)}
        />

        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">{pageLabel}</span>
          </nav>

          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-[#0F172A] sm:text-[34px] lg:text-[42px]">
            {pageLabel} in {cityName}
          </h1>

          <div className="mt-6">
            <PromoStrip />
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-semibold text-[#0F172A]">
              Showing {filteredListings.length} {pageLabel} in {cityName}
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
                <HotelFilterSidebar
                  filters={filters}
                  areas={areas}
                  toggleArrayValue={toggleArrayValue}
                  toggleRating={toggleRating}
                  setSort={setSort}
                  setPriceRange={setPriceRange}
                  clearArrayFilter={clearArrayFilter}
                />
              </div>
            </aside>

            <div className="min-w-0">
              {loading ? (
                <div className="flex flex-col gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <HotelCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[#E2E8F0] bg-white text-center">
                  <span className="text-4xl">🏨</span>
                  <p className="text-base font-bold text-[#0F172A]">No Hotels Found</p>
                  <p className="text-sm text-[#64748B]">Try changing filters.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {visibleListings.map((listing) => (
                    <HotelListingCard key={listing.id} listing={listing} />
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
                <BokkoExpertCard />
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
              <HotelFilterSidebar
                filters={filters}
                areas={areas}
                toggleArrayValue={toggleArrayValue}
                toggleRating={toggleRating}
                setSort={setSort}
                setPriceRange={setPriceRange}
                clearArrayFilter={clearArrayFilter}
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
