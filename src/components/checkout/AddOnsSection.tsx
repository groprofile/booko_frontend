import { CheckCircle2 } from "lucide-react";
import { extraAddOns, mealAddOns } from "../../data/checkoutConfig";
import SectionLabel from "./SectionLabel";

interface AddOnsSectionProps {
  mealAddOnKey: string | null;
  onSelectMealAddOn: (key: string | null) => void;
  extraAddOnKeys: string[];
  onToggleExtraAddOn: (key: string) => void;
}

export default function AddOnsSection({ mealAddOnKey, onSelectMealAddOn, extraAddOnKeys, onToggleExtraAddOn }: AddOnsSectionProps) {
  return (
    <section>
      <SectionLabel title="Add-ons" action={<span className="text-xs font-semibold text-[#16A34A]">Prices update instantly</span>} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {mealAddOns.map((addOn) => {
          const selected = mealAddOnKey === addOn.key;
          return (
            <button
              key={addOn.key}
              type="button"
              onClick={() => onSelectMealAddOn(selected ? null : addOn.key)}
              className={
                "relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-colors " +
                (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
              }
            >
              {selected && <CheckCircle2 size={18} className="absolute right-3 top-3 text-[#2563EB]" />}
              <p className="text-sm font-bold text-[#0F172A]">{addOn.label}</p>
              <p className="text-xs text-[#64748B]">{addOn.description}</p>
              <p className="mt-1 text-sm font-extrabold text-[#2563EB]">+₹{addOn.price}</p>
            </button>
          );
        })}

        {extraAddOns.map((addOn) => {
          const selected = extraAddOnKeys.includes(addOn.key);
          return (
            <button
              key={addOn.key}
              type="button"
              onClick={() => onToggleExtraAddOn(addOn.key)}
              className={
                "relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-colors " +
                (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
              }
            >
              {selected && <CheckCircle2 size={18} className="absolute right-3 top-3 text-[#2563EB]" />}
              <p className="text-sm font-bold text-[#0F172A]">{addOn.label}</p>
              <p className="text-xs text-[#64748B]">{addOn.description}</p>
              <p className="mt-1 text-sm font-extrabold text-[#2563EB]">+₹{addOn.price}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
