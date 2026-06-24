import { Check } from "lucide-react";

const STEPS = ["Booking Details", "Guest Info", "Review & Pay", "Confirmed"];

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const completed = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all " +
                  (completed
                    ? "bg-[#16A34A] text-white"
                    : active
                    ? "bg-[#2563EB] text-white shadow-[0_0_0_4px_#2563EB20]"
                    : "bg-[#E2E8F0] text-[#94A3B8]")
                }
              >
                {completed ? <Check size={14} strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={
                  "hidden text-[11px] font-semibold sm:block " +
                  (active ? "text-[#2563EB]" : completed ? "text-[#16A34A]" : "text-[#94A3B8]")
                }
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={
                "mx-1 h-0.5 flex-1 transition-all " +
                (completed ? "bg-[#16A34A]" : "bg-[#E2E8F0]")
              } />
            )}
          </div>
        );
      })}
    </div>
  );
}
