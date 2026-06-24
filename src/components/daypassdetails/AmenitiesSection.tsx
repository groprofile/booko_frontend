import {
  AirVent,
  Car,
  Check,
  Coffee,
  Printer,
  UserRound,
  Users,
  Wifi,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const amenityIcons: Record<string, typeof Wifi> = {
  "High Speed WiFi": Wifi,
  "Power Backup": Check,
  "Meeting Rooms": Users,
  Parking: Car,
  "Air Conditioning": AirVent,
  Printing: Printer,
  Reception: UserRound,
  Cafe: Coffee,
};

interface AmenitiesSectionProps {
  amenities: string[];
}

export default function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  return (
    <section>
      <SectionLabel title="Amenities" />
      <div className="flex flex-wrap gap-3">
        {amenities.map((amenity) => {
          const Icon = amenityIcons[amenity] ?? Check;
          return (
            <span
              key={amenity}
              className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-soft"
            >
              <Icon size={16} className="text-[#2563EB]" />
              {amenity}
            </span>
          );
        })}
      </div>
    </section>
  );
}
