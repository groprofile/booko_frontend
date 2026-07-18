import { useEffect, useState } from "react";
import { Star, MapPin, ArrowRight, TrendingUp, Ticket, MonitorPlay, Briefcase, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import {
  apiToDayPassListing,
  apiToMeetingRoomListing,
  apiToVirtualOfficeListing,
  PRODUCT_TYPE,
  toRating,
  type CentreApiRow,
} from "../lib/centreAdapter";

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
        amenities: item.accessibility,
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
        amenities: item.amenities,
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
        amenities: item.servicesIncluded,
      };
    },
  },
};

const TABS: Array<{ id: Category; label: string; icon: LucideIcon }> = [
  { id: "day-pass",       label: "Day Pass",       icon: Ticket },
  { id: "meeting-room",   label: "Meeting Room",   icon: MonitorPlay },
  { id: "virtual-office", label: "Virtual Office", icon: Briefcase },
];

const CATEGORY_LINKS: Record<Category, string> = {
  "day-pass":       "/day-pass",
  "meeting-room":   "/meeting-rooms",
  "virtual-office": "/virtual-office",
};

export default function FindYourSpaceSection() {
  const [active, setActive] = useState<Category>("day-pass");
  const [spaces, setSpaces] = useState<DisplaySpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const config = TAB_CONFIG[active];
    apiGet<{ data: CentreApiRow[] }>(`/centers/list?productType=${config.productType}&sort=rating&pageSize=4`)
      .then((res) => {
        if (!cancelled) setSpaces(res.data.map(config.toDisplay));
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
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#D97706]">
                <TrendingUp size={12} /> Popular &amp; Highly Rated
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
              Top Spaces, Loved by Thousands
            </h2>
            <p className="mt-2 text-base text-[#64748B]">
              Hand-picked centers with the highest ratings and bookings across India.
            </p>
          </div>
          <Link
            to={CATEGORY_LINKS[active]}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active === tab.id
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-200"
                  : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              <tab.icon size={16} strokeWidth={1.75} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Space Cards */}
        {loading ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[320px] animate-pulse rounded-2xl bg-[#F1F5F9]" />
            ))}
          </div>
        ) : spaces.length > 0 ? (
          <div key={active} className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {spaces.map((space, i) => (
              <Link
                key={space.id}
                to={space.href}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group flex animate-fade-in-up flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
                    <Star size={11} className="fill-[#FBBF24] text-[#FBBF24]" />
                    <span className="text-[11px] font-bold text-white">{space.rating.toFixed(1)}</span>
                    {space.reviews > 0 && (
                      <span className="text-[10px] text-white/70">({space.reviews >= 1000 ? `${(space.reviews / 1000).toFixed(1)}k` : space.reviews})</span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="truncate font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {space.name}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
                    <MapPin size={11} />
                    {space.location}
                  </div>

                  {/* Amenities */}
                  {space.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {space.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-[#0F172A]">₹{space.price.toLocaleString("en-IN")}</span>
                      <span className="ml-1 text-xs text-[#94A3B8]">{space.unit}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] opacity-0 transition-opacity group-hover:opacity-100">
                      Book Now <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-7 text-center text-sm text-[#64748B]">No spaces available right now.</p>
        )}
      </div>
    </section>
  );
}
