import { Baby, Cigarette, Clock, CreditCard, Heart, IdCard, PawPrint, RefreshCcw } from "lucide-react";
import type { HotelDetails } from "../../data/hotelDetails";
import SectionLabel from "./SectionLabel";

interface PropertyRulesSectionProps {
  details: HotelDetails;
}

export default function PropertyRulesSection({ details }: PropertyRulesSectionProps) {
  const rows = [
    { icon: Clock, label: "Check-in / Check-out", value: `${details.rules.checkIn} / ${details.rules.checkOut}` },
    { icon: Heart, label: "Couple Policy", value: details.rules.couplePolicy },
    { icon: IdCard, label: "Local ID Policy", value: details.rules.localIdPolicy },
    { icon: Baby, label: "Child Policy", value: details.rules.childPolicy },
    { icon: Cigarette, label: "Smoking Policy", value: details.rules.smokingPolicy },
    { icon: PawPrint, label: "Pet Policy", value: details.rules.petPolicy },
    { icon: RefreshCcw, label: "Cancellation Policy", value: details.rules.cancellationPolicy },
    { icon: CreditCard, label: "Refund Policy", value: details.rules.refundPolicy },
  ];

  return (
    <section className="m-0">
      <SectionLabel title="Property Rules" />
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
