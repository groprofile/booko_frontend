import type { ReactNode } from "react";

interface SectionLabelProps {
  title: string;
  action?: ReactNode;
}

export default function SectionLabel({ title, action }: SectionLabelProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold uppercase tracking-wide text-primary-text sm:text-2xl">
          {title}
        </h2>
        <span className="mt-3 block h-1 w-10 rounded-full bg-primary-blue" />
      </div>
      {action}
    </div>
  );
}
