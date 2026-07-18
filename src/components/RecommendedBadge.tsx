import { Sparkles } from "lucide-react";

interface RecommendedBadgeProps {
  /** Extra positioning/utility classes (e.g. absolute placement on a card). */
  className?: string;
  /** Compact variant for dense cards / list rows. */
  size?: "sm" | "md";
}

/**
 * The single "Bokko Recommended" badge, shown only on admin-promoted centers.
 * One source of truth for the badge treatment (blue pill, Sparkles) so every
 * discovery surface stays visually consistent instead of duplicating the markup.
 */
export default function RecommendedBadge({ className = "", size = "md" }: RecommendedBadgeProps) {
  const dims = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  const icon = size === "sm" ? 11 : 12;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#2563EB] font-semibold text-white shadow-soft ${dims} ${className}`}
    >
      <Sparkles size={icon} className="fill-white" />
      Bokko Recommended
    </span>
  );
}
