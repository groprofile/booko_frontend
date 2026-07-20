import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TopSearchBar from "../components/coworkingspaces/TopSearchBar";
import RecommendedSection from "../components/coworkingspaces/RecommendedSection";
import type { Persona } from "../components/coworkingspaces/RecommendedSection";
import FilterSidebar from "../components/coworkingspaces/FilterSidebar";
import type { ToggleFilters } from "../components/coworkingspaces/FilterSidebar";
import WorkspaceCard from "../components/coworkingspaces/WorkspaceCard";
import WorkspaceCardSkeleton from "../components/coworkingspaces/WorkspaceCardSkeleton";
import TrustSection from "../components/coworkingspaces/TrustSection";
import BokkoExpertCard from "../components/coworkingspaces/BokkoExpertCard";
import BokkoExpertWidget from "../components/coworkingspaces/BokkoExpertWidget";
import SimilarWorkspacesCarousel from "../components/coworkingspaces/SimilarWorkspacesCarousel";
import ExploreCitiesSection from "../components/coworkingspaces/ExploreCitiesSection";
import { CITY_NAMES, allProviders, sortSpaces } from "../data/coworkingSpaces";
import type { CoworkingSpace, ServiceKey, SortOption } from "../data/coworkingSpaces";
import { apiGet } from "../lib/api";
import { apiToCoworkingSpace, type CentreApiRow } from "../lib/centreAdapter";
import { findByDeslug, slugify } from "../utils/slug";
import {
  METROS, metroBySlug, centerInMetro, haversineKm,
  NEAR_ME_SLUG, NEAR_ME_RADIUS_KM,
} from "../data/metros";
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

export default function CoworkingSpacesListingPage() {
  const params = useParams<{ city?: string }>();
  const lockedCitySlug = params.city ? params.city.toLowerCase() : null;
  const cityName = lockedCitySlug ? cityLabel(lockedCitySlug) : "India";

  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listings, setListings] = useState<CoworkingSpace[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const geo = useGeolocation();

  // Curated top-metro list + "Near me" — always shown, never derived from the
  // (dirty, free-text) center city data.
  const cityOptions = useMemo(
    () => [
      ...METROS.map((m) => ({ slug: m.slug, label: m.label })),
      { slug: NEAR_ME_SLUG, label: "Near me" },
    ],
    [],
  );

  const fetchListings = useCallback(() => {
    setApiLoading(true);
    // For a city-locked route, narrow the fetch by the metro's geo box so
    // Thane/Navi Mumbai (etc.) come back too; we tighten to the exact radius
    // client-side below. Falls back to a plain city= filter for unknown slugs.
    const metro = metroBySlug(lockedCitySlug);
    let scope = "";
    if (metro) scope = `&lat=${metro.lat}&lng=${metro.lng}&radius=${metro.radiusKm}`;
    else if (lockedCitySlug) scope = `&city=${encodeURIComponent(cityName)}`;
    apiGet<{ data: CentreApiRow[]; page: number; pageSize: number }>(
      `/centers/list?pageSize=200${scope}`,
    )
      .then((res) => setListings(res.data.map(apiToCoworkingSpace)))
      .catch(() => setListings([]))
      .finally(() => setApiLoading(false));
  }, [lockedCitySlug, cityName]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    document.title = lockedCitySlug
      ? `Coworking Spaces in ${cityName} | Bokko`
      : `Coworking Spaces in India | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      lockedCitySlug
        ? `Discover every coworking space in ${cityName}. Compare day pass, meeting room, monthly pass and virtual office pricing on Bokko.`
        : `Discover coworking spaces across India. Compare day pass, meeting room, monthly pass and virtual office pricing on Bokko.`,
    );
  }, [lockedCitySlug, cityName]);

  const query = searchParams.get("q") ?? "";
  const area = searchParams.get("area") ?? "";
  const selectedCities = lockedCitySlug ? [lockedCitySlug] : searchParams.get("cities")?.split(",").filter(Boolean) ?? [];
  const selectedProviders = useMemo(
    () => (searchParams.get("providers")?.split(",").filter(Boolean) ?? []).map((slug) => findByDeslug(allProviders, slug)).filter((v): v is string => Boolean(v)),
    [searchParams],
  );
  const selectedServices = (searchParams.get("services")?.split(",").filter(Boolean) ?? []) as ServiceKey[];
  const sort = (searchParams.get("sort") as SortOption) ?? "popularity";
  const persona = (searchParams.get("persona") as Persona | null) ?? null;

  const toggles: ToggleFilters = {
    metroConnectivity: searchParams.get("metro") === "1",
    parking: searchParams.get("parking") === "1",
    access247: searchParams.get("access247") === "1",
    premium: searchParams.get("premium") === "1",
    topRated: searchParams.get("topRated") === "1",
    instantBooking: searchParams.get("instant") === "1",
    corporateFriendly: searchParams.get("corporate") === "1",
  };

  function updateParams(updater: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next, { replace: true });
  }

  function setQuery(value: string) {
    updateParams((next) => (value ? next.set("q", value) : next.delete("q")));
  }
  function setArea(value: string) {
    updateParams((next) => (value ? next.set("area", value) : next.delete("area")));
  }
  function toggleCity(citySlug: string) {
    // Turning "Near me" on triggers a geolocation request.
    const current = searchParams.get("cities")?.split(",").filter(Boolean) ?? [];
    if (citySlug === NEAR_ME_SLUG && !current.includes(NEAR_ME_SLUG)) geo.request();
    updateParams((next) => {
      const list = next.get("cities")?.split(",").filter(Boolean) ?? [];
      const nextList = list.includes(citySlug) ? list.filter((c) => c !== citySlug) : [...list, citySlug];
      if (nextList.length) next.set("cities", nextList.join(","));
      else next.delete("cities");
    });
  }
  function setSingleCity(citySlug: string) {
    if (citySlug === NEAR_ME_SLUG) geo.request();
    updateParams((next) => (citySlug ? next.set("cities", citySlug) : next.delete("cities")));
  }
  function toggleProvider(provider: string) {
    updateParams((next) => {
      const slug = slugify(provider);
      const current = next.get("providers")?.split(",").filter(Boolean) ?? [];
      const nextList = current.includes(slug) ? current.filter((p) => p !== slug) : [...current, slug];
      if (nextList.length) next.set("providers", nextList.join(","));
      else next.delete("providers");
    });
  }
  function toggleService(key: ServiceKey) {
    updateParams((next) => {
      const current = next.get("services")?.split(",").filter(Boolean) ?? [];
      const nextList = current.includes(key) ? current.filter((s) => s !== key) : [...current, key];
      if (nextList.length) next.set("services", nextList.join(","));
      else next.delete("services");
    });
  }
  function toggleFlag(key: keyof ToggleFilters) {
    const paramKey: Record<keyof ToggleFilters, string> = {
      metroConnectivity: "metro",
      parking: "parking",
      access247: "access247",
      premium: "premium",
      topRated: "topRated",
      instantBooking: "instant",
      corporateFriendly: "corporate",
    };
    updateParams((next) => {
      const k = paramKey[key];
      if (next.get(k) === "1") next.delete(k);
      else next.set(k, "1");
    });
  }
  function setSort(value: SortOption) {
    updateParams((next) => (value === "popularity" ? next.delete("sort") : next.set("sort", value)));
  }
  function selectPersona(value: Persona) {
    updateParams((next) => (next.get("persona") === value ? next.delete("persona") : next.set("persona", value)));
  }

  const nearMeActive = selectedCities.includes(NEAR_ME_SLUG) && geo.coords != null;

  const filteredSpaces = useMemo(() => {
    let list = listings.slice();

    // City-locked route: tighten the metro geo box to the exact radius + aliases.
    const lockedMetro = metroBySlug(lockedCitySlug);
    if (lockedMetro) {
      list = list.filter((space) => centerInMetro(space, lockedMetro));
    } else if (selectedCities.length) {
      // National view: pass if the space belongs to any selected metro, or is
      // within range of the user when "Near me" is active.
      const activeMetros = METROS.filter((m) => selectedCities.includes(m.slug));
      list = list.filter((space) => {
        const metroMatch = activeMetros.some((m) => centerInMetro(space, m));
        const meMatch =
          nearMeActive &&
          space.latitude != null &&
          space.longitude != null &&
          haversineKm(geo.coords!.lat, geo.coords!.lng, space.latitude, space.longitude) <= NEAR_ME_RADIUS_KM;
        return metroMatch || meMatch;
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((space) => space.name.toLowerCase().includes(q) || space.brand.toLowerCase().includes(q));
    }
    if (area.trim()) {
      const q = area.trim().toLowerCase();
      list = list.filter((space) => space.locality.toLowerCase().includes(q));
    }
    if (selectedProviders.length) {
      list = list.filter((space) => selectedProviders.includes(space.brand));
    }
    if (selectedServices.length) {
      list = list.filter((space) => selectedServices.every((key) => space.serviceKeys.includes(key)));
    }
    if (toggles.metroConnectivity) list = list.filter((space) => space.metroConnectivity);
    if (toggles.parking) list = list.filter((space) => space.parking);
    if (toggles.access247) list = list.filter((space) => space.access247);
    if (toggles.premium) list = list.filter((space) => space.premium);
    if (toggles.topRated) list = list.filter((space) => space.rating >= 4.5);
    if (toggles.instantBooking) list = list.filter((space) => space.instantBooking);
    if (toggles.corporateFriendly) list = list.filter((space) => space.corporateFriendly);

    if (persona === "freelancers") list = list.filter((space) => space.serviceKeys.includes("dayPass"));
    else if (persona === "startups")
      list = list.filter((space) => !space.premium && (space.serviceKeys.includes("dayPass") || space.serviceKeys.includes("monthlyPass")));
    else if (persona === "remoteTeams") list = list.filter((space) => space.serviceKeys.includes("monthlyPass"));
    else if (persona === "salesTeams") list = list.filter((space) => space.serviceKeys.includes("meetingRoom"));
    else if (persona === "corporateTeams") list = list.filter((space) => space.corporateFriendly);
    else if (persona === "agencies")
      list = list.filter((space) => space.serviceKeys.includes("virtualOffice") && space.serviceKeys.includes("meetingRoom"));

    // "Near me" implies a nearest-first ordering.
    if (nearMeActive) {
      return [...list].sort(
        (a, b) =>
          haversineKm(geo.coords!.lat, geo.coords!.lng, a.latitude ?? 0, a.longitude ?? 0) -
          haversineKm(geo.coords!.lat, geo.coords!.lng, b.latitude ?? 0, b.longitude ?? 0),
      );
    }
    return sortSpaces(list, sort);
  }, [selectedCities, query, area, selectedProviders, selectedServices, toggles, persona, sort, listings, lockedCitySlug, nearMeActive, geo.coords]);

  const activeFilterCount =
    selectedProviders.length +
    selectedServices.length +
    (lockedCitySlug ? 0 : selectedCities.length) +
    Object.values(toggles).filter(Boolean).length;

  const carouselScope = listings;

  const sidebarProps = {
    showCityFilter: !lockedCitySlug,
    cityOptions,
    selectedCities,
    onToggleCity: toggleCity,
    providers: selectedProviders,
    onToggleProvider: toggleProvider,
    services: selectedServices,
    onToggleService: toggleService,
    toggles,
    onToggleFlag: toggleFlag,
    sort,
    onSetSort: setSort,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">Coworking Spaces{lockedCitySlug ? ` in ${cityName}` : ""}</span>
          </nav>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            {lockedCitySlug ? `Coworking Spaces in ${cityName}` : "Coworking Spaces Across India"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
            Every coworking space registered on Bokko — compare day pass, meeting room, monthly pass and virtual office pricing in one place.
          </p>

          <div className="mt-6">
            <TopSearchBar
              query={query}
              onQueryChange={setQuery}
              area={area}
              onAreaChange={setArea}
              citySlug={lockedCitySlug}
              cityOptions={cityOptions}
              selectedCity={selectedCities[0] ?? ""}
              onCityChange={setSingleCity}
            />
          </div>

          <div className="mt-8">
            <RecommendedSection activePersona={persona} onSelectPersona={selectPersona} />
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-semibold text-[#0F172A]">
              Showing {filteredSpaces.length} workspace{filteredSpaces.length === 1 ? "" : "s"}
              {lockedCitySlug ? ` in ${cityName}` : ""}
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

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_300px]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <FilterSidebar {...sidebarProps} />
              </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-12">
              {apiLoading ? (
                <div className="flex flex-col gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <WorkspaceCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredSpaces.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-center">
                  <p className="text-base font-bold text-[#0F172A]">No workspaces match your filters</p>
                  <p className="mt-1 text-sm text-[#64748B]">Try adjusting or clearing some filters.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {filteredSpaces.map((space, i) => (
                    <div key={space.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <WorkspaceCard space={space} />
                    </div>
                  ))}
                </div>
              )}

              <TrustSection />

              <SimilarWorkspacesCarousel spaces={carouselScope} />

              <ExploreCitiesSection />
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <BokkoExpertCard />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <BokkoExpertWidget />

      {filtersOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-[#0F172A]/55" onClick={() => setFiltersOpen(false)} />
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
              <FilterSidebar {...sidebarProps} />
            </div>
            <div className="sticky bottom-0 border-t border-[#E2E8F0] bg-white p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-xl bg-[#111111] py-3.5 text-sm font-bold text-white hover:bg-black"
              >
                Show {filteredSpaces.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
