/**
 * URL safety helpers for content-authored links and embeds.
 *
 * Content can come from a CMS, so never pass an unvalidated scheme to `href`
 * or iframe `src`. Only relative paths, fragments, `mailto:`/`tel:`, and
 * `http(s):` URLs are allowed.
 */

const ALLOWED_SCHEMES = new Set(["http:", "https:"]);

/** Return a normalized absolute `http(s)` URL, or `undefined` for anything else. */
export function safeHttpUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;

  try {
    const url = new URL(trimmed);
    return ALLOWED_SCHEMES.has(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Return a safe `href` for an anchor. Allows relative paths and fragments as
 * well as `http(s)`, `mailto:`, and `tel:` URLs.
 */
export function safeHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;

  if (trimmed.startsWith("#")) return trimmed;

  // Relative path (no scheme).
  if (!/^[a-z][a-z0-9+.-]*:/iu.test(trimmed)) return trimmed;

  if (/^mailto:/iu.test(trimmed) || /^tel:/iu.test(trimmed)) return trimmed;

  return safeHttpUrl(trimmed);
}
