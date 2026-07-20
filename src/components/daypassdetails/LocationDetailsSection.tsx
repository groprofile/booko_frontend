import { Clock3, MapPin, TrainFront, Landmark } from "lucide-react";
import type { DayPassDetails } from "../../data/dayPassDetails";
import SectionLabel from "./SectionLabel";

interface LocationDetailsSectionProps {
  details: DayPassDetails;
}

export default function LocationDetailsSection({ details }: LocationDetailsSectionProps) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(details.address)}&output=embed`;

  return (
    <section className="m-0">
      <SectionLabel title="Location Details" />
      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-text">Address</p>
        <p className="mt-2 flex items-start gap-3 text-base font-medium text-primary-text">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary-blue flex-shrink-0" />
          {details.address}
        </p>

        <div className="mt-6 h-72 w-full overflow-hidden rounded-sm border border-border">
          <iframe
            title="Workspace location map"
            src={mapSrc}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-primary-text">
              <TrainFront size={16} className="text-primary-blue flex-shrink-0" />
              Nearest Metro
            </p>
            <p className="mt-2 text-sm text-secondary-text">
              {details.metroStation}
              <span className="block text-xs text-muted-text mt-1">{details.metroDistanceKm} km away</span>
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-primary-text">
              <TrainFront size={16} className="text-primary-blue flex-shrink-0" />
              Nearest Railway
            </p>
            <p className="mt-2 text-sm text-secondary-text">
              {details.railwayStation}
              <span className="block text-xs text-muted-text mt-1">{details.railwayDistanceKm} km away</span>
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-primary-text">
              <Clock3 size={16} className="text-primary-blue flex-shrink-0" />
              Travel Time
            </p>
            <p className="mt-2 text-sm text-secondary-text">~{details.travelTimeMin} mins from city center</p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="flex items-center gap-2 text-sm font-bold text-primary-text">
            <Landmark size={16} className="text-primary-blue flex-shrink-0" />
            Nearby Landmarks
          </p>
          <p className="mt-2 text-sm text-secondary-text">{details.landmarks.join(" • ")}</p>
        </div>
      </div>
    </section>
  );
}
