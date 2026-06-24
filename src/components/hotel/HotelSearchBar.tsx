import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { CITY_NAMES } from "../../data/hotelListings";

interface HotelSearchBarProps {
  citySlug: string;
  checkIn: string;
  onCheckInChange: (value: string) => void;
  checkOut: string;
  onCheckOutChange: (value: string) => void;
  guests: number;
  onGuestsChange: (value: number) => void;
  hotelType: string;
  onHotelTypeChange: (value: string) => void;
  onSubmit: () => void;
}

const hotelTypeOptions = [
  "Hourly Stay - 3 Hours",
  "Hourly Stay - 6 Hours",
  "Hourly Stay - 12 Hours",
  "Full Day Stay",
  "Workcation",
  "Business Hotel",
];

const fieldClass =
  "flex h-14 flex-1 flex-col gap-0.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 transition-colors focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15";

export default function HotelSearchBar({
  citySlug,
  checkIn,
  onCheckInChange,
  checkOut,
  onCheckOutChange,
  guests,
  onGuestsChange,
  hotelType,
  onHotelTypeChange,
  onSubmit,
}: HotelSearchBarProps) {
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
            value={citySlug}
            onChange={(event) => navigate(`/${event.target.value}/hotels`)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            {Object.entries(CITY_NAMES).map(([slug, label]) => (
              <option key={slug} value={slug}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Check In</span>
          <input
            type="date"
            value={checkIn}
            onChange={(event) => onCheckInChange(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          />
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Check Out</span>
          <input
            type="date"
            value={checkOut}
            onChange={(event) => onCheckOutChange(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          />
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Guests</span>
          <select
            value={guests}
            onChange={(event) => onGuestsChange(Number(event.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldClass + " lg:flex-[1.3]"}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Hotel Type
          </span>
          <select
            value={hotelType}
            onChange={(event) => onHotelTypeChange(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            <option value="">Any Hotel Type</option>
            {hotelTypeOptions.map((option) => (
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
