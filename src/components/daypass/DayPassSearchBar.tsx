import { useNavigate } from "react-router-dom";
import { METROS, NEAR_ME_SLUG, cityNavTarget } from "../../data/metros";

interface DayPassSearchBarProps {
  citySlug: string;
  near?: boolean;
  date: string;
  onDateChange: (value: string) => void;
  members: number;
  onMembersChange: (value: number) => void;
  location: string;
  onLocationChange: (value: string) => void;
  onSubmit: () => void;
}

const fieldClass =
  "flex h-14 flex-1 flex-col gap-0.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 transition-colors focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15";

export default function DayPassSearchBar({
  citySlug,
  near = false,
  date,
  onDateChange,
  members,
  onMembersChange,
  location,
  onLocationChange,
  onSubmit,
}: DayPassSearchBarProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-3 lg:flex-row lg:items-stretch"
      >
        <div className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Product
          </span>
          <span className="text-sm font-semibold text-[#0F172A]">Day Pass</span>
        </div>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Booking Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          />
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Members
          </span>
          <select
            value={members}
            onChange={(event) => onMembersChange(Number(event.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            City
          </span>
          <select
            value={near ? NEAR_ME_SLUG : citySlug}
            onChange={(event) => navigate(cityNavTarget(event.target.value, "day-pass"))}
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

        <label className={fieldClass + " lg:flex-[1.4]"}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Locations
          </span>
          <input
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="All Locations"
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none placeholder:font-normal placeholder:text-[#94A3B8]"
          />
        </label>

        <button
          type="submit"
          className="flex h-14 shrink-0 items-center justify-center rounded-2xl bg-[#111111] px-8 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          View Workspaces
        </button>
      </form>
    </div>
  );
}
