import { Building2 } from "lucide-react";
import { popularCities } from "../data/popularCities";

export default function PopularCitiesSection() {
  return (
    <section className="w-full bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl">
          Popular Cities
        </h2>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Explore Bokko across India&apos;s top cities.
        </p>

        <div className="scrollbar-hide mt-8 flex justify-start gap-x-8 gap-y-6 overflow-x-auto pb-1 lg:justify-center">
          {popularCities.map((city) => (
            <a key={city.id} href="#" className="group flex shrink-0 flex-col items-center gap-3">
              {city.isAll ? (
                <span className="flex h-24 w-24 items-center justify-center rounded-[18px] bg-[#111111] transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-soft-lg">
                  <Building2 size={32} strokeWidth={1.75} className="text-white" />
                </span>
              ) : (
                <img
                  src={city.image}
                  alt={city.name}
                  loading="lazy"
                  className="h-24 w-24 rounded-[18px] object-cover transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-soft-lg"
                />
              )}
              <span className="text-center text-[15px] font-semibold text-[#111111] transition-colors duration-300 group-hover:text-[#2563EB] sm:text-base">
                {city.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
