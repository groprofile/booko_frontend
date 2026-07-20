import { Building2, MapPin, Star, TrainFront, Users } from "lucide-react";
import type { MeetingRoomListing } from "../../data/meetingRoomListings";
import type { MeetingRoomDetails } from "../../data/meetingRoomDetails";

interface RoomDetailHeaderProps {
  listing: MeetingRoomListing;
  details: MeetingRoomDetails;
  cityName: string;
}

const badgeStyles: Record<string, string> = {
  Premium: "bg-[#EFF6FF] text-[#2563EB]",
  "Top Rated": "bg-[#ECFDF5] text-[#16A34A]",
  "Most Booked": "bg-[#FFFBEB] text-[#B45309]",
  "Corporate Favourite": "bg-[#F5F3FF] text-[#7C3AED]",
};

export default function RoomDetailHeader({ listing, details, cityName }: RoomDetailHeaderProps) {
  const nearbyMetro = details.nearbyPlaces.find((place) => place.category === "Metro Station");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-sm bg-[#0F172A] px-2.5 py-1 text-xs font-bold text-white">
          <Star size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
          {details.rating.toFixed(1)} ({details.reviewCount} reviews)
        </span>
        {details.badges.map((badge) => (
          <span
            key={badge}
            className={"rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide " + (badgeStyles[badge] ?? "bg-[#F1F5F9] text-[#475569]")}
          >
            {badge}
          </span>
        ))}
      </div>

      <h1 className="mt-3 text-[28px] font-extrabold tracking-tight text-[#0F172A] sm:text-[36px] lg:text-[42px]">
        {listing.name}
      </h1>
      <p className="mt-1 text-sm font-semibold text-[#334155]">{listing.workspaceName}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#64748B]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={15} className="shrink-0" />
          {listing.locality}, {cityName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Building2 size={15} className="shrink-0" />
          {details.buildingName} · {details.floor}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={15} className="shrink-0" />
          {listing.seatingCapacity} · {listing.roomType}
        </span>
        {nearbyMetro && (
          <span className="inline-flex items-center gap-1.5">
            <TrainFront size={15} className="shrink-0" />
            {nearbyMetro.distanceKm} Kms from Metro
          </span>
        )}
      </div>
    </div>
  );
}
