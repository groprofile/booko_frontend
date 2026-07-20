import { Clock, RefreshCcw, Shield, UserCheck, UtensilsCrossed, Volume2, Wallet, Package } from "lucide-react";
import type { HouseRules } from "../../data/meetingRoomDetails";
import SectionLabel from "./SectionLabel";

interface HouseRulesSectionProps {
  rules: HouseRules;
}

export default function HouseRulesSection({ rules }: HouseRulesSectionProps) {
  const rows = [
    { icon: UtensilsCrossed, label: "Food Policy", value: rules.foodPolicy },
    { icon: Package, label: "Outside Catering Policy", value: rules.outsideCateringPolicy },
    { icon: UserCheck, label: "Visitor Policy", value: rules.visitorPolicy },
    { icon: Clock, label: "Timing Policy", value: rules.timingPolicy },
    { icon: Volume2, label: "Noise Policy", value: rules.noisePolicy },
    { icon: RefreshCcw, label: "Cancellation Policy", value: rules.cancellationPolicy },
    { icon: Wallet, label: "Refund Policy", value: rules.refundPolicy },
    { icon: Shield, label: "Security Rules", value: rules.securityRules },
  ];

  return (
    <section className="m-0">
      <SectionLabel title="House Rules" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 rounded-sm border border-[#E2E8F0] bg-white p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#EFF6FF] text-[#2563EB]">
              <Icon size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{label}</p>
              <p className="mt-0.5 text-sm text-[#64748B]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
