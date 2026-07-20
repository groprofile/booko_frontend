import { useEffect, useState } from "react";
import { Ticket, MonitorPlay, Briefcase } from "lucide-react";
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

type Category = "day-pass" | "meeting-room" | "virtual-office";

interface DisplaySpace {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  unit: string;
  image: string;
  href: string;
  amenities: string[];
  isFeatured: boolean;
}

const TAB_CONFIG: Record<Category, { productType: string; unit: string; toDisplay: (c: CentreApiRow) => DisplaySpace }> = {
  "day-pass": {
    productType: PRODUCT_TYPE.dayPass,
    unit: "/ day",
    toDisplay: (c) => {
      const item = apiToDayPassListing(c);
      return {
        id: item.id, name: item.name, location: item.locality, rating: item.rating, reviews: item.reviews,
        price: item.bestPrice, unit: "/ day", image: item.images[0], href: `/day-pass/${item.id}`,
        amenities: item.accessibility, isFeatured: Boolean(c.is_featured),
      };
    },
  },
  "meeting-room": {
    productType: PRODUCT_TYPE.meetingRoom,
    unit: "/ hr",
    toDisplay: (c) => {
      const item = apiToMeetingRoomListing(c);
      return {
        id: item.id, name: item.name, location: item.locality, rating: toRating(c.rating), reviews: 0,
        price: item.bestPrice, unit: "/ hr", image: item.images[0], href: `/meeting-rooms/${item.id}`,
        amenities: item.amenities, isFeatured: Boolean(c.is_featured),
      };
    },
  },
  "virtual-office": {
    productType: PRODUCT_TYPE.virtualOffice,
    unit: "/ mo",
    toDisplay: (c) => {
      const item = apiToVirtualOfficeListing(c);
      return {
        id: item.id, name: item.centerName, location: item.area, rating: item.rating, reviews: item.reviews,
        price: item.bestPrice, unit: "/ mo", image: item.images[0], href: `/virtual-office/${item.id}`,
        amenities: item.servicesIncluded, isFeatured: Boolean(c.is_featured),
      };
    },
  },
};

const TABS: GlassChipOption[] = [
  { id: "day-pass",       label: "Day Pass",       icon: <Ticket size={16} /> },
  { id: "meeting-room",   label: "Meeting Room",   icon: <MonitorPlay size={16} /> },
  { id: "virtual-office", label: "Virtual Office", icon: <Briefcase size={16} /> },
];

export default function FindYourSpaceSection() {
  const [active, setActive] = useState<Category>("day-pass");
  const [spaces, setSpaces] = useState<DisplaySpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const config = TAB_CONFIG[active];
    fetchFeaturedFirst(config.productType, 4)
      .then((rows) => {
        if (!cancelled) setSpaces(rows.map(config.toDisplay));
      })
      .catch(() => {
        if (!cancelled) setSpaces([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [active]);

  return (
    <Section 
      heading="Top Spaces, Loved by Thousands"
      description="Hand-picked centers with the highest ratings and bookings across India."
    >
      <div className="mb-6 flex flex-col gap-4">
        <GlassChips
          options={TABS}
          selectedIds={[active]}
          onChange={(ids) => setActive(ids[0] as Category)}
          singleSelect={true}
        />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-border/50" />
          ))}
        </div>
      ) : spaces.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
          {spaces.map((space) => (
            <WorkspaceCard
              key={space.id}
              id={space.id}
              image={space.image}
              title={space.name}
              location={space.location}
              features={space.amenities}
              price={`₹${space.price.toLocaleString("en-IN")}`}
              priceUnit={space.unit}
              rating={space.rating}
              linkTo={space.href}
            />
          ))}
        </div>
      ) : (
        <p className="mt-7 text-center text-sm text-muted-text">No spaces available right now.</p>
      )}
    </Section>
  );
}

