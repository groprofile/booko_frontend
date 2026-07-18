import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { apiGet } from "../lib/api";
import {
  apiToDayPassListing,
  apiToMeetingRoomListing,
  apiToVirtualOfficeListing,
  PRODUCT_TYPE,
  toRating,
  type CentreApiRow,
} from "../lib/centreAdapter";
import RecommendedSpaceCard from "./RecommendedSpaceCard";
import type { RecommendedSpaceCardData } from "./RecommendedSpaceCard";

type RecommendedCategory = "Day Pass" | "Meeting Room" | "Virtual Office";

const categoryTabs: RecommendedCategory[] = ["Day Pass", "Meeting Room", "Virtual Office"];

interface CommonListing {
  id: string;
  city: string;
  name: string;
  locality: string;
  rating: number;
  reviews: number;
  images: string[];
  bestPrice: number;
}

const TAB_CONFIG: Record<RecommendedCategory, {
  productType: string;
  routeSlug: string;
  adapter: (c: CentreApiRow) => CommonListing;
  hrefFor: (item: CommonListing) => string;
  priceUnit: string;
}> = {
  "Day Pass": { productType: PRODUCT_TYPE.dayPass, routeSlug: "day-pass", adapter: apiToDayPassListing, hrefFor: (i) => `/day-pass/${i.id}`, priceUnit: "/day" },
  "Meeting Room": {
    productType: PRODUCT_TYPE.meetingRoom,
    routeSlug: "meeting-rooms",
    adapter: (c) => ({ ...apiToMeetingRoomListing(c), rating: toRating(c.rating), reviews: 0 }),
    hrefFor: (i) => `/meeting-rooms/${i.id}`,
    priceUnit: "/hour",
  },
  "Virtual Office": {
    productType: PRODUCT_TYPE.virtualOffice,
    routeSlug: "virtual-office",
    adapter: (c) => {
      const i = apiToVirtualOfficeListing(c);
      return { id: i.id, city: i.city, name: i.centerName, locality: i.area, rating: i.rating, reviews: i.reviews, images: i.images, bestPrice: i.bestPrice };
    },
    hrefFor: (i) => `/virtual-office/${i.id}`,
    priceUnit: "/month",
  },
};

export default function RecommendedSpacesSection() {
  const [activeCategory, setActiveCategory] = useState<RecommendedCategory>(categoryTabs[0]);
  const [spaces, setSpaces] = useState<RecommendedSpaceCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const config = TAB_CONFIG[activeCategory];
    apiGet<{ data: CentreApiRow[] }>(`/centers/list?productType=${config.productType}&sort=rating&pageSize=4`)
      .then((res) => {
        if (cancelled) return;
        const items = res.data.map(config.adapter);
        setSpaces(items.map((item) => ({
          id: item.id,
          title: item.name,
          location: item.locality,
          image: item.images[0],
          rating: item.rating,
          reviews: item.reviews,
          price: item.bestPrice,
          priceUnit: config.priceUnit,
          href: config.hrefFor(item),
        })));
      })
      .catch(() => {
        if (!cancelled) setSpaces([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeCategory]);

  return (
    <section className="w-full bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
              Bokko Recommended Spaces
            </h2>
            <p className="mt-3 max-w-xl text-base text-[#64748B] sm:text-lg">
              Handpicked coworking spaces, day passes, meeting rooms and virtual offices across India.
            </p>
          </div>
          <a
            href={`/${TAB_CONFIG[activeCategory].routeSlug}`}
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

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-[24px] bg-[#F1F5F9]" />
            ))}
          </div>
        ) : spaces.length > 0 ? (
          <div
            key={activeCategory}
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {spaces.map((space, i) => (
              <div key={space.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                <RecommendedSpaceCard space={space} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-[#64748B]">No spaces available right now.</p>
        )}
      </div>
    </section>
  );
}
