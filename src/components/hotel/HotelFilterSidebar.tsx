import { useState } from "react";
import type { ReactNode } from "react";
import { allDurations, allRatingThresholds } from "../../data/hotelListings";
import type { HotelFilters, HotelSortOption } from "../../data/hotelListings";

type ArrayFilterKey = "stayTypes" | "durations" | "areas" | "categories" | "popularTags" | "chains" | "amenities";

interface HotelFilterSidebarProps {
  filters: HotelFilters;
  stayTypeOptions: string[];
  areaOptions: string[];
  categoryOptions: string[];
  popularTagOptions: string[];
  chainOptions: string[];
  amenityOptions: string[];
  toggleArrayValue: (key: ArrayFilterKey, value: string) => void;
  toggleRating: (value: number) => void;
  setSort: (value: HotelSortOption) => void;
  setPriceRange: (min: number, max: number) => void;
  clearArrayFilter: (key: ArrayFilterKey) => void;
}

const sortOptions: { value: HotelSortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "popularity", label: "Popularity" },
  { value: "price-asc", label: "Price Low To High" },
  { value: "price-desc", label: "Price High To Low" },
  { value: "rating", label: "Rating" },
  { value: "distance", label: "Distance" },
];

const PRICE_MIN = 300;
const PRICE_MAX = 5000;

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

function FilterCard({
  title,
  onClear,
  children,
}: {
  title: string;
  onClear?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
        {onClear && (
          <button type="button" onClick={onClear} className="text-xs font-semibold text-[#DC2626] hover:underline">
            Clear
          </button>
        )}
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export default function HotelFilterSidebar({
  filters,
  stayTypeOptions,
  areaOptions,
  categoryOptions,
  popularTagOptions,
  chainOptions,
  amenityOptions,
  toggleArrayValue,
  toggleRating,
  setSort,
  setPriceRange,
  clearArrayFilter,
}: HotelFilterSidebarProps) {
  const [areaQuery, setAreaQuery] = useState("");
  const visibleAreas = areaOptions.filter((area) => area.toLowerCase().includes(areaQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-5">
      {stayTypeOptions.length > 1 && (
        <FilterCard title="Stay Type" onClear={() => clearArrayFilter("stayTypes")}>
          <div className="flex flex-col">
            {stayTypeOptions.map((type) => (
              <CheckboxRow
                key={type}
                label={type}
                checked={filters.stayTypes.includes(type)}
                onChange={() => toggleArrayValue("stayTypes", type)}
              />
            ))}
          </div>
        </FilterCard>
      )}

      <FilterCard title="Duration" onClear={() => clearArrayFilter("durations")}>
        <div className="flex flex-col">
          {allDurations.map((duration) => (
            <CheckboxRow
              key={duration}
              label={`${duration} Hours`}
              checked={filters.durations.includes(duration)}
              onChange={() => toggleArrayValue("durations", duration)}
            />
          ))}
        </div>
      </FilterCard>

      {areaOptions.length > 0 && (
        <FilterCard title="Areas" onClear={() => clearArrayFilter("areas")}>
          <div className="relative">
            <input
              type="text"
              value={areaQuery}
              onChange={(event) => setAreaQuery(event.target.value)}
              placeholder="Search areas"
              className="mb-2 h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
            />
          </div>
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
      )}

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
            step={100}
            value={filters.priceMin}
            onChange={(event) =>
              setPriceRange(Math.min(Number(event.target.value), filters.priceMax - 100), filters.priceMax)
            }
            className="price-range-thumb pointer-events-none absolute inset-x-0 -top-2.5 h-6 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100}
            value={filters.priceMax}
            onChange={(event) =>
              setPriceRange(filters.priceMin, Math.max(Number(event.target.value), filters.priceMin + 100))
            }
            className="price-range-thumb pointer-events-none absolute inset-x-0 -top-2.5 h-6 w-full appearance-none bg-transparent"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#94A3B8]">
          <span>₹{PRICE_MIN}</span>
          <span>₹{PRICE_MAX.toLocaleString()}+</span>
        </div>
      </FilterCard>

      <FilterCard title="Ratings">
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

      {categoryOptions.length > 1 && (
        <FilterCard title="Hotel Categories" onClear={() => clearArrayFilter("categories")}>
          <div className="flex flex-col">
            {categoryOptions.map((category) => (
              <CheckboxRow
                key={category}
                label={category}
                checked={filters.categories.includes(category)}
                onChange={() => toggleArrayValue("categories", category)}
              />
            ))}
          </div>
        </FilterCard>
      )}

      {popularTagOptions.length > 0 && (
        <FilterCard title="Popular Tags" onClear={() => clearArrayFilter("popularTags")}>
          <div className="flex flex-wrap gap-2">
            {popularTagOptions.map((tag) => (
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
      )}

      {chainOptions.length > 0 && (
        <FilterCard title="Hotel Provider" onClear={() => clearArrayFilter("chains")}>
          <div className="flex flex-col">
            {chainOptions.map((chain) => (
              <CheckboxRow
                key={chain}
                label={chain}
                checked={filters.chains.includes(chain)}
                onChange={() => toggleArrayValue("chains", chain)}
              />
            ))}
          </div>
        </FilterCard>
      )}

      {amenityOptions.length > 0 && (
        <FilterCard title="Amenities" onClear={() => clearArrayFilter("amenities")}>
          <div className="flex flex-col">
            {amenityOptions.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                checked={filters.amenities.includes(item)}
                onChange={() => toggleArrayValue("amenities", item)}
              />
            ))}
          </div>
        </FilterCard>
      )}

      <FilterCard title="Sort By">
        <div className="flex flex-col gap-1.5">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 py-0.5">
              <input
                type="radio"
                name="hotel-sort"
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
