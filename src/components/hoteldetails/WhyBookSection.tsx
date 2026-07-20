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
    <section className="m-0">
      <SectionLabel title="Why Book This Hotel" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((label) => {
          const Icon = iconMap[label] ?? ShieldCheck;
          return (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-sm border border-border bg-card px-4 py-6 text-center shadow-soft transition-all hover:shadow-soft-lg hover:border-primary-blue/20"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-blue-50 text-primary-blue">
                <Icon size={22} strokeWidth={1.5} />
              </span>
              <p className="text-sm font-semibold text-primary-text leading-snug">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
