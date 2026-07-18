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
