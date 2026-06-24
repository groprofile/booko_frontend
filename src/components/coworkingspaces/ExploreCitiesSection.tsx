import { Link } from "react-router-dom";
import { CITY_NAMES, comingSoonCities } from "../../data/coworkingSpaces";
import SectionLabel from "./SectionLabel";

export default function ExploreCitiesSection() {
  return (
    <section>
      <SectionLabel title="Explore by City" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(CITY_NAMES).map(([slug, label]) => (
          <Link
            key={slug}
            to={`/${slug}/coworking-spaces`}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center text-sm font-bold text-[#0F172A] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            {label}
          </Link>
        ))}
        {comingSoonCities.map((city) => (
          <span
            key={city.slug}
            className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center text-sm font-bold text-[#94A3B8]"
          >
            {city.label}
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#CBD5E1]">Coming Soon</span>
          </span>
        ))}
      </div>
    </section>
  );
}
