import { Users } from "lucide-react";
import SectionLabel from "./SectionLabel";

interface CommunityBenefitsSectionProps {
  benefits: string[];
}

export default function CommunityBenefitsSection({ benefits }: CommunityBenefitsSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Community Benefits" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center gap-2.5 rounded-sm border border-[#E2E8F0] bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#EFF6FF] text-[#2563EB]">
              <Users size={16} strokeWidth={1.8} />
            </span>
            <p className="text-sm font-semibold text-[#0F172A]">{benefit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
