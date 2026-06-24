import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, Users, Briefcase, Search } from "lucide-react";
import LocationField from "./LocationField";
import type { ProductTab, SearchField } from "../data/productTabs";
import { citySlugFromLabel } from "../utils/citySlug";
import { coworkingCities } from "../data/cities";

const fieldIcon = (field: SearchField) => {
  switch (field.type) {
    case "location":
      return MapPin;
    case "date":
      return Calendar;
    case "time":
      return Clock;
    case "number":
      return Users;
    default:
      return field.key === "businessType" ? Briefcase : MapPin;
  }
};

interface SearchCardProps {
  activeTab: ProductTab;
}

const HOTEL_KEYS = new Set(["hotels"]);

export default function SearchCard({ activeTab }: SearchCardProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState<string | null>(null);
  const locationCities = HOTEL_KEYS.has(activeTab.key) ? undefined : coworkingCities;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (activeTab.key === "coworking") {
      navigate(`/${citySlugFromLabel(location)}/coworking-spaces`);
    } else if (activeTab.key === "dayPass") {
      navigate(`/${citySlugFromLabel(location)}/day-pass`);
    } else if (activeTab.key === "monthlyPass") {
      navigate(`/${citySlugFromLabel(location)}/monthly-pass`);
    } else if (activeTab.key === "meetingRooms") {
      navigate(`/${citySlugFromLabel(location)}/meeting-rooms`);
    } else if (activeTab.key === "hotels") {
      navigate(`/${citySlugFromLabel(location)}/hotels`);
    } else if (activeTab.key === "virtualOffice") {
      navigate(`/${citySlugFromLabel(location)}/virtual-office`);
    }
  }

  return (
    <div className="w-full p-5 sm:p-6 lg:p-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-4"
      >
        <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:flex lg:items-stretch lg:gap-0 lg:divide-x lg:divide-[#E2E8F0]">
          {activeTab.fields.map((field) => {
            const wrapperClass = "flex flex-1 flex-col gap-2 lg:px-5 lg:first:pl-0";

            if (field.type === "location") {
              return (
                <div key={`${activeTab.key}-${field.key}`} className={wrapperClass}>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    {field.label}
                  </span>
                  <LocationField
                    placeholder={field.placeholder}
                    value={location}
                    onChange={setLocation}
                    cities={locationCities}
                  />
                </div>
              );
            }

            const Icon = fieldIcon(field);
            return (
              <div key={field.key} className={wrapperClass}>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  {field.label}
                </span>
                <span className="relative flex h-[52px] items-center gap-3 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 transition-colors focus-within:border-[#2563EB] focus-within:bg-white lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0">
                  <Icon size={18} className="shrink-0 text-[#64748B]" />
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    min={field.type === "number" ? 1 : undefined}
                    className="w-full bg-transparent text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="flex h-[52px] w-full shrink-0 items-center justify-center rounded-[18px] bg-[#111111] px-8 text-base font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2563EB] hover:shadow-soft-lg lg:w-auto lg:px-10"
        >
          <span className="-ml-1.5 flex items-center gap-2">
            <Search size={18} />
            {activeTab.ctaLabel}
          </span>
        </button>
      </form>
    </div>
  );
}
