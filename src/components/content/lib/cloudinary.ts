/**
 * Cloudinary URL helpers for responsive `srcset` emission.
 *
 * Only URLs that point at the configured cloud
 * (`res.cloudinary.com/<VITE_CLOUDINARY_CLOUD_NAME>/image/upload/...`) are
 * transformed. When the env var is unset, or the URL belongs to a different
 * cloud, callers fall back to the original source.
 */
import { useMemo } from "react";

/** Responsive widths emitted as Cloudinary `c_scale,w_<N>` variants. */
export const CLOUDINARY_WIDTHS = [400, 800, 1200, 1600] as const;

/** Extended widths for priority hero images. */
export const CLOUDINARY_HERO_WIDTHS = [400, 800, 1200, 1600, 2400, 3200] as const;

/** Width used for the plain `src` fallback (closest to typical content width). */
export const CLOUDINARY_DEFAULT_WIDTH = 1200;

/** Width used for the plain `src` fallback on hero images. */
export const CLOUDINARY_HERO_DEFAULT_WIDTH = 1600;

/** Sizes hint matching the article measure used by the renderer. */
export const CONTENT_IMAGE_SIZES = "(min-width: 768px) 720px, 100vw";

/** Sizes hint for a full-width detail-page hero. */
export const HERO_IMAGE_SIZES = "(min-width: 1024px) 1024px, 100vw";

const CLOUDINARY_HOST = "res.cloudinary.com";
const IMAGE_UPLOAD_SEGMENT = "/image/upload/";
/** Matches a leading Cloudinary transformation segment, e.g. `c_scale,w_400`. */
const TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/]+$/iu;
/** Format and quality negotiation appended to every generated variant. */
const FORMAT_TOKENS = "f_auto,q_auto";
/** Tiny blurred variant used as the blur-up placeholder. */
const LQIP_TRANSFORM = "w_40,e_blur:1000,q_auto,f_auto";

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

/** Insert a transformation segment before the version/public-id tail. */
function insertTransform(src: string, transform: string): string | undefined {
  const parsed = parseCloudinaryUrl(src);
  if (parsed === undefined || isAlreadyTransformed(parsed.tail)) return undefined;
  return `${parsed.origin}${parsed.prefix}${transform}/${parsed.tail}${parsed.search}${parsed.hash}`;
}

/** Insert a `c_scale,w_<width>` transformation into a Cloudinary URL. */
export function cloudinaryImageAtWidth(src: string, width: number): string | undefined {
  return insertTransform(src, `c_scale,w_${width},${FORMAT_TOKENS}`);
}

/** Build a tiny blurred Cloudinary URL for the blur-up placeholder. */
export function cloudinaryLqip(src: string): string | undefined {
  return insertTransform(src, LQIP_TRANSFORM);
}

/**
 * Build a `srcset` string for the configured Cloudinary cloud.
 * Returns `undefined` for non-Cloudinary (or already-transformed) URLs so
 * callers can skip the attribute.
 */
export function cloudinarySrcSet(
  src: string,
  widths: readonly number[] = CLOUDINARY_WIDTHS,
): string | undefined {
  const variants = widths
    .map((width) => {
      const url = cloudinaryImageAtWidth(src, width);
      return url === undefined ? undefined : `${url} ${width}w`;
    })
    .filter((variant): variant is string => variant !== undefined);

  return variants.length === 0 ? undefined : variants.join(", ");
}

/**
 * Pick a default `src` for a Cloudinary image. Falls back to the original URL
 * when the transformation cannot be applied.
 */
export function cloudinaryDefaultSrc(
  src: string,
  width: number = CLOUDINARY_DEFAULT_WIDTH,
): string {
  const transformed = cloudinaryImageAtWidth(src, width);
  if (transformed !== undefined) return transformed;
  return src;
}

export interface CloudinaryImageOptions {
  /** Width candidates to emit in the `srcset`. */
  widths?: readonly number[];
  /** Responsive `sizes` hint; only returned when a `srcset` was generated. */
  sizes?: string;
  /** Width used for the plain `src` fallback. */
  defaultWidth?: number;
  /** Generate a tiny blurred variant for a blur-up placeholder. */
  lqip?: boolean;
}

export interface CloudinaryImageResult {
  src: string;
  srcSet: string | undefined;
  sizes: string | undefined;
  lqip: string | undefined;
  isCloudinary: boolean;
}

/** Pure resolver behind `useCloudinaryImage`, exported for tests and non-React callers. */
export function resolveCloudinaryImage(
  src: string,
  options: CloudinaryImageOptions = {},
): CloudinaryImageResult {
  const {
    widths = CLOUDINARY_WIDTHS,
    sizes,
    defaultWidth = CLOUDINARY_DEFAULT_WIDTH,
    lqip = false,
  } = options;
  const isCloudinary = isCloudinaryImageUrl(src);
  const srcSet = isCloudinary ? cloudinarySrcSet(src, widths) : undefined;
  const usable = srcSet !== undefined;

  return {
    src: usable ? cloudinaryDefaultSrc(src, defaultWidth) : src,
    srcSet,
    sizes: usable ? sizes : undefined,
    lqip: usable && lqip ? cloudinaryLqip(src) : undefined,
    isCloudinary,
  };
}

/**
 * Resolve a Cloudinary source into `src`, `srcSet`, `sizes`, and an optional
 * LQIP URL. Non-Cloudinary sources pass through untouched.
 */
export function useCloudinaryImage(
  src: string,
  options: CloudinaryImageOptions = {},
): CloudinaryImageResult {
  const { widths = CLOUDINARY_WIDTHS, sizes, defaultWidth, lqip = false } = options;
  return useMemo(
    () => resolveCloudinaryImage(src, { widths, sizes, defaultWidth, lqip }),
    [src, widths, sizes, defaultWidth, lqip],
  );
}
