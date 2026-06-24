import {
  AirVent,
  Briefcase,
  Building2,
  Car,
  Dumbbell,
  MapPin,
  Plane,
  ShieldCheck,
  UtensilsCrossed,
  Users,
  Waves,
  Wifi,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const iconMap: Record<string, typeof Wifi> = {
  "Free Wifi": Wifi,
  "Prime Location": MapPin,
  "Breakfast Available": UtensilsCrossed,
  "Room Service": UtensilsCrossed,
  "Business Friendly": Briefcase,
  "Couple Friendly": Users,
  "Meeting Rooms": Building2,
  "24x7 Reception": ShieldCheck,
  "Airport Transfer": Plane,
  "Swimming Pool": Waves,
  Parking: Car,
  Gym: Dumbbell,
  Restaurant: UtensilsCrossed,
  "Air Conditioning": AirVent,
};

interface WhyBookSectionProps {
  cards: string[];
}

export default function WhyBookSection({ cards }: WhyBookSectionProps) {
  return (
    <section>
      <SectionLabel title="Why Book This Hotel" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((label) => {
          const Icon = iconMap[label] ?? ShieldCheck;
          return (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-[20px] border border-[#E2E8F0] bg-white px-3 py-5 text-center shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
