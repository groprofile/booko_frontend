import { useState } from "react";
import type { AmenityCategory } from "../../data/hotelDetails";
import { resolveAmenityIcon } from "../../lib/amenityIcons";
import SectionLabel from "./SectionLabel";

interface AmenitiesGridProps {
  categories: AmenityCategory[];
}

export default function AmenitiesGrid({ categories }: AmenitiesGridProps) {
  const hasAnyItems = categories.some((c) => c.items.length > 0);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.category ?? "");
  const active = categories.find((c) => c.category === activeCategory) ?? categories[0];

  return (
    <section className="m-0">
      <SectionLabel title="Amenities" />
      {!hasAnyItems || !active ? (
        <p className="text-sm text-muted-text">Not added by the property yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {categories.map((category) => (
              <button
                key={category.category}
                type="button"
                onClick={() => setActiveCategory(category.category)}
                className={
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors " +
                  (activeCategory === category.category
                    ? "bg-primary-blue text-white shadow-soft"
                    : "border border-border text-secondary-text hover:border-muted-text")
                }
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {active.items.map((item) => {
              const Icon = resolveAmenityIcon(item);
              return (
                <span key={item} className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 text-sm font-medium text-secondary-text shadow-soft">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-blue/15 bg-primary-blue/8 text-primary-blue backdrop-blur-sm">
                    <Icon size={15} strokeWidth={1.6} />
                  </span>
                  {item}
                </span>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
