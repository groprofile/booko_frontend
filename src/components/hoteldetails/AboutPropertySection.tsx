import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { HotelDetails } from "../../data/hotelDetails";
import SectionLabel from "./SectionLabel";

interface AboutPropertySectionProps {
  details: HotelDetails;
}

export default function AboutPropertySection({ details }: AboutPropertySectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section>
      <SectionLabel title="About This Property" />

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-bold text-[#0F172A]">About Property</p>
          <p className={"mt-1 text-[15px] leading-relaxed text-[#334155] " + (expanded ? "" : "line-clamp-3")}>
            {details.description}
          </p>
        </div>

        {expanded && (
          <>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">About Location</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#334155]">{details.aboutLocation}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Why Stay Here</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#334155]">{details.whyStayHere}</p>
            </div>
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
                <Sparkles size={15} className="text-[#2563EB]" />
                AI Generated Highlights
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {details.aiHighlights.map((highlight) => (
                  <li key={highlight} className="text-sm text-[#334155]">
                    • {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
        >
          {expanded ? "Read Less" : "Read More"}
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>
    </section>
  );
}
