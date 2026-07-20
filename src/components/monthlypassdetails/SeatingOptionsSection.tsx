import SectionLabel from "./SectionLabel";
import type { SeatingOption } from "../../data/monthlyPassDetails";

interface SeatingOptionsSectionProps {
  options: SeatingOption[];
}

export default function SeatingOptionsSection({ options }: SeatingOptionsSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Seating Options" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <div key={option.key} className="overflow-hidden rounded-sm border border-[#E2E8F0] bg-white">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <img src={option.image} alt={option.name} className="h-full w-full object-cover" />
              <span
                className={
                  "absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold " +
                  (option.available ? "bg-[#ECFDF5] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]")
                }
              >
                {option.available ? "Available" : "Fully Booked"}
              </span>
            </div>
            <div className="p-4">
              <p className="text-base font-bold text-[#0F172A]">{option.name}</p>
              <p className="text-xs font-semibold text-[#64748B]">{option.capacity}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {option.benefits.map((benefit) => (
                  <li key={benefit} className="text-xs text-[#475569]">
                    • {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
