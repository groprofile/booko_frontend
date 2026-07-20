import { CheckCircle2, XCircle } from "lucide-react";
import type { MatchScoreItem } from "../../data/monthlyPassDetails";

interface WorkspaceMatchScoreSectionProps {
  items: MatchScoreItem[];
  score: number;
}

export default function WorkspaceMatchScoreSection({ items, score }: WorkspaceMatchScoreSectionProps) {
  return (
    <div className="rounded-sm border border-[#2563EB]/20 bg-[#EFF6FF] p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">Bokko Exclusive</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {items.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A]">
              {item.achieved ? (
                <CheckCircle2 size={15} className="text-[#16A34A]" />
              ) : (
                <XCircle size={15} className="text-[#94A3B8]" />
              )}
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-sm bg-white px-5 py-3 shadow-soft">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Bokko Match Score</p>
            <p className="text-2xl font-extrabold text-[#2563EB]">{score}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
