// Helpers for building listing-filter option lists from the *actual* fetched
// data rather than static mock arrays. This keeps every filter honest: the
// sidebar only ever offers values that some real centre in the current result
// set can match, so selecting one never silently returns zero results.

/** Deduped, non-empty, alphabetically sorted list of string values. */
export function uniqueSorted(values: (string | null | undefined)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    if (v && v.trim()) set.add(v.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
