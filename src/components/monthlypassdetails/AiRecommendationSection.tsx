import { Briefcase, Laptop, Rocket, Sparkles } from "lucide-react";

interface AiRecommendationSectionProps {
  items: { persona: string; reason: string }[];
}

const personaIcons: Record<string, typeof Rocket> = {
  Founders: Rocket,
  "Remote Teams": Laptop,
  Freelancers: Briefcase,
};

export default function AiRecommendationSection({ items }: AiRecommendationSectionProps) {
  return (
    <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
          <Sparkles size={15} />
        </span>
        <p className="text-sm font-bold text-[#0F172A]">
          Recommended for {items.map((item) => item.persona).join(", ").replace(/, ([^,]*)$/, " & $1")}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = personaIcons[item.persona] ?? Sparkles;
          return (
            <div key={item.persona} className="rounded-2xl bg-[#F8FAFC] p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-soft">
                <Icon size={16} />
              </span>
              <p className="mt-2 text-sm font-bold text-[#0F172A]">{item.persona}</p>
              <p className="mt-1 text-xs text-[#64748B]">{item.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
