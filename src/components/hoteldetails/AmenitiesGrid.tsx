import { useState } from "react";
import { Check } from "lucide-react";
import type { AmenityCategory } from "../../data/hotelDetails";
import SectionLabel from "./SectionLabel";

interface AmenitiesGridProps {
  categories: AmenityCategory[];
}

export default function AmenitiesGrid({ categories }: AmenitiesGridProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.category ?? "");
  const active = categories.find((c) => c.category === activeCategory) ?? categories[0];

  return (
    <section>
      <SectionLabel title="Amenities" />
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
        {categories.map((category) => (
          <button
            key={category.category}
            type="button"
            onClick={() => setActiveCategory(category.category)}
            className={
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors " +
              (activeCategory === category.category
                ? "bg-[#2563EB] text-white"
                : "border border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8]")
            }
          >
            {category.category}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {active?.items.map((item) => (
          <span key={item} className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#334155]">
            <Check size={15} className="text-[#16A34A]" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
