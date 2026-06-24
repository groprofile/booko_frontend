import {
  Box,
  Camera,
  Car,
  Coffee,
  Lock,
  PartyPopper,
  PhoneCall,
  Printer,
  ShieldCheck,
  Snowflake,
  UtensilsCrossed,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const iconMap: Record<string, LucideIcon> = {
  WiFi: Wifi,
  AC: Snowflake,
  "Power Backup": Box,
  "Meeting Rooms": Users,
  Reception: ShieldCheck,
  Printing: Printer,
  Lockers: Lock,
  Pantry: UtensilsCrossed,
  Coffee: Coffee,
  Snacks: Coffee,
  Parking: Car,
  "Event Space": PartyPopper,
  "Phone Booths": PhoneCall,
  Security: ShieldCheck,
  CCTV: Camera,
};

interface AmenitiesGridProps {
  amenities: string[];
}

export default function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  return (
    <section>
      <SectionLabel title="Workspace Amenities" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {amenities.map((amenity) => {
          const Icon = iconMap[amenity] ?? ShieldCheck;
          return (
            <div
              key={amenity}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#2563EB]">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <p className="text-xs font-semibold text-[#334155]">{amenity}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
