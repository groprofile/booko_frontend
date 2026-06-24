import type { ReactNode } from "react";

interface SectionLabelProps {
  title: string;
  action?: ReactNode;
}

export default function SectionLabel({ title, action }: SectionLabelProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[18px] font-extrabold uppercase tracking-wide text-[#0F172A] sm:text-[22px]">
          {title}
        </h2>
        <span className="mt-2 block h-1 w-10 rounded-full bg-[#2563EB]" />
      </div>
      {action}
    </div>
  );
}
