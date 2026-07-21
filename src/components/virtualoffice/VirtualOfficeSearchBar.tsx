import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { METROS, NEAR_ME_SLUG, cityNavTarget } from "../../data/metros";

interface VirtualOfficeSearchBarProps {
  citySlug: string;
  near?: boolean;
  area: string;
  onAreaChange: (value: string) => void;
  gstRequired: boolean;
  onGstRequiredChange: (value: boolean) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  onSubmit: () => void;
}

const priceRangeOptions = ["Any Budget", "Under ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "₹3000+"];

const fieldClass =
  "flex h-14 flex-1 flex-col gap-0.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 transition-colors focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15";

export default function VirtualOfficeSearchBar({
  citySlug,
  near = false,
  area,
  onAreaChange,
  gstRequired,
  onGstRequiredChange,
  priceRange,
  onPriceRangeChange,
  onSubmit,
}: VirtualOfficeSearchBarProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-20 z-30 w-full border-b border-[#E2E8F0] bg-white/95 px-4 py-3 shadow-soft backdrop-blur-sm sm:px-6 lg:px-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-stretch"
      >
        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">City</span>
          <select
            value={near ? NEAR_ME_SLUG : citySlug}
            onChange={(event) => navigate(cityNavTarget(event.target.value, "virtual-office"))}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            <option value="">All Cities</option>
            {METROS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.label}
              </option>
            ))}
            <option value={NEAR_ME_SLUG}>Near me</option>
          </select>
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Area</span>
          <input
            type="text"
            value={area}
            onChange={(event) => onAreaChange(event.target.value)}
            placeholder="All Areas"
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none placeholder:font-normal placeholder:text-[#94A3B8]"
          />
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            GST Required
          </span>
          <select
            value={gstRequired ? "yes" : "any"}
            onChange={(event) => onGstRequiredChange(event.target.value === "yes")}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            <option value="any">Any</option>
            <option value="yes">GST Eligible Only</option>
          </select>
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Price Range
          </span>
          <select
            value={priceRange}
            onChange={(event) => onPriceRangeChange(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            {priceRangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#111111] px-8 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          <Search size={16} />
          Search
        </button>
      </form>
    </div>
  );
}
