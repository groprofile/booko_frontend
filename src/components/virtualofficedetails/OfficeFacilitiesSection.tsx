import {
  Armchair,
  Building2,
  Car,
  Printer,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const iconMap: Record<string, typeof Wifi> = {
  Reception: UserRound,
  "Meeting Rooms": Users,
  "Coworking Access": Building2,
  "Business Lounge": Armchair,
  Printing: Printer,
  Internet: Wifi,
  "Conference Rooms": Video,
  "Visitor Management": UserCheck,
  Parking: Car,
  Security: ShieldCheck,
};

interface OfficeFacilitiesSectionProps {
  facilities: string[];
}

export default function OfficeFacilitiesSection({ facilities }: OfficeFacilitiesSectionProps) {
  return (
    <section>
      <SectionLabel title="Office Facilities" />
      <div className="flex flex-wrap gap-3">
        {facilities.map((item) => {
          const Icon = iconMap[item] ?? ShieldCheck;
          return (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-soft"
            >
              <Icon size={16} className="text-[#2563EB]" />
              {item}
            </span>
          );
        })}
      </div>
    </section>
  );
}
