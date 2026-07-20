import type { HowItWorksStep } from "../../data/virtualOfficeDetails";
import SectionLabel from "./SectionLabel";

interface HowItWorksSectionProps {
  steps: HowItWorksStep[];
}

export default function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="How It Works" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <div key={step.step} className="relative rounded-sm border border-[#E2E8F0] bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
              {step.step}
            </span>
            <p className="mt-3 text-sm font-bold text-[#0F172A]">{step.title}</p>
            <p className="mt-1 text-xs text-[#64748B]">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
