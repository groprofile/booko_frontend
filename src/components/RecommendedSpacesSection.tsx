import { useEffect, useState } from "react";
import { fetchFeaturedFirst } from "../lib/centreFeed";
import {
  apiToDayPassListing,
  apiToMeetingRoomListing,
  apiToVirtualOfficeListing,
  PRODUCT_TYPE,
  toRating,
  type CentreApiRow,
} from "../lib/centreAdapter";
import Section from "./common/Section";
import WorkspaceCard from "./cards/WorkspaceCard";
import GlassChips, { type GlassChipOption } from "./common/GlassChips";

type RecommendedCategory = "Day Pass" | "Meeting Room" | "Virtual Office";

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
  "Day Pass": { productType: PRODUCT_TYPE.dayPass, routeSlug: "day-pass", adapter: apiToDayPassListing, hrefFor: (i) => `/day-pass/${i.id}`, priceUnit: "/ day" },
  "Meeting Room": {
    productType: PRODUCT_TYPE.meetingRoom,
    routeSlug: "meeting-rooms",
    adapter: (c) => ({ ...apiToMeetingRoomListing(c), rating: toRating(c.rating), reviews: 0 }),
    hrefFor: (i) => `/meeting-rooms/${i.id}`,
    priceUnit: "/ hr",
  },
  "Virtual Office": {
    productType: PRODUCT_TYPE.virtualOffice,
    routeSlug: "virtual-office",
    adapter: (c) => {
      const i = apiToVirtualOfficeListing(c);
      return { id: i.id, city: i.city, name: i.centerName, locality: i.area, rating: i.rating, reviews: i.reviews, images: i.images, bestPrice: i.bestPrice };
    },
    hrefFor: (i) => `/virtual-office/${i.id}`,
    priceUnit: "/ mo",
  },
};

const CATEGORY_OPTIONS: GlassChipOption[] = [
  { id: "Day Pass", label: "Day Pass" },
  { id: "Meeting Room", label: "Meeting Room" },
  { id: "Virtual Office", label: "Virtual Office" },
];

export default function RecommendedSpacesSection() {
  const [activeCategory, setActiveCategory] = useState<RecommendedCategory>("Day Pass");
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const config = TAB_CONFIG[activeCategory];

    fetchFeaturedFirst(config.productType, 4)
      .then((merged) => {
        if (cancelled) return;
        setSpaces(
          merged.map((row) => {
            const item = config.adapter(row);
            return {
              id: item.id,
              title: item.name,
              location: item.locality,
              image: item.images[0],
              rating: item.rating,
              reviews: item.reviews,
              price: item.bestPrice,
              priceUnit: config.priceUnit,
              href: config.hrefFor(item),
              isFeatured: Boolean(row.is_featured),
            };
          }),
        );
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
    <Section 
      heading="Bokko Recommended Spaces"
      description="Handpicked coworking spaces, day passes, meeting rooms and virtual offices across India."
    >
      <div className="mb-6 flex flex-col gap-4">
        <GlassChips
          options={CATEGORY_OPTIONS}
          selectedIds={[activeCategory]}
          onChange={(ids) => setActiveCategory(ids[0] as RecommendedCategory)}
          singleSelect={true}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-border/50" />
          ))}
        </div>
      ) : spaces.length > 0 ? (
        <div
          key={activeCategory}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up"
        >
          {spaces.map((space) => (
            <WorkspaceCard
              key={space.id}
              id={space.id}
              image={space.image}
              title={space.title}
              location={space.location}
              features={["Premium", "Verified"]} 
              price={`₹${space.price.toLocaleString("en-IN")}`}
              priceUnit={space.priceUnit}
              rating={space.rating}
              linkTo={space.href}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted-text">No spaces available right now.</p>
      )}
    </Section>
  );
}
