import { Building2, MapPin, Search } from "lucide-react";
import { CITY_NAMES } from "../../data/coworkingSpaces";

interface TopSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  area: string;
  onAreaChange: (value: string) => void;
  citySlug: string | null;
  selectedCity: string;
  onCityChange: (value: string) => void;
}

export default function TopSearchBar({ query, onQueryChange, area, onAreaChange, citySlug, selectedCity, onCityChange }: TopSearchBarProps) {
  return (
    <div className="sticky top-20 z-30 rounded-[20px] border border-[#E2E8F0] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:divide-x sm:divide-[#E2E8F0]">
        <label className="flex flex-1 items-center gap-2.5 px-1 sm:px-4">
          <Search size={17} className="shrink-0 text-[#64748B]" />
          <div className="flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Workspace or Provider</span>
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="WeWork, Awfis, Smartworks, Regus, Indiqube..."
              className="w-full bg-transparent text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>
        </label>

        <label className="flex flex-1 items-center gap-2.5 px-1 sm:px-4">
          <MapPin size={17} className="shrink-0 text-[#64748B]" />
          <div className="flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">Area</span>
            <input
              type="text"
              value={area}
              onChange={(event) => onAreaChange(event.target.value)}
              placeholder="Search area or locality"
              className="w-full bg-transparent text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
            />
          </div>
        </label>

        {!citySlug && (
          <label className="flex flex-1 items-center gap-2.5 px-1 sm:px-4">
            <Building2 size={17} className="shrink-0 text-[#64748B]" />
            <div className="flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">City</span>
              <select
                value={selectedCity}
                onChange={(event) => onCityChange(event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[#0F172A] focus:outline-none"
              >
                <option value="">All Cities</option>
                {Object.entries(CITY_NAMES).map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
