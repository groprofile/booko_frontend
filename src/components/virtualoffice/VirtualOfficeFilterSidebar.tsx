import { useState } from "react";
import type { ReactNode } from "react";
import {
  allBrands,
  allBuildingTypes,
  allDurations,
  allPopularTags,
  allRatingThresholds,
  allServices,
} from "../../data/virtualOfficeListings";
import type { VirtualOfficeFilters, VOSortOption } from "../../data/virtualOfficeListings";

type ArrayFilterKey = "areas" | "services" | "durations" | "popularTags" | "buildingTypes" | "brands";

interface VirtualOfficeFilterSidebarProps {
  filters: VirtualOfficeFilters;
  areas: string[];
  toggleArrayValue: (key: ArrayFilterKey, value: string) => void;
  toggleRating: (value: number) => void;
  setSort: (value: VOSortOption) => void;
  setPriceRange: (min: number, max: number) => void;
}

const sortOptions: { value: VOSortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "popularity", label: "Popularity" },
  { value: "price-asc", label: "Price Low To High" },
  { value: "price-desc", label: "Price High To Low" },
  { value: "rating", label: "Rating" },
];

const PRICE_MIN = 500;
const PRICE_MAX = 2000;

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
      />
      <span className="text-sm text-[#334155]">{label}</span>
    </label>
  );
}

function FilterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5">
      <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export default function VirtualOfficeFilterSidebar({
  filters,
  areas,
  toggleArrayValue,
  toggleRating,
  setSort,
  setPriceRange,
}: VirtualOfficeFilterSidebarProps) {
  const [areaQuery, setAreaQuery] = useState("");
  const visibleAreas = areas.filter((area) => area.toLowerCase().includes(areaQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-5">
      <FilterCard title="Areas">
        <input
          type="text"
          value={areaQuery}
          onChange={(event) => setAreaQuery(event.target.value)}
          placeholder="Search area"
          className="mb-2 h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
        />
        <div className="flex max-h-44 flex-col overflow-y-auto">
          {visibleAreas.map((area) => (
            <CheckboxRow
              key={area}
              label={area}
              checked={filters.areas.includes(area)}
              onChange={() => toggleArrayValue("areas", area)}
            />
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Services Included">
        <div className="flex flex-col">
          {allServices.map((service) => (
            <CheckboxRow
              key={service}
              label={service}
              checked={filters.services.includes(service)}
              onChange={() => toggleArrayValue("services", service)}
            />
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Plan Duration">
        <div className="flex flex-col">
          {allDurations.map((duration) => (
            <CheckboxRow
              key={duration}
              label={duration}
              checked={filters.durations.includes(duration)}
              onChange={() => toggleArrayValue("durations", duration)}
            />
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Price Range">
        <p className="text-xs text-[#64748B]">
          ₹{filters.priceMin.toLocaleString()} - ₹{filters.priceMax.toLocaleString()}
        </p>
        <div className="relative mt-4 h-1.5 rounded-full bg-[#E2E8F0]">
          <div
            className="absolute h-1.5 rounded-full bg-[#2563EB]"
            style={{
              left: `${((filters.priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
              right: `${100 - ((filters.priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            value={filters.priceMin}
            onChange={(event) =>
              setPriceRange(Math.min(Number(event.target.value), filters.priceMax - 50), filters.priceMax)
            }
            className="price-range-thumb pointer-events-none absolute inset-x-0 -top-2.5 h-6 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={50}
            value={filters.priceMax}
            onChange={(event) =>
              setPriceRange(filters.priceMin, Math.max(Number(event.target.value), filters.priceMin + 50))
            }
            className="price-range-thumb pointer-events-none absolute inset-x-0 -top-2.5 h-6 w-full appearance-none bg-transparent"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#94A3B8]">
          <span>₹{PRICE_MIN}</span>
          <span>₹{PRICE_MAX.toLocaleString()}+</span>
        </div>
      </FilterCard>

      <FilterCard title="Popular Tags">
        <div className="flex flex-wrap gap-2">
          {allPopularTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleArrayValue("popularTags", tag)}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
                (filters.popularTags.includes(tag)
                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                  : "border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8]")
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Building Type">
        <div className="flex flex-col">
          {allBuildingTypes.map((type) => (
            <CheckboxRow
              key={type}
              label={type}
              checked={filters.buildingTypes.includes(type)}
              onChange={() => toggleArrayValue("buildingTypes", type)}
            />
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Brands">
        <div className="flex flex-col">
          {allBrands.map((brand) => (
            <CheckboxRow
              key={brand}
              label={brand}
              checked={filters.brands.includes(brand)}
              onChange={() => toggleArrayValue("brands", brand)}
            />
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Rating">
        <div className="flex flex-wrap gap-2">
          {allRatingThresholds.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => toggleRating(rating)}
              className={
                "flex flex-1 min-w-[70px] flex-col items-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors " +
                (filters.ratings.includes(rating)
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8]")
              }
            >
              ★ {rating}+
            </button>
          ))}
        </div>
      </FilterCard>

      <FilterCard title="Sort By">
        <div className="flex flex-col gap-1.5">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 py-0.5">
              <input
                type="radio"
                name="vo-sort"
                checked={filters.sort === option.value}
                onChange={() => setSort(option.value)}
                className="h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[#334155]">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterCard>
    </div>
  );
}
