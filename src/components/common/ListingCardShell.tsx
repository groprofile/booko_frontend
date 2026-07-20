import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { resolveAmenityIcon } from "../../lib/amenityIcons";

interface ListingCardShellProps {
  href: string;
  images: string[];
  name: string;
  imageIndex?: number;
  onPrevImage?: () => void;
  onNextImage?: () => void;
  topLeftBadge?: ReactNode;
  topRightBadge?: ReactNode;
  ratingBadge?: ReactNode;
  extraBadges?: ReactNode;
  title: string;
  subtitle?: string;
  locality: string;
  distanceKm?: number;
  /** Amenity/equipment/service labels — rendered as small resolved icons
   * (myHQ-style), not text pills. */
  tags?: string[];
  maxTags?: number;
  priceBlock: ReactNode;
  actions: ReactNode;
  /** "row" (default) — horizontal card for a single-column list.
   * "grid" — vertical card (image on top) sized for a 2-up grid. */
  layout?: "row" | "grid";
}

function AmenityIconRow({ tags, maxTags }: { tags: string[]; maxTags: number }) {
  const visible = tags.slice(0, maxTags);
  const extra = Math.max(0, tags.length - maxTags);
  // Always occupy the same height (a fixed slot), whether a listing has 0
  // tags or several — this is what keeps every card exactly the same size
  // regardless of how much data an individual listing has.
  return (
    <div className="mt-1.5 flex h-6 items-center gap-1.5">
      {visible.map((tag) => {
        const Icon = resolveAmenityIcon(tag);
        return (
          <span
            key={tag}
            title={tag}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary-blue/15 bg-primary-blue/8 text-primary-blue"
          >
            <Icon size={12} strokeWidth={1.75} />
          </span>
        );
      })}
      {extra > 0 && <span className="shrink-0 text-[11px] font-medium text-muted-text">+{extra}</span>}
    </div>
  );
}

/**
 * Shared myHQ-style listing card. Two fixed-size layouts share the same
 * content contract so every card on every listing page — Day Pass, Hotel,
 * Meeting Room, Monthly Pass, Virtual Office, Coworking — renders at the
 * exact same size regardless of how much content an individual listing has:
 *  - "row": compact horizontal card for the single-column + map view.
 *  - "grid": compact vertical card for the 2-up grid view.
 */
export default function ListingCardShell({
  href,
  images,
  name,
  imageIndex = 0,
  onPrevImage,
  onNextImage,
  topLeftBadge,
  topRightBadge,
  ratingBadge,
  extraBadges,
  title,
  subtitle,
  locality,
  distanceKm,
  tags,
  maxTags = 4,
  priceBlock,
  actions,
  layout = "row",
}: ListingCardShellProps) {
  const imageBlock = (
    <Link
      to={href}
      className={
        "group/image relative shrink-0 overflow-hidden " +
        (layout === "grid" ? "h-[132px] w-full" : "aspect-[4/3] w-full sm:h-full sm:w-[280px]")
      }
    >
      <img
        src={images[imageIndex]}
        alt={name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/image:scale-105"
      />

      {topLeftBadge && <div className="absolute left-2 top-2 z-10">{topLeftBadge}</div>}
      {topRightBadge && <div className="absolute right-2 top-2 z-10">{topRightBadge}</div>}

      {images.length > 1 && (onPrevImage || onNextImage) && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.preventDefault();
              onPrevImage?.();
            }}
            className="absolute left-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-text opacity-0 shadow-soft transition-opacity hover:bg-white group-hover/image:opacity-100"
          >
            <ChevronLeft size={12} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.preventDefault();
              onNextImage?.();
            }}
            className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-text opacity-0 shadow-soft transition-opacity hover:bg-white group-hover/image:opacity-100"
          >
            <ChevronRight size={12} strokeWidth={1.75} />
          </button>
        </>
      )}
    </Link>
  );

  const contentBlock = (
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 overflow-hidden p-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {ratingBadge}
          {extraBadges}
        </div>

        <Link to={href} className="mt-1 block truncate text-sm font-bold text-primary-text hover:text-primary-blue">
          {title}
        </Link>
        {subtitle && <p className="truncate text-[11px] font-semibold text-secondary-text">{subtitle}</p>}

        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-text">
          <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">
            {locality}
            {typeof distanceKm === "number" ? ` · ${distanceKm} km` : ""}
          </span>
        </p>

        <AmenityIconRow tags={tags ?? []} maxTags={maxTags} />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        {priceBlock}
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      </div>
    </div>
  );

  if (layout === "grid") {
    return (
      <div className="group flex h-[300px] flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
        {imageBlock}
        {contentBlock}
      </div>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg sm:h-[172px] sm:flex-row">
      {imageBlock}
      {contentBlock}
    </div>
  );
}
