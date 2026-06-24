import { useState } from "react";
import {
  allLockInOptions,
  allMonthlyAccessibility,
  allMonthlyBrands,
  allMonthlySeatingTypes,
  allMonthlySpaceTypes,
} from "../../data/monthlyPassListings";
import type { MonthlyPassFilters, MonthlySortOption } from "../../data/monthlyPassListings";

interface MonthlyPassFilterSidebarProps {
  filters: MonthlyPassFilters;
  toggleArrayValue: (key: "seating" | "brands" | "accessibility" | "lockIn", value: string) => void;
  setSpaceType: (value: string | null) => void;
  setSort: (value: MonthlySortOption) => void;
  setPriceRange: (min: number, max: number) => void;
}

const sortOptions: { value: MonthlySortOption; label: string }[] = [
  { value: "recommended", label: "Popularity" },
  { value: "distance", label: "Distance (from city center)" },
  { value: "price-asc", label: "Price (L-H)" },
  { value: "price-desc", label: "Price (H-L)" },
];

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
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

export default function MonthlyPassFilterSidebar({
  filters,
  toggleArrayValue,
  setSpaceType,
  setSort,
  setPriceRange,
}: MonthlyPassFilterSidebarProps) {
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const visibleBrands = brandsExpanded ? allMonthlyBrands : allMonthlyBrands.slice(0, 4);

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h3 className="text-sm font-bold text-[#0F172A]">Seating Options</h3>
        <div className="mt-2 flex flex-col">
          {allMonthlySeatingTypes.map((seating) => (
            <CheckboxRow
              key={seating}
              label={seating}
              checked={filters.seating.includes(seating)}
              onChange={() => toggleArrayValue("seating", seating)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Sort By</h3>
        <div className="mt-2 flex flex-col gap-1.5">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 py-0.5">
              <input
                type="radio"
                name="monthly-sort"
                checked={filters.sort === option.value}
                onChange={() => setSort(option.value)}
                className="h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[#334155]">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Space Type</h3>
        <div className="mt-2 flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-center gap-2.5 py-0.5">
            <input
              type="radio"
              name="monthly-spaceType"
              checked={filters.spaceType === null}
              onChange={() => setSpaceType(null)}
              className="h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-[#334155]">All</span>
          </label>
          {allMonthlySpaceTypes.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2.5 py-0.5">
              <input
                type="radio"
                name="monthly-spaceType"
                checked={filters.spaceType === type}
                onChange={() => setSpaceType(type)}
                className="h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[#334155]">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Price Per Month</h3>
        <p className="mt-2 text-xs text-[#64748B]">
          ₹{filters.priceMin.toLocaleString()} - ₹{filters.priceMax.toLocaleString()}
        </p>
        <div className="relative mt-4 h-1.5 rounded-full bg-[#E2E8F0]">
          <div
            className="absolute h-1.5 rounded-full bg-[#2563EB]"
            style={{
              left: `${(filters.priceMin / 25000) * 100}%`,
              right: `${100 - (filters.priceMax / 25000) * 100}%`,
            }}
          />
          <input
            type="range"
            min={0}
            max={25000}
            step={500}
            value={filters.priceMin}
            onChange={(event) =>
              setPriceRange(Math.min(Number(event.target.value), filters.priceMax - 500), filters.priceMax)
            }
            className="price-range-thumb pointer-events-none absolute inset-x-0 -top-2.5 h-6 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={0}
            max={25000}
            step={500}
            value={filters.priceMax}
            onChange={(event) =>
              setPriceRange(filters.priceMin, Math.max(Number(event.target.value), filters.priceMin + 500))
            }
            className="price-range-thumb pointer-events-none absolute inset-x-0 -top-2.5 h-6 w-full appearance-none bg-transparent"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#94A3B8]">
          <span>₹0</span>
          <span>₹25,000+</span>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Lock-in Period</h3>
        <div className="mt-2 flex flex-col">
          {allLockInOptions.map((option) => (
            <CheckboxRow
              key={option}
              label={option}
              checked={filters.lockIn.includes(option)}
              onChange={() => toggleArrayValue("lockIn", option)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Brands</h3>
        <div className="mt-2 flex flex-col">
          {visibleBrands.map((brand) => (
            <CheckboxRow
              key={brand}
              label={brand}
              checked={filters.brands.includes(brand)}
              onChange={() => toggleArrayValue("brands", brand)}
            />
          ))}
        </div>
        {!brandsExpanded && allMonthlyBrands.length > 4 && (
          <button
            type="button"
            onClick={() => setBrandsExpanded(true)}
            className="mt-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            View all ({allMonthlyBrands.length})
          </button>
        )}
      </div>

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Workspace Accessibility</h3>
        <div className="mt-2 flex flex-col">
          {allMonthlyAccessibility.map((item) => (
            <CheckboxRow
              key={item}
              label={item}
              checked={filters.accessibility.includes(item)}
              onChange={() => toggleArrayValue("accessibility", item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
