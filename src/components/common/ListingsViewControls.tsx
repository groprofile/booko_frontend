import { LayoutGrid, List as ListIcon, Map } from "lucide-react";

interface ListingsViewControlsProps {
  layout: "list" | "grid";
  onLayoutChange: (layout: "list" | "grid") => void;
  showMap: boolean;
  onToggleMap: () => void;
}

/**
 * Shared myHQ-style view controls for listing pages: a List/Grid segmented
 * toggle for the results layout, plus a Map show/hide toggle (only
 * meaningful in List mode — Grid mode always takes the full width).
 */
export default function ListingsViewControls({ layout, onLayoutChange, showMap, onToggleMap }: ListingsViewControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex overflow-hidden rounded-sm border border-border">
        <button
          type="button"
          onClick={() => onLayoutChange("list")}
          className={
            "flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors " +
            (layout === "list" ? "bg-primary-blue text-white" : "bg-card text-secondary-text hover:bg-bg")
          }
        >
          <ListIcon size={15} />
          List
        </button>
        <button
          type="button"
          onClick={() => onLayoutChange("grid")}
          className={
            "flex items-center gap-1.5 border-l border-border px-3 py-2 text-sm font-semibold transition-colors " +
            (layout === "grid" ? "bg-primary-blue text-white" : "bg-card text-secondary-text hover:bg-bg")
          }
        >
          <LayoutGrid size={15} />
          Grid
        </button>
      </div>

      {layout === "list" && (
        <button
          type="button"
          onClick={onToggleMap}
          className={
            "inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors " +
            (showMap
              ? "border-primary-blue bg-blue-50 text-primary-blue"
              : "border-border bg-card text-secondary-text hover:border-muted-text")
          }
        >
          <Map size={15} />
          {showMap ? "Hide Map" : "Show Map"}
        </button>
      )}
    </div>
  );
}
