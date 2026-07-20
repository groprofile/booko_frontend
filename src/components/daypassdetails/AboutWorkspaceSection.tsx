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
    <section className="m-0">
      <SectionLabel title="About Workspace" />

      <p className={"text-sm leading-relaxed text-secondary-text " + (expanded ? "" : "line-clamp-3")}>
        {details.description}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-blue transition-colors hover:text-primary-blue/80"
      >
        {expanded ? "Read Less" : "Read More"}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {infoRows.map((row) => (
          <div key={row.label} className="rounded-sm border border-border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-text">{row.label}</p>
            <p className="mt-2 text-sm font-semibold text-primary-text">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-base font-bold text-primary-text">Workspace Rules</p>
        <ul className="mt-4 flex flex-col gap-3">
          {details.rules.map((rule) => (
            <li key={rule} className="flex items-start gap-3 text-sm text-secondary-text">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
