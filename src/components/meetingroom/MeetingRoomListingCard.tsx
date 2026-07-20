import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Star } from "lucide-react";
import type { MeetingRoomListing } from "../../data/meetingRoomListings";
import { CITY_NAMES } from "../../data/dayPassListings";
import { apiGet } from "../../lib/api";
import { apiToMeetingRoomDetails, type CentreApiRow } from "../../lib/centreAdapter";
import RecommendedBadge from "../RecommendedBadge";
import ListingCardShell from "../common/ListingCardShell";

interface MeetingRoomListingCardProps {
  listing: MeetingRoomListing;
  defaultHours: number;
  layout?: "row" | "grid";
}

function cityLabel(slug: string) {
  return CITY_NAMES[slug] ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function MeetingRoomListingCard({ listing, defaultHours, layout = "row" }: MeetingRoomListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const defaultTier = listing.pricing.find((tier) => tier.hours === defaultHours) ?? listing.pricing[0];
  const navigate = useNavigate();
  const params = useParams<{ city: string }>();
  const citySlug = params.city ?? listing.city;
  const cityName = cityLabel(citySlug);
  const today = new Date().toISOString().slice(0, 10);
  const href = `/meeting-rooms/${listing.id}`;

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  async function handleBookNow() {
    setBookingLoading(true);
    try {
      const raw = await apiGet<CentreApiRow>(`/centers/${listing.id}`);
      const details = apiToMeetingRoomDetails(raw);
      const firstRoom = details.siblingRoomTypes[0];
      navigate("/checkout", {
        state: {
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
        },
      });
    } catch {
      alert("Couldn't load this room right now. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <ListingCardShell
      href={href}
      images={listing.images}
      name={listing.name}
      imageIndex={imageIndex}
      onPrevImage={showPrev}
      onNextImage={showNext}
      topLeftBadge={listing.isFeatured ? <RecommendedBadge size="sm" /> : undefined}
      topRightBadge={
        listing.popular ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#F97316] shadow-soft">
            <Star size={11} strokeWidth={1.75} className="fill-[#F97316] text-[#F97316]" />
            Popular
          </span>
        ) : undefined
      }
      ratingBadge={
        <span className="inline-flex items-center gap-1 rounded-sm bg-[#ECFDF5] px-1.5 py-0.5 text-[10px] font-bold text-success">
          <CheckCircle2 size={10} strokeWidth={1.75} />
          Instant
        </span>
      }
      extraBadges={
        listing.premier ? (
          <span className="rounded-sm bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary-blue">Premier</span>
        ) : undefined
      }
      title={listing.name}
      subtitle={`${listing.workspaceName} · Up to ${listing.capacity} people`}
      locality={listing.locality}
      distanceKm={listing.distanceKm}
      tags={listing.equipment}
      layout={layout}
      priceBlock={
        <div>
          <p className="text-sm font-extrabold leading-none text-primary-text">
            ₹{(defaultTier?.price ?? listing.bestPrice).toLocaleString()}
            <span className="text-[10px] font-medium text-muted-text"> /{defaultTier?.label ?? "hr"}</span>
          </p>
          <p className="text-[10px] font-semibold text-success">{listing.offerCode}</p>
        </div>
      }
      actions={
        <button
          type="button"
          onClick={handleBookNow}
          disabled={bookingLoading}
          className="rounded-sm bg-[#111111] px-2.5 py-1.5 text-center text-[11px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bookingLoading ? "…" : "Book Now"}
        </button>
      }
    />
  );
}
