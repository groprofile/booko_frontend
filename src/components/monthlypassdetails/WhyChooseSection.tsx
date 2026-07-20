import {
  Armchair,
  BadgeCheck,
  Car,
  Coffee,
  Network,
  PartyPopper,
  PhoneCall,
  Printer,
  ShieldCheck,
  Users,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const iconMap: Record<string, LucideIcon> = {
  "High Speed WiFi": Wifi,
  "Power Backup": Zap,
  "Meeting Rooms": Users,
  Reception: BadgeCheck,
  Printing: Printer,
  "Community Events": PartyPopper,
  Networking: Network,
  "Tea/Coffee": Coffee,
  Parking: Car,
  "Phone Booths": PhoneCall,
  "Lounge Area": Armchair,
  "24/7 Security": ShieldCheck,
};

interface WhyChooseSectionProps {
  features: string[];
}

export default function WhyChooseSection({ features }: WhyChooseSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Why Choose This Workspace" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = iconMap[feature] ?? BadgeCheck;
          return (
            <div
              key={feature}
              className="flex flex-col items-start gap-3 rounded-sm border border-border bg-card p-5 shadow-soft transition-all hover:shadow-soft-lg hover:border-primary-blue/20"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-50 text-primary-blue">
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <p className="text-sm font-bold text-primary-text leading-snug">{feature}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
