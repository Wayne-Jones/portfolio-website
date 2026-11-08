/**
 * Pagination helpers shared by listing routes and the build-time route
 * enumeration in `vite.config.ts`.
 *
 * The URL scheme is `/<base>` for page 1 and `/<base>/page/N` for later
 * pages. `/page/1` is not canonical; the route redirects it to `/<base>`.
 */

/** Default number of items per listing page. */
export const pageSize = 12;

/** Page-count envelope for a listing. */
export interface PaginationEnvelope {
  /** Total number of pages, always at least 1. */
  pageCount: number;
  /** Highest valid page number. Mirrors `pageCount`. */
  lastPage: number;
}

/** Computes how many pages a collection of `totalCount` items occupies. */
export function paginate(totalCount: number, perPage: number = pageSize): PaginationEnvelope {
  const size = normalizeSize(perPage);
  const pageCount = Math.max(1, Math.ceil(Math.max(0, totalCount) / size));
  return { pageCount, lastPage: pageCount };
}

/** Returns the slice of `items` that belongs on `page` (1-based). */
export function resolvePage<T>(items: readonly T[], page: number, perPage: number = pageSize): T[] {
  const size = normalizeSize(perPage);
  const current = Math.max(1, Math.floor(page));
  const start = (current - 1) * size;
  return items.slice(start, start + size);
}

/**
 * Enumerates the concrete listing paths for a collection: `basePath` for
 * page 1 followed by `basePath/page/2`, `basePath/page/3`, ...
 */
export function paginationPaths(
  basePath: string,
  totalCount: number,
  perPage: number = pageSize,
): string[] {
  const { pageCount } = paginate(totalCount, perPage);
  const paths = [basePath];
  for (let page = 2; page <= pageCount; page += 1) {
    paths.push(`${basePath}/page/${page}`);
  }
  return paths;
}

/**
 * Parses a `$page` route segment.
 *
 * Only canonical positive integers are accepted — `"2"` is valid, while
 * `"0"`, `"01"`, `"2.5"`, and `"abc"` all return `null`.
 */
export function parsePageNumber(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || String(parsed) !== value) {
    return null;
  }
  return parsed;
}

function normalizeSize(value: number): number {
  return Math.max(1, Math.floor(value));
}
