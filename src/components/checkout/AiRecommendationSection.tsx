import { Sparkles } from "lucide-react";

interface AiRecommendationSectionProps {
  insights: string[];
}

export default function AiRecommendationSection({ insights }: AiRecommendationSectionProps) {
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#2563EB]/15 bg-[#EFF6FF] p-4">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-[#2563EB]" />
        <p className="text-sm font-bold text-[#0F172A]">Smart Recommendation for You</p>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {insights.map((insight) => (
          <li key={insight} className="text-sm text-[#334155]">
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}
