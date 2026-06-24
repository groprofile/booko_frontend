import {
  Building2,
  Car,
  Hotel,
  MapPin,
  Plane,
  TrainFront,
  UtensilsCrossed,
} from "lucide-react";
import type { MeetingRoomDetails } from "../../data/meetingRoomDetails";
import SectionLabel from "./SectionLabel";

interface LocationSectionProps {
  address: string;
  details: MeetingRoomDetails;
}

const placeIcons: Record<string, typeof Plane> = {
  "Metro Station": TrainFront,
  "Railway Station": TrainFront,
  Airport: Plane,
  Restaurants: UtensilsCrossed,
  Hotels: Hotel,
  "Coworking Spaces": Building2,
};

export default function LocationSection({ address, details }: LocationSectionProps) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <section>
      <SectionLabel title="Location" />
      <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-soft">
        <p className="flex items-start gap-2 text-base font-medium text-[#0F172A]">
          <MapPin size={18} className="mt-0.5 shrink-0 text-[#2563EB]" />
          {address}
        </p>

        <div className="mt-4 h-[260px] w-full overflow-hidden rounded-[16px] border border-[#E2E8F0]">
          <iframe
            title="Meeting room location map"
            src={mapSrc}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[#16A34A]">
          <Car size={14} />
          {details.parkingAvailable ? "Parking Available" : "Parking Not Available"}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {details.nearbyPlaces.map((place) => {
            const Icon = placeIcons[place.category] ?? MapPin;
            return (
              <div key={place.category} className="flex items-start gap-2.5 rounded-[14px] border border-[#E2E8F0] px-4 py-3">
                <Icon size={16} className="mt-0.5 shrink-0 text-[#2563EB]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">{place.category}</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{place.name}</p>
                  <p className="text-xs text-[#64748B]">{place.distanceKm} Kms away</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
