interface ListingCardSkeletonProps {
  /** Accepted for backwards compatibility — the real card no longer has a
   * separate grid shape, so this no longer changes anything here either. */
  layout?: "row" | "grid";
}

/**
 * Shared loading placeholder matching ListingCardShell's natural-height
 * frame, so every listing page shows a shape close to what the real card
 * will render into (no jarring shape-flash once data arrives).
 */
export default function ListingCardSkeleton({ layout }: ListingCardSkeletonProps) {
  void layout;
  return (
    <div className="flex overflow-hidden rounded-sm border border-border bg-card shadow-soft">
      <div className="w-[240px] shrink-0 animate-pulse bg-bg max-sm:w-[120px]" style={{ minHeight: 160 }} />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="h-4 w-24 animate-pulse rounded-sm bg-bg" />
        <div className="mt-1 h-4 w-3/4 animate-pulse rounded-sm bg-bg" />
        <div className="h-3 w-1/2 animate-pulse rounded-sm bg-bg" />
        <div className="flex gap-1.5">
          <div className="h-6 w-20 animate-pulse rounded-full bg-bg" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-bg" />
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="h-5 w-16 animate-pulse rounded-sm bg-bg" />
          <div className="h-8 w-20 animate-pulse rounded-sm bg-bg" />
        </div>
      </div>
    </div>
  );
}
