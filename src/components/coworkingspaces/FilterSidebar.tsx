import { allServiceOptions } from "../../data/coworkingSpaces";
import type { ServiceKey, SortOption } from "../../data/coworkingSpaces";

export interface ToggleFilters {
  metroConnectivity: boolean;
  parking: boolean;
  access247: boolean;
  premium: boolean;
  topRated: boolean;
  instantBooking: boolean;
  corporateFriendly: boolean;
}

interface FilterSidebarProps {
  showCityFilter: boolean;
  cityOptions: { slug: string; label: string }[];
  selectedCities: string[];
  onToggleCity: (citySlug: string) => void;
  providerOptions: string[];
  providers: string[];
  onToggleProvider: (provider: string) => void;
  services: ServiceKey[];
  onToggleService: (key: ServiceKey) => void;
  toggles: ToggleFilters;
  onToggleFlag: (key: keyof ToggleFilters) => void;
  sort: SortOption;
  onSetSort: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "top-rated", label: "Top Rated" },
  { value: "most-booked", label: "Most Booked" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price Low to High" },
  { value: "price-desc", label: "Price High to Low" },
];

const toggleOptions: { key: keyof ToggleFilters; label: string }[] = [
  { key: "metroConnectivity", label: "Metro Connectivity" },
  { key: "parking", label: "Parking" },
  { key: "access247", label: "24x7 Access" },
  { key: "premium", label: "Premium Spaces" },
  { key: "topRated", label: "Top Rated" },
  { key: "instantBooking", label: "Instant Booking" },
  { key: "corporateFriendly", label: "Corporate Friendly" },
];

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

export default function FilterSidebar({
  showCityFilter,
  cityOptions,
  selectedCities,
  onToggleCity,
  providerOptions,
  providers,
  onToggleProvider,
  services,
  onToggleService,
  toggles,
  onToggleFlag,
  sort,
  onSetSort,
}: FilterSidebarProps) {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h3 className="text-sm font-bold text-[#0F172A]">Sort By</h3>
        <div className="mt-2 flex flex-col gap-1.5">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2.5 py-0.5">
              <input
                type="radio"
                name="sort"
                checked={sort === option.value}
                onChange={() => onSetSort(option.value)}
                className="h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[#334155]">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {showCityFilter && (
        <div className="border-t border-[#E2E8F0] pt-6">
          <h3 className="text-sm font-bold text-[#0F172A]">City</h3>
          <div className="mt-2 flex flex-col">
            {cityOptions.map(({ slug, label }) => (
              <CheckboxRow key={slug} label={label} checked={selectedCities.includes(slug)} onChange={() => onToggleCity(slug)} />
            ))}
          </div>
        </div>
      )}

      {providerOptions.length > 0 && (
        <div className="border-t border-[#E2E8F0] pt-6">
          <h3 className="text-sm font-bold text-[#0F172A]">Provider</h3>
          <div className="mt-2 flex flex-col">
            {providerOptions.map((provider) => (
              <CheckboxRow key={provider} label={provider} checked={providers.includes(provider)} onChange={() => onToggleProvider(provider)} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Workspace Features</h3>
        <div className="mt-2 flex flex-col">
          {toggleOptions.map((option) => (
            <CheckboxRow key={option.key} label={option.label} checked={toggles[option.key]} onChange={() => onToggleFlag(option.key)} />
          ))}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-bold text-[#0F172A]">Services Offered</h3>
        <div className="mt-2 flex flex-col">
          {allServiceOptions.map((option) => (
            <CheckboxRow key={option.key} label={option.label} checked={services.includes(option.key)} onChange={() => onToggleService(option.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}
