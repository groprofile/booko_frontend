import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { stayModes } from "../data/stayYourWay";
import type { StayHotel, StayMode } from "../data/stayYourWay";
import StayHotelCard from "./StayHotelCard";
import { apiGet } from "../lib/api";
import { apiToHotelListing, PRODUCT_TYPE, type CentreApiRow } from "../lib/centreAdapter";

const HOURLY_KEYS = new Set(["3", "6", "12"]);

export default function StayYourWaySection() {
  const [activeMode, setActiveMode] = useState<StayMode>("hourly");
  const [hourlyHotels, setHourlyHotels] = useState<StayHotel[]>([]);
  const [fullDayHotels, setFullDayHotels] = useState<StayHotel[]>([]);
  const [loading, setLoading] = useState(true);

  const active = stayModes.find((mode) => mode.id === activeMode) ?? stayModes[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<{ data: CentreApiRow[] }>(`/centers/list?productType=${PRODUCT_TYPE.hotel}&sort=rating&pageSize=20`)
      .then((res) => {
        if (cancelled) return;
        const hourly: StayHotel[] = [];
        const fullDay: StayHotel[] = [];
        res.data.forEach((row) => {
          const listing = apiToHotelListing(row);
          const isHourly = listing.pricing.some((p) => HOURLY_KEYS.has(p.key));
          const hotel: StayHotel = {
            id: listing.id,
            name: listing.name,
            location: listing.locality,
            image: listing.images[0],
            rating: listing.rating,
            price: `₹${listing.bestPrice.toLocaleString("en-IN")}`,
            priceUnit: isHourly ? "/ Stay" : "/ Day",
            href: `/hotels/${listing.id}`,
          };
          if (isHourly && hourly.length < 4) hourly.push(hotel);
          else if (!isHourly && fullDay.length < 4) fullDay.push(hotel);
        });
        setHourlyHotels(hourly);
        setFullDayHotels(fullDay);
      })
      .catch(() => {
        if (!cancelled) {
          setHourlyHotels([]);
          setFullDayHotels([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const hotels = activeMode === "hourly" ? hourlyHotels : fullDayHotels;

  return (
    <section
      className="relative w-full overflow-hidden py-10 sm:py-14 lg:py-16"
      style={{ backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)" }}
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#2563EB] opacity-[0.06] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl">
            Stay Your Way
          </h2>
          <p className="mt-4 text-base text-[#475569] sm:text-lg">
            Whether you need a room for a few hours or a full day, Bokko gives you flexible hotel
            stays that fit your schedule.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] p-1.5">
            {stayModes.map((mode) => {
              const isActive = mode.id === activeMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={
                    "rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 sm:px-6 " +
                    (isActive
                      ? "bg-white text-[#111111] shadow-soft"
                      : "text-[#64748B] hover:text-[#111111]")
                  }
                >
                  {mode.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-5">
            <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-[#111111] sm:text-3xl">
              {active.heading}
            </h3>
            <p className="mt-3 text-base text-[#475569]">{active.description}</p>

            <ul className="mt-6 grid grid-cols-2 gap-3">
              {active.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
                  <CheckCircle2 size={16} className="shrink-0 text-[#2563EB]" />
                  {benefit}
                </li>
              ))}
            </ul>

            <Link
              to={active.ctaHref}
              className="cta-gradient mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-[1.02]"
            >
              {active.ctaLabel}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="lg:col-span-7">
            {loading ? (
              <div className="grid grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[220px] animate-pulse rounded-[24px] bg-[#F1F5F9]" />
                ))}
              </div>
            ) : hotels.length > 0 ? (
              <div
                key={active.id}
                className="scrollbar-hide flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible"
              >
                {hotels.map((hotel, i) => (
                  <div key={hotel.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <StayHotelCard hotel={hotel} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-[#64748B]">No hotels available right now.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
