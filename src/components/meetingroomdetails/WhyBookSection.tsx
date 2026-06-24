import {
  AirVent,
  Coffee,
  Headphones,
  Monitor,
  Presentation,
  Printer,
  ShieldCheck,
  Video,
  Wifi,
  Zap,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const iconMap: Record<string, typeof Wifi> = {
  "High Speed Internet": Wifi,
  Projector: Presentation,
  Whiteboard: Monitor,
  "Video Conference": Video,
  "Video Conferencing": Video,
  "TV Screen": Monitor,
  "Power Backup": Zap,
  "Coffee Machine": Coffee,
  "Reception Support": Headphones,
  Parking: ShieldCheck,
  "Air Conditioning": AirVent,
  "Printing Support": Printer,
};

interface WhyBookSectionProps {
  cards: string[];
}

export default function WhyBookSection({ cards }: WhyBookSectionProps) {
  return (
    <section>
      <SectionLabel title="Why Book This Room" />
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
