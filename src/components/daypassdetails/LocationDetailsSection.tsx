import { Clock3, MapPin, TrainFront, Landmark } from "lucide-react";
import type { DayPassDetails } from "../../data/dayPassDetails";
import SectionLabel from "./SectionLabel";

interface LocationDetailsSectionProps {
  details: DayPassDetails;
}

export default function LocationDetailsSection({ details }: LocationDetailsSectionProps) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(details.address)}&output=embed`;

  return (
    <section>
      <SectionLabel title="Location Details" />
      <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">Address</p>
        <p className="mt-1.5 flex items-start gap-2 text-base font-medium text-[#0F172A]">
          <MapPin size={18} className="mt-0.5 shrink-0 text-[#2563EB]" />
          {details.address}
        </p>

        <div className="mt-5 h-[260px] w-full overflow-hidden rounded-[16px] border border-[#E2E8F0]">
          <iframe
            title="Workspace location map"
            src={mapSrc}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
              <TrainFront size={16} className="text-[#2563EB]" />
              Nearest Metro
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {details.metroStation}
              <span className="block">{details.metroDistanceKm} Kms away</span>
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
              <TrainFront size={16} className="text-[#2563EB]" />
              Nearest Railway
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {details.railwayStation}
              <span className="block">{details.railwayDistanceKm} Kms away</span>
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
              <Clock3 size={16} className="text-[#2563EB]" />
              Travel Time
            </p>
            <p className="mt-1 text-sm text-[#64748B]">~{details.travelTimeMin} mins from city center</p>
          </div>
        </div>

        <div className="mt-6 border-t border-[#E2E8F0] pt-5">
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
            <Landmark size={16} className="text-[#2563EB]" />
            Nearby Landmarks
          </p>
          <p className="mt-1.5 text-sm text-[#64748B]">{details.landmarks.join(" • ")}</p>
        </div>
      </div>
    </section>
  );
}
