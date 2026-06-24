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
    <section>
      <SectionLabel title="Why Choose This Workspace" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = iconMap[feature] ?? BadgeCheck;
          return (
            <div
              key={feature}
              className="flex flex-col items-start gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white p-4"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <p className="text-sm font-bold text-[#0F172A]">{feature}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
