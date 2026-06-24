import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AirVent,
  BadgeCheck,
  Briefcase,
  Car,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  MapPin,
  Star,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react";
import type { HotelListing } from "../../data/hotelListings";
import { slugify } from "../../utils/slug";

interface HotelListingCardProps {
  listing: HotelListing;
}

const amenityIcons: Record<string, typeof Wifi> = {
  Wifi: Wifi,
  Parking: Car,
  AC: AirVent,
  Breakfast: UtensilsCrossed,
  "Swimming Pool": Waves,
  Gym: Dumbbell,
  Restaurant: UtensilsCrossed,
  "Meeting Room": Users,
  Workspace: Briefcase,
};

const badgeStyles: Record<string, string> = {
  Premium: "bg-[#EFF6FF] text-[#2563EB]",
  Luxury: "bg-[#F5F3FF] text-[#7C3AED]",
  "Best Seller": "bg-[#FFFBEB] text-[#B45309]",
  "Top Rated": "bg-[#ECFDF5] text-[#16A34A]",
};

export default function HotelListingCard({ listing }: HotelListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const firstAvailable = listing.pricing.find((tier) => tier.available) ?? listing.pricing[0];
  const [selectedKey, setSelectedKey] = useState(firstAvailable.key);
  const selectedTier = listing.pricing.find((tier) => tier.key === selectedKey) ?? firstAvailable;

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-auto sm:w-[300px]">
          <img
            src={listing.images[imageIndex]}
            alt={listing.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />

          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0F172A] shadow-soft">
            🤑 Upto 100% OFF on App*
          </span>

          {listing.images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={showPrev}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow-soft hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={showNext}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow-soft hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0F172A] px-2.5 py-1 text-[11px] font-bold text-white">
              <Star size={11} className="fill-[#FBBF24] text-[#FBBF24]" />
              {listing.rating.toFixed(1)} ({listing.reviews})
            </span>
            {listing.badges.map((badge) => (
              <span
                key={badge}
                className={
                  "rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide " +
                  (badgeStyles[badge] ?? "bg-[#F1F5F9] text-[#475569]")
                }
              >
                {badge}
              </span>
            ))}
          </div>

          <h3 className="mt-2 text-lg font-bold text-[#0F172A] sm:text-[20px]">{listing.name}</h3>
          <p className="flex items-center gap-1.5 text-sm text-[#64748B]">
            <MapPin size={14} />
            {listing.locality} · {listing.distanceKm} Kms away
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#334155]">
            {listing.trustSignals.slice(0, 2).map((signal) => (
              <span key={signal} className="inline-flex items-center gap-1 text-xs font-semibold text-[#475569]">
                <BadgeCheck size={13} className="text-[#16A34A]" />
                {signal}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {listing.amenities.slice(0, 6).map((item) => {
              const Icon = amenityIcons[item] ?? Wifi;
              return (
                <span
                  key={item}
                  title={item}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B]"
                >
                  <Icon size={16} />
                </span>
              );
            })}
            {listing.amenities.length > 6 && (
              <span className="flex h-9 items-center px-2 text-xs font-semibold text-[#94A3B8]">
                +{listing.amenities.length - 6} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] p-5">
        <div className="flex flex-wrap gap-2">
          {listing.pricing.map((tier) => {
            const selected = tier.key === selectedKey;
            if (!tier.available) {
              return (
                <span
                  key={tier.key}
                  className="flex min-w-[88px] flex-col items-center rounded-2xl border border-[#E2E8F0] px-4 py-2.5 text-[#CBD5E1]"
                >
                  <span className="text-sm font-bold">Unavailable</span>
                  <span className="text-[11px] font-medium">{tier.label}</span>
                </span>
              );
            }
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedKey(tier.key)}
                className={
                  "flex min-w-[88px] flex-col items-center rounded-2xl border px-4 py-2.5 transition-colors " +
                  (selected
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
                }
              >
                <span className="text-base font-extrabold">₹{tier.price.toLocaleString()}</span>
                <span className={"text-[11px] font-medium " + (selected ? "text-white/80" : "text-[#64748B]")}>
                  {tier.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
              Best Price ₹{listing.bestPrice.toLocaleString()}
            </span>
            <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
              Use {listing.offerCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-[28px] font-extrabold leading-none text-[#0F172A] sm:text-[32px]">
              ₹{selectedTier.price.toLocaleString()}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to={`/${listing.city}/hotels/${slugify(listing.name)}`}
                className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#334155] transition-colors hover:border-[#94A3B8]"
              >
                View Details
              </Link>
              <Link
                to={`/${listing.city}/hotels/${slugify(listing.name)}`}
                className="rounded-xl bg-[#111111] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
