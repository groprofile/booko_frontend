import { useState } from "react";
import type { ReactNode } from "react";
import type { MeetingRoomFilters, MeetingSortOption } from "../../data/meetingRoomListings";

type ArrayFilterKey = "roomTypes" | "seatingCapacity" | "equipment" | "brands" | "amenities" | "bookingOptions";

interface MeetingRoomFilterSidebarProps {
  filters: MeetingRoomFilters;
  roomTypeOptions: string[];
  seatingCapacityOptions: string[];
  equipmentOptions: string[];
  brandOptions: string[];
  amenityOptions: string[];
  bookingOptionOptions: string[];
  toggleArrayValue: (key: ArrayFilterKey, value: string) => void;
  setSort: (value: MeetingSortOption) => void;
  setPriceRange: (min: number, max: number) => void;
}

const sortOptions: { value: MeetingSortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "distance", label: "Distance (from city center)" },
  { value: "price-asc", label: "Price (L-H)" },
  { value: "price-desc", label: "Price (H-L)" },
  { value: "capacity-asc", label: "Capacity (L-H)" },
  { value: "capacity-desc", label: "Capacity (H-L)" },
];

const PRICE_MIN = 200;
const PRICE_MAX = 20000;

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

function FilterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5">
      <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export default function MeetingRoomFilterSidebar({
  filters,
  roomTypeOptions,
  seatingCapacityOptions,
  equipmentOptions,
  brandOptions,
  amenityOptions,
  bookingOptionOptions,
  toggleArrayValue,
  setSort,
  setPriceRange,
}: MeetingRoomFilterSidebarProps) {
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const visibleBrands = brandsExpanded ? brandOptions : brandOptions.slice(0, 4);

  return (
    <div className="flex flex-col gap-5">
      {roomTypeOptions.length > 1 && (
        <FilterCard title="Meeting Room Type">
          <div className="flex flex-col">
            {roomTypeOptions.map((type) => (
              <CheckboxRow
                key={type}
                label={type}
                checked={filters.roomTypes.includes(type)}
                onChange={() => toggleArrayValue("roomTypes", type)}
              />
            ))}
          </div>
        </FilterCard>
      )}

      {seatingCapacityOptions.length > 1 && (
        <FilterCard title="Seating Capacity">
          <div className="flex flex-col">
            {seatingCapacityOptions.map((capacity) => (
              <CheckboxRow
                key={capacity}
                label={capacity}
                checked={filters.seatingCapacity.includes(capacity)}
                onChange={() => toggleArrayValue("seatingCapacity", capacity)}
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
                name="meeting-sort"
                checked={filters.sort === option.value}
                onChange={() => setSort(option.value)}
                className="h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[#334155]">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterCard>

      {equipmentOptions.length > 0 && (
        <FilterCard title="Equipment">
          <div className="flex flex-col">
            {equipmentOptions.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                checked={filters.equipment.includes(item)}
                onChange={() => toggleArrayValue("equipment", item)}
              />
            ))}
          </div>
        </FilterCard>
      )}

      {brandOptions.length > 0 && (
        <FilterCard title="Space Provider">
          <div className="flex flex-col">
            {visibleBrands.map((brand) => (
              <CheckboxRow
                key={brand}
                label={brand}
                checked={filters.brands.includes(brand)}
                onChange={() => toggleArrayValue("brands", brand)}
              />
            ))}
          </div>
          {!brandsExpanded && brandOptions.length > 4 && (
            <button
              type="button"
              onClick={() => setBrandsExpanded(true)}
              className="mt-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              View all ({brandOptions.length})
            </button>
          )}
        </FilterCard>
      )}

      <FilterCard title="Price Per Hour">
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

      {amenityOptions.length > 0 && (
        <FilterCard title="Amenities">
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

      {bookingOptionOptions.length > 0 && (
        <FilterCard title="Booking Options">
          <div className="flex flex-col">
            {bookingOptionOptions.map((item) => (
              <CheckboxRow
                key={item}
                label={item}
                checked={filters.bookingOptions.includes(item)}
                onChange={() => toggleArrayValue("bookingOptions", item)}
              />
            ))}
          </div>
        </FilterCard>
      )}
    </div>
  );
}
