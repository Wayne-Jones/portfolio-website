import type { Photo, PhotoSet } from "./types.ts";

/**
 * Projects one representative photo per photo set for the homepage preview.
 *
 * Prefers the set cover image and falls back to the first image. Sets with no
 * usable image are skipped, and at most `limit` photos are returned.
 */
export function buildFeaturedPhotos(sets: readonly PhotoSet[], limit: number): Photo[] {
  const photos: Photo[] = [];
  if (limit <= 0) return photos;

  for (const set of sets) {
    const cover = set.coverImage;
    const src = cover !== undefined && cover !== "" ? cover : set.images[0];
    if (src === undefined || src === "") continue;

    photos.push({
      src,
      alt: set.title,
      aspect: "landscape",
      setSlug: set.slug,
    });
    if (photos.length >= limit) break;
  }

  return photos;
}
