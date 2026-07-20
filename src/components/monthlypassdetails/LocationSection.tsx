import { Building2, Coffee, Hotel, Plane, Train, UtensilsCrossed } from "lucide-react";
import SectionLabel from "./SectionLabel";
import type { NearbyPlace } from "../../data/monthlyPassDetails";

interface LocationSectionProps {
  address: string;
  metroDistanceKm: number;
  railwayDistanceKm: number;
  airportDistanceKm: number;
  hasParking: boolean;
  nearbyPlaces: NearbyPlace[];
}

const categoryIcons: Record<NearbyPlace["category"], typeof Coffee> = {
  Cafe: Coffee,
  Restaurant: UtensilsCrossed,
  Hotel: Hotel,
  "Business Hub": Building2,
};

export default function LocationSection({
  address,
  metroDistanceKm,
  railwayDistanceKm,
  airportDistanceKm,
  hasParking,
  nearbyPlaces,
}: LocationSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Commute & Location" />
      <div className="overflow-hidden rounded-sm border border-[#E2E8F0]">
        <iframe
          title="Workspace location map"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          className="h-[280px] w-full border-0"
          loading="lazy"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-sm border border-[#E2E8F0] bg-white p-4">
          <Train size={16} className="text-[#2563EB]" />
          <p className="mt-2 text-sm font-bold text-[#0F172A]">{metroDistanceKm} km</p>
          <p className="text-xs text-[#64748B]">Metro Distance</p>
        </div>
        <div className="rounded-sm border border-[#E2E8F0] bg-white p-4">
          <Train size={16} className="text-[#2563EB]" />
          <p className="mt-2 text-sm font-bold text-[#0F172A]">{railwayDistanceKm} km</p>
          <p className="text-xs text-[#64748B]">Railway Distance</p>
        </div>
        <div className="rounded-sm border border-[#E2E8F0] bg-white p-4">
          <Plane size={16} className="text-[#2563EB]" />
          <p className="mt-2 text-sm font-bold text-[#0F172A]">{airportDistanceKm} km</p>
          <p className="text-xs text-[#64748B]">Airport Distance</p>
        </div>
        <div className="rounded-sm border border-[#E2E8F0] bg-white p-4">
          <Building2 size={16} className="text-[#2563EB]" />
          <p className="mt-2 text-sm font-bold text-[#0F172A]">{hasParking ? "Available" : "Limited"}</p>
          <p className="text-xs text-[#64748B]">Parking</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {nearbyPlaces.map((place) => {
          const Icon = categoryIcons[place.category];
          return (
            <div
              key={place.category}
              className="flex items-center gap-3 rounded-sm border border-[#E2E8F0] bg-white p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#F8FAFC] text-[#2563EB]">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Nearby {place.category}
                </p>
                <p className="text-sm font-bold text-[#0F172A]">{place.name}</p>
                <p className="text-xs text-[#64748B]">{place.distanceKm} km away</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
