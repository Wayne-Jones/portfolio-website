/**
 * Date display helpers.
 *
 * Publication timestamps are ISO 8601 instants (e.g.
 * `2026-01-01T00:00:00.000Z`). Formatting them with `Date#getMonth()` reads the
 * viewer's local timezone, which shifts a midnight-UTC timestamp to the previous
 * day (and sometimes the previous month) west of UTC. Display is therefore
 * always pinned to UTC so the prerendered HTML, the client hydration pass, and
 * the RSS feed agree.
 */

/** `MMM YYYY` formatter pinned to UTC, created once per process. */
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Formats an ISO 8601 timestamp as `MMM YYYY` in UTC.
 * Returns the original string when it cannot be parsed.
 */
export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return MONTH_YEAR.format(date);
}
