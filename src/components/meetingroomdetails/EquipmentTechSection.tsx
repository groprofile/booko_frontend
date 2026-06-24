import {
  Battery,
  Cable,
  Cast,
  Lightbulb,
  Mic,
  Monitor,
  Plug,
  Presentation,
  ScreenShare,
  Speaker,
  Tv,
  Wifi,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const iconMap: Record<string, typeof Wifi> = {
  Projector: Presentation,
  "LED Screen": ScreenShare,
  "Smart TV": Tv,
  "Video Conference": Monitor,
  "Video Conferencing": Monitor,
  Speakers: Speaker,
  Microphone: Mic,
  HDMI: Cable,
  Whiteboard: Monitor,
  "Laser Pointer": Lightbulb,
  "Extension Boards": Plug,
  "Charging Ports": Battery,
  "Dedicated Internet": Wifi,
};

interface EquipmentTechSectionProps {
  equipment: string[];
}

export default function EquipmentTechSection({ equipment }: EquipmentTechSectionProps) {
  return (
    <section>
      <SectionLabel title="Equipment & Technology" />
      <div className="flex flex-wrap gap-3">
        {equipment.map((item) => {
          const Icon = iconMap[item] ?? Cast;
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
