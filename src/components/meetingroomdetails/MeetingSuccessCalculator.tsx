import { CheckCircle2, Sparkles, XCircle } from "lucide-react";

interface MeetingSuccessCalculatorProps {
  durationLabel: string;
  attendees: number;
  teaCoffeeIncluded: boolean;
  wifiIncluded: boolean;
  projectorIncluded: boolean;
  costPerPerson: number;
}

function Row({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#334155]">{label}</span>
      {included ? (
        <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
          <CheckCircle2 size={14} />
          Included
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-semibold text-[#94A3B8]">
          <XCircle size={14} />
          Not Included
        </span>
      )}
    </div>
  );
}

export default function MeetingSuccessCalculator({
  durationLabel,
  attendees,
  teaCoffeeIncluded,
  wifiIncluded,
  projectorIncluded,
  costPerPerson,
}: MeetingSuccessCalculatorProps) {
  return (
    <div className="mt-4 rounded-sm border border-[#2563EB]/20 bg-[#EFF6FF] p-5">
      <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
        <Sparkles size={15} className="text-[#2563EB]" />
        Meeting Success Calculator
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#334155]">Duration</span>
          <span className="font-semibold text-[#0F172A]">{durationLabel}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#334155]">Attendees</span>
          <span className="font-semibold text-[#0F172A]">{attendees}</span>
        </div>
        <Row label="Tea/Coffee" included={teaCoffeeIncluded} />
        <Row label="WiFi" included={wifiIncluded} />
        <Row label="Projector" included={projectorIncluded} />
      </div>

      <div className="mt-4 rounded-sm bg-white px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Estimated Cost Per Person</p>
        <p className="text-2xl font-extrabold text-[#2563EB]">₹{costPerPerson.toLocaleString()}</p>
      </div>
    </div>
  );
}
