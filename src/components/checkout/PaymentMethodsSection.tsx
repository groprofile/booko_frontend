import { CheckCircle2 } from "lucide-react";
import { paymentMethods } from "../../data/checkoutConfig";
import SectionLabel from "./SectionLabel";

interface PaymentMethodsSectionProps {
  selected: string | null;
  onSelect: (key: string) => void;
}

export default function PaymentMethodsSection({ selected, onSelect }: PaymentMethodsSectionProps) {
  return (
    <section>
      <SectionLabel title="Payment Methods" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {paymentMethods.map((method) => {
          const active = selected === method.key;
          return (
            <button
              key={method.key}
              type="button"
              onClick={() => onSelect(method.key)}
              className={
                "relative flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors " +
                (active ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
              }
            >
              {active && <CheckCircle2 size={16} className="absolute right-3 top-3 text-[#2563EB]" />}
              <p className="text-sm font-bold text-[#0F172A]">{method.label}</p>
              {method.note && <p className="text-[11px] text-[#64748B]">{method.note}</p>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
