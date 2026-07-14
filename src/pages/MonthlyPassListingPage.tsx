import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MonthlyPassSearchBar from "../components/monthlypass/MonthlyPassSearchBar";
import MonthlyPassOffersRail from "../components/monthlypass/MonthlyPassOffersRail";
import WorkspaceSearchBar from "../components/daypass/WorkspaceSearchBar";
import MonthlyPassFilterSidebar from "../components/monthlypass/MonthlyPassFilterSidebar";
import MonthlyPassListingCard from "../components/monthlypass/MonthlyPassListingCard";
import TalkToExpertCard from "../components/monthlypass/TalkToExpertCard";
import {
  CITY_NAMES,
  allLockInOptions,
  allMonthlyAccessibility,
  allMonthlyBrands,
  allMonthlySeatingTypes,
  allMonthlySpaceTypes,
} from "../data/monthlyPassListings";
import type { MonthlyPassFilters, MonthlyPassListing, MonthlySortOption } from "../data/monthlyPassListings";
import { apiGet } from "../lib/api";
import { apiToMonthlyPassListing, type CentreApiRow } from "../lib/centreAdapter";
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

export default function MonthlyPassListingPage() {
  const params = useParams<{ city: string }>();
  const citySlug = (params.city ?? "mumbai").toLowerCase();
  const cityName = cityLabel(citySlug);

  const [searchParams, setSearchParams] = useSearchParams();
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [members, setMembers] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [listings, setListings] = useState<MonthlyPassListing[]>([]);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    setApiLoading(true);
    apiGet<{ data: CentreApiRow[]; page: number; pageSize: number }>(
      `/centers/list?productType=monthly-pass&city=${encodeURIComponent(cityName)}&pageSize=100`,
    )
      .then((res) => setListings(res.data.map(apiToMonthlyPassListing)))
      .catch(() => setListings([]))
      .finally(() => setApiLoading(false));
  }, [cityName]);

  useEffect(() => {
    document.title = `Monthly Pass in ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book a monthly coworking pass in ${cityName} with Bokko. Compare dedicated desks, private cabins and managed offices instantly.`,
    );
  }, [cityName]);

  const location = searchParams.get("location") ?? "";

  const filters: MonthlyPassFilters = useMemo(() => {
    const parseList = (key: string, options: readonly string[]) => {
      const raw = searchParams.get(key)?.split(",").filter(Boolean) ?? [];
      return raw
        .map((slug) => findByDeslug(options, slug))
        .filter((value): value is string => Boolean(value));
    };
    const spaceTypeSlug = searchParams.get("spaceType");
    return {
      seating: parseList("seating", allMonthlySeatingTypes),
      brands: parseList("brands", allMonthlyBrands),
      accessibility: parseList("accessibility", allMonthlyAccessibility),
      lockIn: parseList("lockIn", allLockInOptions),
      spaceType: spaceTypeSlug ? findByDeslug(allMonthlySpaceTypes, spaceTypeSlug) ?? null : null,
      priceMin: Number(searchParams.get("priceMin") ?? 0),
      priceMax: Number(searchParams.get("priceMax") ?? 25000),
      sort: (searchParams.get("sort") as MonthlySortOption) ?? "recommended",
      q: searchParams.get("q") ?? "",
    };
  }, [searchParams]);

  const activeFilterCount =
    filters.seating.length +
    filters.brands.length +
    filters.accessibility.length +
    filters.lockIn.length +
    (filters.spaceType ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 25000 ? 1 : 0);

  function updateParams(updater: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next, { replace: true });
  }

  function toggleArrayValue(key: "seating" | "brands" | "accessibility" | "lockIn", rawValue: string) {
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

  function setSort(value: MonthlySortOption) {
    updateParams((next) => {
      if (value === "recommended") next.delete("sort");
      else next.set("sort", value);
    });
  }

  function setPriceRange(min: number, max: number) {
    updateParams((next) => {
      if (min > 0) next.set("priceMin", String(min));
      else next.delete("priceMin");
      if (max < 25000) next.set("priceMax", String(max));
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
      list = list.filter((listing) => filters.seating.some((s) => listing.seatingTypes.includes(s)));
    }
    if (filters.brands.length) {
      list = list.filter((listing) => filters.brands.includes(listing.brand));
    }
    if (filters.accessibility.length) {
      list = list.filter((listing) => filters.accessibility.every((a) => listing.accessibility.includes(a)));
    }
    if (filters.lockIn.length) {
      list = list.filter((listing) => filters.lockIn.includes(listing.lockIn));
    }
    if (filters.spaceType) {
      list = list.filter((listing) => listing.spaceType === filters.spaceType);
    }
    list = list.filter((listing) => listing.price >= filters.priceMin && listing.price <= filters.priceMax);

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
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">Monthly Pass</span>
          </nav>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            Book a Monthly Coworking Pass in {cityName}
          </h1>

          <div className="mt-6">
            <MonthlyPassSearchBar
              citySlug={citySlug}
              startDate={startDate}
              onStartDateChange={setStartDate}
              members={members}
              onMembersChange={setMembers}
              location={location}
              onLocationChange={setLocationQuery}
              onSubmit={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
          </div>

          <div className="mt-8">
            <MonthlyPassOffersRail />
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

          <div className="mt-4 lg:hidden">
            <TalkToExpertCard />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr_300px]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <MonthlyPassFilterSidebar
                  filters={filters}
                  toggleArrayValue={toggleArrayValue}
                  setSpaceType={setSpaceType}
                  setSort={setSort}
                  setPriceRange={setPriceRange}
                />
              </div>
            </aside>

            <div>
              {apiLoading ? (
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
                    <MonthlyPassListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TalkToExpertCard />
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
              <MonthlyPassFilterSidebar
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
