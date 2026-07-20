import type { LucideIcon } from "lucide-react";
import { resolveAmenityIcon } from "../../lib/amenityIcons";

interface AmenityIconGridProps {
  items: string[];
  /** Optional overrides for specific labels; anything not listed here falls
   * back to the shared keyword-based resolver (see lib/amenityIcons.ts). */
  iconMap?: Record<string, LucideIcon>;
  fallbackIcon?: LucideIcon;
}

/**
 * Shared myHQ-style equipment/amenity row: a circular, lightly frosted
 * blue icon chip above the label, matching myHQ's blue-accented amenity
 * grid rather than a generic bordered square.
 */
export default function AmenityIconGrid({ items, iconMap, fallbackIcon }: AmenityIconGridProps) {
  if (!items.length) {
    return <p className="text-sm text-muted-text">Not added by the workspace yet.</p>;
  }
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-5">
      {items.map((item) => {
        const Icon = iconMap?.[item] ?? fallbackIcon ?? resolveAmenityIcon(item);
        return (
          <div key={item} className="flex w-16 flex-col items-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-blue/15 bg-primary-blue/8 text-primary-blue shadow-soft backdrop-blur-sm">
              <Icon size={19} strokeWidth={1.6} />
            </span>
            <p className="text-xs font-medium leading-tight text-secondary-text">{item}</p>
          </div>
        );
      })}
    </div>
  );
}
