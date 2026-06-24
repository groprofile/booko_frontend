import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { DayPassDetails } from "../../data/dayPassDetails";
import SectionLabel from "./SectionLabel";

function formatTime(time: string) {
  const [hourStr, minute] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

interface AboutWorkspaceSectionProps {
  details: DayPassDetails;
  openTime: string;
  closeTime: string;
}

export default function AboutWorkspaceSection({
  details,
  openTime,
  closeTime,
}: AboutWorkspaceSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const infoRows = [
    { label: "Opening Hours", value: `${formatTime(openTime)} - ${formatTime(closeTime)} (Mon-Sat)` },
    { label: "Internet Speed", value: details.internetSpeed },
    { label: "Parking Details", value: details.parkingDetails },
    { label: "Food & Beverage", value: details.foodBeverage },
  ];

  return (
    <section>
      <SectionLabel title="About Workspace" />

      <p className={"text-[15px] leading-relaxed text-[#334155] " + (expanded ? "" : "line-clamp-3")}>
        {details.description}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
      >
        {expanded ? "Read Less" : "Read More"}
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {infoRows.map((row) => (
          <div key={row.label} className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">{row.label}</p>
            <p className="mt-1 text-sm font-semibold text-[#0F172A]">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-sm font-bold text-[#0F172A]">Workspace Rules</p>
        <ul className="mt-2 flex flex-col gap-2">
          {details.rules.map((rule) => (
            <li key={rule} className="flex items-start gap-2 text-sm text-[#64748B]">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#16A34A]" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
