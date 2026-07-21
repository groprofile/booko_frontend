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
  /** Amenity/equipment/service labels — rendered as small outlined
   * icon+label pills, myHQ-style (max 2 shown, rest collapse to "+N"). */
  tags?: string[];
  maxTags?: number;
  priceBlock: ReactNode;
  actions: ReactNode;
  /** Accepted for backwards compatibility with existing call sites — no
   * longer changes the card's own layout (see note below). */
  layout?: "row" | "grid";
}

function AmenityPillRow({ tags, maxTags }: { tags: string[]; maxTags: number }) {
  const visible = tags.slice(0, maxTags);
  const extra = Math.max(0, tags.length - maxTags);
  if (!visible.length) return null;
  return (
    <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
      {visible.map((tag) => {
        const Icon = resolveAmenityIcon(tag);
        return (
          <span
            key={tag}
            className="inline-flex max-w-[130px] shrink-0 items-center gap-1 truncate rounded-full border border-border px-2 py-1 text-[11px] font-medium text-secondary-text"
          >
            <Icon size={12} strokeWidth={1.75} className="shrink-0 text-muted-text" />
            <span className="truncate">{tag}</span>
          </span>
        );
      })}
      {extra > 0 && <span className="shrink-0 text-[11px] font-medium text-muted-text">+{extra}</span>}
    </div>
  );
}

/**
 * Shared myHQ-style listing card. myHQ's own "Grid" view isn't a different
 * card design — it's this exact same horizontal row card, just wrapped in a
 * 2-column page grid instead of stacked in one column (verified by
 * inspecting myhq.in directly). Critically, the card has no fixed height:
 * it sizes to its own content, top-aligned, with normal margins — that's
 * what keeps it free of dead space regardless of how many amenity tags or
 * how much text a given listing has. The `layout` prop only controls the
 * *page's* wrapping grid (see the six listing pages), not this component.
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
  maxTags = 2,
  priceBlock,
  actions,
}: ListingCardShellProps) {
  return (
    <div className="group flex overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link
        to={href}
        className="group/image relative w-[240px] shrink-0 overflow-hidden max-sm:w-[120px]"
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

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {ratingBadge}
          {extraBadges}
        </div>

        <Link to={href} className="mt-1.5 block truncate text-sm font-bold text-primary-text hover:text-primary-blue">
          {title}
        </Link>
        {subtitle && <p className="truncate text-[11px] font-semibold text-secondary-text">{subtitle}</p>}

        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-text">
          <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
          <span className="truncate">
            {locality}
            {typeof distanceKm === "number" ? ` · ${distanceKm} km` : ""}
          </span>
        </p>

        <AmenityPillRow tags={tags ?? []} maxTags={maxTags} />

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
          {priceBlock}
          <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
        </div>
      </div>
    </div>
  );
}
