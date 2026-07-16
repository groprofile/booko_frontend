import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Cast,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Mic,
  Presentation,
  Projector,
  ScreenShare,
  ShoppingCart,
  Speaker,
  Star,
  Tv,
  Users,
  Video,
} from "lucide-react";
import type { MeetingRoomListing } from "../../data/meetingRoomListings";
import { getMeetingRoomDetails } from "../../data/meetingRoomDetails";
import { CITY_NAMES } from "../../data/dayPassListings";
import { useCart } from "../../context/CartContext";

interface MeetingRoomListingCardProps {
  listing: MeetingRoomListing;
  defaultHours: number;
}

const equipmentIcons: Record<string, typeof Tv> = {
  "Monitor/TV": Tv,
  Projector: Projector,
  Speakers: Speaker,
  "Video Conference": Video,
  Whiteboard: Presentation,
  Microphone: Mic,
  "HDMI Support": Cast,
  "LED Screen": ScreenShare,
};

function cityLabel(slug: string) {
  return CITY_NAMES[slug] ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function MeetingRoomListingCard({ listing, defaultHours }: MeetingRoomListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const defaultTier = listing.pricing.find((tier) => tier.hours === defaultHours) ?? listing.pricing[0];
  const [selectedHours, setSelectedHours] = useState(defaultTier.hours);
  const selectedTier = listing.pricing.find((tier) => tier.hours === selectedHours) ?? listing.pricing[0];
  const navigate = useNavigate();
  const params = useParams<{ city: string }>();
  const { addItem } = useCart();
  const citySlug = params.city ?? listing.city;
  const cityName = cityLabel(citySlug);
  const today = new Date().toISOString().slice(0, 10);

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  function buildCheckoutState() {
    const details = getMeetingRoomDetails(listing);
    const firstRoom = details.siblingRoomTypes[0];
    return {
      productType: "meeting-room" as const,
      listingId: listing.id,
      roomName: listing.name,
      workspaceName: listing.workspaceName,
      citySlug,
      cityName,
      locality: listing.locality,
      image: listing.images[0],
      rating: 4.5,
      reviews: 0,
      date: today,
      startTime: "09:00",
      selectedRoomId: firstRoom?.id ?? "",
      selectedDurationKey: firstRoom?.pricing[0]?.key ?? "",
      attendees: 4,
      selectedAddOnKeys: [],
      siblingRoomTypes: details.siblingRoomTypes,
      addOns: details.addOns,
      equipmentTech: details.equipmentTech,
    };
  }

  function handleBookNow() {
    navigate("/checkout", { state: buildCheckoutState() });
  }

  function handleAddToCart() {
    const state = buildCheckoutState();
    addItem({
      id: listing.id,
      productType: "meeting-room",
      workspaceName: listing.workspaceName,
      cityName,
      locality: listing.locality,
      image: listing.images[0],
      price: selectedTier.price,
      date: today,
      checkoutState: state,
    });
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-auto sm:w-[280px]">
          <img src={listing.images[imageIndex]} alt={listing.name} className="h-full w-full object-cover" />

          {listing.popular && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#F97316] shadow-soft">
              <Star size={11} className="fill-[#F97316] text-[#F97316]" />
              Popular
            </span>
          )}

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
            <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#16A34A]">
              <CheckCircle2 size={12} />
              Instant Confirmation
            </span>
            {listing.premier && (
              <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#2563EB]">
                Premier
              </span>
            )}
          </div>

          <h3 className="mt-2 text-lg font-bold text-[#0F172A] sm:text-[20px]">{listing.name}</h3>
          <p className="text-sm font-semibold text-[#334155]">{listing.workspaceName}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0" />
              {listing.locality}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} className="shrink-0" />
              Up to {listing.capacity} people
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {listing.equipment.slice(0, 4).map((item) => {
              const Icon = equipmentIcons[item] ?? Tv;
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
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {listing.roomTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#E2E8F0] px-3 py-1 text-xs font-semibold text-[#475569]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Hourly Pricing</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {listing.pricing.map((tier) => {
            const selected = tier.hours === selectedHours;
            return (
              <button
                key={tier.hours}
                type="button"
                onClick={() => setSelectedHours(tier.hours)}
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
              {listing.offerCount} workspace {listing.offerCount === 1 ? "offer" : "offers"}
            </span>
            <span className="rounded-full bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-[#B45309]">
              Best Price ₹{listing.bestPrice.toLocaleString()}
            </span>
            <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
              Use {listing.offerCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-[32px] font-extrabold leading-none text-[#0F172A]">
              ₹{selectedTier.price.toLocaleString()}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                to={`/${listing.city}/meeting-rooms/${listing.id}`}
                className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#334155] transition-colors hover:border-[#94A3B8]"
              >
                View Details
              </Link>
              <button type="button" onClick={handleBookNow}
                className="rounded-xl bg-[#111111] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-black">
                Book Now
              </button>
              <button type="button" onClick={handleAddToCart}
                className="flex items-center gap-1.5 rounded-xl border border-[#2563EB] px-4 py-2.5 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF]">
                <ShoppingCart size={14} />
                Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
