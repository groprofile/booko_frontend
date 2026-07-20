import { apiGet } from "./api";
import type { CentreApiRow } from "./centreAdapter";

/**
 * Fetch a small "featured-first" feed for a product type.
 *
 * Admin-promoted centers (`featured=true`) lead the rail; top-rated centers
 * backfill the remaining slots so it is never empty and never shows the same
 * center twice. Promoted rows keep their `is_featured` flag so the caller can
 * render the "Bokko Recommended" badge on them.
 *
 * Both requests fail soft (empty list) so one slow/broken endpoint never blanks
 * the whole rail. Shared by the home "Bokko Recommended" and "Top Spaces" rails
 * so the merge/de-dupe logic lives in exactly one place.
 */
export async function fetchFeaturedFirst(
  productType: string,
  pageSize = 4,
): Promise<CentreApiRow[]> {
  const qs = `productType=${productType}&pageSize=${pageSize}`;
  const [featured, topRated] = await Promise.all([
    apiGet<{ data: CentreApiRow[] }>(`/centers/list?${qs}&featured=true`).catch(() => ({ data: [] })),
    apiGet<{ data: CentreApiRow[] }>(`/centers/list?${qs}&sort=rating`).catch(() => ({ data: [] })),
  ]);

  const seen = new Set<string>();
  const merged: CentreApiRow[] = [];
  for (const row of [...featured.data, ...topRated.data]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(row);
  }
  return merged.slice(0, pageSize);
}

interface NearbyOptions {
  /** Center currently being viewed — excluded from its own "Nearby" rail. */
  excludeId?: string;
  pageSize?: number;
  /** Search radius in km passed to the backend distance query. */
  radius?: number;
}

/**
 * Fetch a "Nearby" feed for a detail page, promoted-first.
 *
 * Calls `/centers/list` with the viewed center's coordinates and `sort=distance`
 * (the backend's one deliberately-honest, non-promoted ordering). We then float
 * admin-promoted centers to the top — ordered by `featured_rank` — with the
 * remaining centers left in pure distance order. If nothing nearby is promoted,
 * this degrades to a plain closest-first list.
 *
 * When the viewed center has no coordinates, we fall back to a non-geo
 * top-rated fetch so the rail is never empty. Fails soft (empty list) so a slow
 * or broken endpoint never blanks the section.
 */
export async function fetchNearbyPromotedFirst(
  productType: string,
  lat: number | null | undefined,
  lng: number | null | undefined,
  { excludeId, pageSize = 8, radius = 25 }: NearbyOptions = {},
): Promise<CentreApiRow[]> {
  // Over-fetch so that dropping the current center still leaves a full rail.
  const fetchSize = pageSize + 1;
  const hasCoords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  const qs = hasCoords
    ? `productType=${productType}&pageSize=${fetchSize}&lat=${lat}&lng=${lng}&radius=${radius}&sort=distance`
    : `productType=${productType}&pageSize=${fetchSize}&sort=rating`;

  const { data } = await apiGet<{ data: CentreApiRow[] }>(`/centers/list?${qs}`).catch(() => ({
    data: [] as CentreApiRow[],
  }));

  const rows = (data ?? []).filter((row) => row.id !== excludeId);

  // Promoted centers lead (by admin priority), the rest keep distance order.
  const rank = (r: CentreApiRow) => (r.featured_rank == null ? Number.POSITIVE_INFINITY : r.featured_rank);
  const promoted = rows.filter((r) => r.is_featured).sort((a, b) => rank(a) - rank(b));
  const rest = rows.filter((r) => !r.is_featured);

  const seen = new Set<string>();
  const merged: CentreApiRow[] = [];
  for (const row of [...promoted, ...rest]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(row);
  }
  return merged.slice(0, pageSize);
}
