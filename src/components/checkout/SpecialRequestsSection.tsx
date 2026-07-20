import { specialRequestOptions } from "../../data/checkoutConfig";
import SectionLabel from "./SectionLabel";

interface SpecialRequestsSectionProps {
  selected: string[];
  onToggle: (request: string) => void;
}

export default function SpecialRequestsSection({ selected, onToggle }: SpecialRequestsSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Special Requests" />
      <p className="mb-3 text-sm text-[#64748B]">Free to request — subject to availability at the property.</p>
      <div className="flex flex-wrap gap-2">
        {specialRequestOptions.map((request) => {
          const active = selected.includes(request);
          return (
            <button
              key={request}
              type="button"
              onClick={() => onToggle(request)}
              className={
                "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors " +
                (active ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-[#E2E8F0] bg-white text-[#334155] hover:border-[#94A3B8]")
              }
            >
              {request}
            </button>
          );
        })}
      </div>
    </section>
  );
}
