import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../lib/api";
import SectionLabel from "./SectionLabel";

interface CityRow {
  city: string;
  center_count: number;
}

function citySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export default function ExploreCitiesSection() {
  const [cities, setCities] = useState<CityRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ cities: CityRow[] }>("/cities")
      .then((res) => {
        if (!cancelled) setCities(res.cities);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => { cancelled = true; };
  }, []);

  if (cities.length === 0) return null;

  return (
    <section className="m-0">
      <SectionLabel title="Explore by City" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cities.map((row) => (
          <Link
            key={row.city}
            to={`/${citySlug(row.city)}/coworking-spaces`}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center text-sm font-bold text-[#0F172A] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            {row.city}
          </Link>
        ))}
      </div>
    </section>
  );
}
