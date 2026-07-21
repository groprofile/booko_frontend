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
    <section className="m-0">
      <SectionLabel title="Seating Options" />
      <div className="flex flex-col gap-4">
        {options.map((option) => {
          const isSelected = option.type === selectedType;
          return (
            <div
              key={option.type}
              className={
                "flex flex-col gap-4 rounded-sm border-2 p-4 transition-all sm:flex-row sm:items-center sm:gap-6 " +
                (isSelected ? "border-primary-blue bg-blue-50/50" : "border-border bg-card shadow-soft")
              }
            >
              <div className="h-40 w-full shrink-0 overflow-hidden rounded-sm sm:h-28 sm:w-40">
                <img src={option.image} alt={option.type} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold text-primary-text">{option.type}</p>
                  <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-secondary-text">
                    Pay per use
                  </span>
                </div>
                <p className="mt-2 text-sm text-secondary-text leading-relaxed">{option.description}</p>
                <p className="mt-3 text-xs font-medium text-muted-text">
                  {option.features.join(" • ")}
                </p>
                <p className="mt-2 text-xs font-semibold text-success">{option.availability}</p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end sm:text-right">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-text">Price (credits/day)</p>
                  <p className="mt-1 text-2xl font-extrabold text-primary-text">
                    {option.price}
                    <span className="text-xs font-medium text-muted-text ml-1">/person</span>
                  </p>
                  {option.offerCode && option.bestPrice < option.price && (
                    <p className="mt-2 text-sm font-semibold text-success">
                      {option.bestPrice} Best
                      <span className="block text-xs font-medium text-secondary-text">
                        Use {option.offerCode}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(option.type)}
                  className={
                    "flex items-center justify-center gap-2 rounded-sm px-6 py-2.5 text-sm font-semibold transition-all w-full sm:w-auto " +
                    (isSelected
                      ? "bg-primary-blue text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] hover:brightness-[1.06]"
                      : "border border-border bg-card text-secondary-text hover:border-muted-text hover:shadow-soft")
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
