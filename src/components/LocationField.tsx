import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, LocateFixed, Search } from "lucide-react";
import { indianCities } from "../data/cities";

interface LocationFieldProps {
  placeholder: string;
  value: string | null;
  onChange: (value: string) => void;
  cities?: string[];
}

export const CURRENT_LOCATION = "Use Current Location";

export default function LocationField({ placeholder, value, onChange, cities = indianCities }: LocationFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      const timeout = window.setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => window.clearTimeout(timeout);
    }
  }, [open]);

  const handleSelect = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const optionClass = (isSelected: boolean) =>
    "mb-1.5 flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors last:mb-0 " +
    (isSelected
      ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
      : "border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8] hover:bg-[#F8FAFC]");

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={
          "flex h-[52px] w-full items-center gap-3 rounded-xl border bg-[#F8FAFC] px-3.5 text-left transition-colors focus:outline-none lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 " +
          (open ? "border-[#2563EB] bg-white" : "border-[#CBD5E1]")
        }
      >
        <MapPin size={18} className="shrink-0 text-[#64748B]" />
        <span
          className={"flex-1 truncate text-sm font-medium " + (value ? "text-[#0F172A]" : "text-[#94A3B8]")}
        >
          {value ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={"shrink-0 text-[#94A3B8] transition-transform duration-200 " + (open ? "rotate-180" : "")}
        />
      </button>

      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-white/70 backdrop-blur-[2px]"
          />

          <div className="custom-scroll absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-float">
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
              <Search size={16} className="shrink-0 text-[#64748B]" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city..."
                className="w-full bg-transparent text-sm font-medium text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSelect(CURRENT_LOCATION)}
              className={optionClass(value === CURRENT_LOCATION)}
            >
              <LocateFixed size={16} className="shrink-0" />
              {CURRENT_LOCATION}
            </button>

            <div className="my-1.5 h-px bg-[#E2E8F0]" />

            {filteredCities.length === 0 ? (
              <p className="px-3.5 py-3 text-sm text-[#94A3B8]">No cities found.</p>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={optionClass(value === city)}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
