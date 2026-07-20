import { Check, Plus } from "lucide-react";
import type { AddOn } from "../../data/meetingRoomDetails";
import SectionLabel from "./SectionLabel";

interface AddOnsSectionProps {
  addOns: AddOn[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
}

export default function AddOnsSection({ addOns, selectedKeys, onToggle }: AddOnsSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Add-ons" action={<p className="text-xs text-[#64748B]">Tap to add to your booking</p>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {addOns.map((addOn) => {
          const selected = selectedKeys.includes(addOn.key);
          return (
            <button
              key={addOn.key}
              type="button"
              onClick={() => onToggle(addOn.key)}
              className={
                "flex flex-col items-start gap-1 rounded-sm border p-4 text-left transition-colors " +
                (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
              }
            >
              <span className="flex w-full items-center justify-between">
                <span className="text-sm font-bold text-[#0F172A]">{addOn.label}</span>
                <span
                  className={
                    "flex h-6 w-6 items-center justify-center rounded-full " +
                    (selected ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B]")
                  }
                >
                  {selected ? <Check size={13} /> : <Plus size={13} />}
                </span>
              </span>
              <span className="text-xs font-semibold text-[#64748B]">+₹{addOn.price}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
