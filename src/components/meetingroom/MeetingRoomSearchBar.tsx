import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { CITY_NAMES, allRoomTypes } from "../../data/meetingRoomListings";

interface MeetingRoomSearchBarProps {
  citySlug: string;
  date: string;
  onDateChange: (value: string) => void;
  time: string;
  onTimeChange: (value: string) => void;
  duration: number;
  onDurationChange: (value: number) => void;
  capacity: number;
  onCapacityChange: (value: number) => void;
  roomType: string;
  onRoomTypeChange: (value: string) => void;
  onSubmit: () => void;
}

const fieldClass =
  "flex h-14 flex-1 flex-col gap-0.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 transition-colors focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15";

export default function MeetingRoomSearchBar({
  citySlug,
  date,
  onDateChange,
  time,
  onTimeChange,
  duration,
  onDurationChange,
  capacity,
  onCapacityChange,
  roomType,
  onRoomTypeChange,
  onSubmit,
}: MeetingRoomSearchBarProps) {
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
            onChange={(event) => navigate(`/${event.target.value}/meeting-rooms`)}
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
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Meeting Date
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
            Start Time
          </span>
          <input
            type="time"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          />
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Duration
          </span>
          <select
            value={duration}
            onChange={(event) => onDurationChange(Number(event.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            {[1, 2, 3, 6].map((hours) => (
              <option key={hours} value={hours}>
                {hours} {hours === 1 ? "Hour" : "Hours"}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldClass}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Capacity
          </span>
          <select
            value={capacity}
            onChange={(event) => onCapacityChange(Number(event.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            {[2, 4, 6, 8, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}+ Attendees
              </option>
            ))}
          </select>
        </label>

        <label className={fieldClass + " lg:flex-[1.3]"}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Meeting Room Type
          </span>
          <select
            value={roomType}
            onChange={(event) => onRoomTypeChange(event.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
          >
            <option value="">All Room Types</option>
            {allRoomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#111111] px-8 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          <Search size={16} />
          Search Meeting Rooms
        </button>
      </form>
    </div>
  );
}
