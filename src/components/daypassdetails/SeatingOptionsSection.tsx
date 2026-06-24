import { CheckCircle2 } from "lucide-react";
import type { SeatingOptionDetail } from "../../data/dayPassDetails";
import SectionLabel from "./SectionLabel";

interface SeatingOptionsSectionProps {
  options: SeatingOptionDetail[];
  selectedType: string;
  onSelect: (type: string) => void;
}

export default function SeatingOptionsSection({
  options,
  selectedType,
  onSelect,
}: SeatingOptionsSectionProps) {
  return (
    <section>
      <SectionLabel title="Seating Options" />
      <div className="flex flex-col gap-4">
        {options.map((option) => {
          const isSelected = option.type === selectedType;
          return (
            <div
              key={option.type}
              className={
                "flex flex-col gap-4 rounded-[18px] border p-4 transition-colors sm:flex-row sm:items-center " +
                (isSelected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white")
              }
            >
              <div className="h-[160px] w-full shrink-0 overflow-hidden rounded-[14px] sm:h-[110px] sm:w-[180px]">
                <img src={option.image} alt={option.type} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-[#0F172A]">{option.type}</p>
                  <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold text-[#475569]">
                    Pay per use
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#64748B]">{option.description}</p>
                <p className="mt-2 text-xs font-semibold text-[#94A3B8]">
                  {option.features.join(" • ")}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-[#16A34A]">{option.availability}</p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end sm:text-right">
                <div>
                  <p className="text-xs text-[#94A3B8]">Price (credits/day)</p>
                  <p className="text-xl font-extrabold text-[#0F172A]">
                    {option.price}
                    <span className="text-sm font-medium text-[#94A3B8]">/1 person</span>
                  </p>
                  <p className="text-sm font-bold text-[#16A34A]">
                    {option.bestPrice} Best Price
                    <span className="block text-xs font-medium text-[#64748B]">
                      Use {option.offerCode}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(option.type)}
                  className={
                    "flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors sm:w-auto " +
                    (isSelected
                      ? "bg-[#2563EB] text-white"
                      : "border border-[#E2E8F0] bg-white text-[#334155] hover:border-[#94A3B8]")
                  }
                >
                  {isSelected && <CheckCircle2 size={16} />}
                  {isSelected ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
