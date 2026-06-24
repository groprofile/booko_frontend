import { CheckCircle2, ShieldCheck } from "lucide-react";
import { travelProtectionPlan } from "../../data/checkoutConfig";
import SectionLabel from "./SectionLabel";

interface TravelProtectionSectionProps {
  selected: boolean;
  onToggle: () => void;
}

export default function TravelProtectionSection({ selected, onToggle }: TravelProtectionSectionProps) {
  return (
    <section>
      <SectionLabel title="Travel Protection" />
      <button
        type="button"
        onClick={onToggle}
        className={
          "flex w-full flex-col gap-3 rounded-2xl border p-5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between " +
          (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
        }
      >
        <div className="flex gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2563EB] shadow-soft">
            <ShieldCheck size={20} strokeWidth={1.8} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-[#0F172A]">Bokko Travel Protection</p>
              <span className="rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">Recommended</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-[#F59E0B]">Most travelers select this</p>
            <p className="mt-2 text-xs text-[#64748B]">{travelProtectionPlan.items.join(" • ")}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <p className="text-base font-extrabold text-[#0F172A]">+₹{travelProtectionPlan.price}</p>
          <span
            className={
              "flex h-7 w-7 items-center justify-center rounded-full border " +
              (selected ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#CBD5E1] text-transparent")
            }
          >
            <CheckCircle2 size={16} />
          </span>
        </div>
      </button>
    </section>
  );
}
