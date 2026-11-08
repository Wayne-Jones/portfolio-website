/**
 * Deterministic ordering for canonical content collections.
 *
 * Every adapter returns its posts/projects/photo sets through this helper so
 * recent/featured subsets never depend on Ghost response order or snapshot file
 * order.
 */

/** Minimal shape required to order a canonical content collection. */
export interface SortableContent {
  id: string;
  slug: string;
  publishedAt: string;
}

function compareStrings(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function comparePublishedAt(a: string, b: string): number {
  // ISO 8601 strings sort chronologically, but fall back to a string compare
  // when either value is not parseable so ordering stays total.
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);
  if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
    return aTime === bTime ? 0 : aTime - bTime;
  }
  return compareStrings(a, b);
}

/**
 * Returns a new array ordered newest-first by `publishedAt`, with `slug` and
 * then `id` as deterministic tiebreakers.
 */
export function sortByPublishedAtDesc<T extends SortableContent>(items: readonly T[]): T[] {
  return [...items].sort(
    (a, b) =>
      comparePublishedAt(b.publishedAt, a.publishedAt) ||
      compareStrings(a.slug, b.slug) ||
      compareStrings(a.id, b.id),
  );
}
