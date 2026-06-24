import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { categoryTabs, recommendedSpaces } from "../data/recommendedSpaces";
import type { RecommendedCategory } from "../data/recommendedSpaces";
import RecommendedSpaceCard from "./RecommendedSpaceCard";

export default function RecommendedSpacesSection() {
  const [activeCategory, setActiveCategory] = useState<RecommendedCategory>(categoryTabs[0]);
  const spaces = recommendedSpaces.filter((space) => space.category === activeCategory);

  return (
    <section className="w-full bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
              Bokko Recommended Spaces
            </h2>
            <p className="mt-3 max-w-xl text-base text-[#64748B] sm:text-lg">
              Handpicked hotels, coworking spaces, meeting rooms and day passes across India.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
          >
            View All
            <ArrowRight size={16} />
          </a>
        </div>

        <div
          className="scrollbar-hide mt-6 flex gap-6 overflow-x-auto"
          role="tablist"
          aria-label="Filter by category"
        >
          {categoryTabs.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={
                  "shrink-0 whitespace-nowrap border-b-2 pb-2 text-sm transition-colors " +
                  (isActive
                    ? "border-[#2563EB] font-bold text-[#0F172A]"
                    : "border-transparent font-medium text-[#64748B] hover:text-[#0F172A]")
                }
              >
                {category}
              </button>
            );
          })}
        </div>

        <div
          key={activeCategory}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {spaces.map((space) => (
            <RecommendedSpaceCard key={space.id} space={space} />
          ))}
        </div>
      </div>
    </section>
  );
}
