/**
 * Cloudinary URL helpers for responsive `srcset` emission.
 *
 * Only URLs that point at the configured cloud
 * (`res.cloudinary.com/<VITE_CLOUDINARY_CLOUD_NAME>/image/upload/...`) are
 * transformed. When the env var is unset, or the URL belongs to a different
 * cloud, callers fall back to the original source.
 */

/** Responsive widths emitted as Cloudinary `c_scale,w_<N>` variants. */
export const CLOUDINARY_WIDTHS = [400, 800, 1200, 1600] as const;

/** Width used for the plain `src` fallback (closest to typical content width). */
export const CLOUDINARY_DEFAULT_WIDTH = 1200;

const CLOUDINARY_HOST = "res.cloudinary.com";
const IMAGE_UPLOAD_SEGMENT = "/image/upload/";
/** Matches a leading Cloudinary transformation segment, e.g. `c_scale,w_400`. */
const TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/]+$/iu;

function getCloudName(): string | undefined {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (typeof cloudName !== "string") return undefined;
  const trimmed = cloudName.trim();
  return trimmed === "" ? undefined : trimmed;
}

interface ParsedCloudinaryUrl {
  origin: string;
  /** Path up to and including `/image/upload/`. */
  prefix: string;
  /** Everything after `/image/upload/` (version + public id). */
  tail: string;
  search: string;
  hash: string;
}

function parseCloudinaryUrl(src: string): ParsedCloudinaryUrl | undefined {
  const cloudName = getCloudName();
  if (cloudName === undefined) return undefined;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }

  const prefix = `/${cloudName}${IMAGE_UPLOAD_SEGMENT}`;
  if (url.hostname !== CLOUDINARY_HOST || !url.pathname.startsWith(prefix)) {
    return undefined;
  }

  return {
    origin: url.origin,
    prefix,
    tail: url.pathname.slice(prefix.length),
    search: url.search,
    hash: url.hash,
  };
}

/** True when `src` belongs to the configured Cloudinary cloud. */
export function isCloudinaryImageUrl(src: string): boolean {
  return parseCloudinaryUrl(src) !== undefined;
}

function isAlreadyTransformed(tail: string): boolean {
  const firstSegment = tail.split("/")[0] ?? "";
  return TRANSFORM_SEGMENT.test(firstSegment);
}

/** Insert a `c_scale,w_<width>` transformation into a Cloudinary URL. */
export function cloudinaryImageAtWidth(src: string, width: number): string | undefined {
  const parsed = parseCloudinaryUrl(src);
  if (parsed === undefined || isAlreadyTransformed(parsed.tail)) return undefined;
  return `${parsed.origin}${parsed.prefix}c_scale,w_${width}/${parsed.tail}${parsed.search}${parsed.hash}`;
}

/**
 * Build a `srcset` string for the configured Cloudinary cloud.
 * Returns `undefined` for non-Cloudinary (or already-transformed) URLs so
 * callers can skip the attribute.
 */
export function cloudinarySrcSet(src: string): string | undefined {
  if (!isCloudinaryImageUrl(src)) return undefined;

  const variants = CLOUDINARY_WIDTHS.map((width) => {
    const url = cloudinaryImageAtWidth(src, width);
    return url === undefined ? undefined : `${url} ${width}w`;
  }).filter((variant): variant is string => variant !== undefined);

  return variants.length === 0 ? undefined : variants.join(", ");
}

/**
 * Pick a default `src` for a Cloudinary image. Falls back to the original URL
 * when the transformation cannot be applied.
 */
export function cloudinaryDefaultSrc(src: string): string {
  return cloudinaryImageAtWidth(src, CLOUDINARY_DEFAULT_WIDTH) ?? src;
}

/** Sizes hint matching the article measure used by the renderer. */
export const CONTENT_IMAGE_SIZES = "(min-width: 768px) 720px, 100vw";
