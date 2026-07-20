interface ListingCardSkeletonProps {
  layout?: "row" | "grid";
}

/**
 * Shared loading placeholder matching ListingCardShell's fixed frame, so
 * every listing page shows the same skeleton shape the real card will
 * render into (no shape-flash once data arrives).
 */
export default function ListingCardSkeleton({ layout = "row" }: ListingCardSkeletonProps) {
  if (layout === "grid") {
    return (
      <div className="flex h-[300px] flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft">
        <div className="h-[132px] w-full animate-pulse bg-bg" />
        <div className="flex flex-1 flex-col justify-between gap-1.5 p-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-16 animate-pulse rounded-sm bg-bg" />
            <div className="h-4 w-3/4 animate-pulse rounded-sm bg-bg" />
            <div className="h-3 w-1/2 animate-pulse rounded-sm bg-bg" />
            <div className="flex gap-1.5">
              <div className="h-6 w-6 animate-pulse rounded-full bg-bg" />
              <div className="h-6 w-6 animate-pulse rounded-full bg-bg" />
              <div className="h-6 w-6 animate-pulse rounded-full bg-bg" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="h-5 w-14 animate-pulse rounded-sm bg-bg" />
            <div className="h-7 w-16 animate-pulse rounded-sm bg-bg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft sm:h-[172px] sm:flex-row">
      <div className="aspect-[4/3] w-full shrink-0 animate-pulse bg-bg sm:h-full sm:w-[280px]" />
      <div className="flex flex-1 flex-col justify-between gap-1.5 p-3">
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-20 animate-pulse rounded-sm bg-bg" />
          <div className="h-4 w-3/4 animate-pulse rounded-sm bg-bg" />
          <div className="h-3 w-1/2 animate-pulse rounded-sm bg-bg" />
          <div className="flex gap-1.5">
            <div className="h-6 w-6 animate-pulse rounded-full bg-bg" />
            <div className="h-6 w-6 animate-pulse rounded-full bg-bg" />
            <div className="h-6 w-6 animate-pulse rounded-full bg-bg" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 w-14 animate-pulse rounded-sm bg-bg" />
          <div className="h-7 w-16 animate-pulse rounded-sm bg-bg" />
        </div>
      </div>
    </div>
  );
}
