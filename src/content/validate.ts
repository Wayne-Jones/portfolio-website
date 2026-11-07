import type { PhotoSet, Post, Project } from "./types.ts";
import {
  isAuthor,
  isContentBlockArray,
  isGalleryImage,
  isOptionalNumber,
  isOptionalString,
  isRecord,
  isStringArray,
} from "./validate-content.ts";

/**
 * Runtime validation for committed/generated content snapshots.
 *
 * The JSON files in `src/content/data/` are build artifacts, but they are also
 * committed and imported directly by `StaticAdapter`. Validating them at the
 * boundary keeps the canonical types honest: a stale snapshot (for example one
 * still storing HTML strings) fails loudly instead of reaching the renderer.
 *
 * Node-level guards live in `validate-content.ts`.
 */

export function isPost(value: unknown): value is Post {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.excerpt === "string" &&
    isContentBlockArray(value.content) &&
    isOptionalString(value.featureImage) &&
    typeof value.publishedAt === "string" &&
    isOptionalString(value.updatedAt) &&
    isOptionalNumber(value.readingTime) &&
    isStringArray(value.tags) &&
    (value.author === undefined || isAuthor(value.author))
  );
}

export function isProject(value: unknown): value is Project {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.excerpt === "string" &&
    isContentBlockArray(value.content) &&
    isOptionalString(value.featureImage) &&
    typeof value.publishedAt === "string" &&
    isOptionalString(value.role) &&
    isOptionalString(value.client) &&
    isOptionalNumber(value.year) &&
    (value.gallery === undefined ||
      (Array.isArray(value.gallery) &&
        value.gallery.every((image: unknown) => isGalleryImage(image)))) &&
    isStringArray(value.tags) &&
    (value.author === undefined || isAuthor(value.author))
  );
}

export function isPhotoSet(value: unknown): value is PhotoSet {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.excerpt === "string" &&
    isContentBlockArray(value.content) &&
    isOptionalString(value.coverImage) &&
    typeof value.publishedAt === "string" &&
    isOptionalString(value.location) &&
    isOptionalString(value.camera) &&
    isStringArray(value.images) &&
    isStringArray(value.tags) &&
    (value.author === undefined || isAuthor(value.author))
  );
}

function parseCollection<T>(
  value: unknown,
  guard: (entry: unknown) => entry is T,
  label: string,
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${label} snapshot: expected an array`);
  }
  const entries: unknown[] = value;
  const valid: T[] = [];
  for (const [index, entry] of entries.entries()) {
    if (!guard(entry)) {
      throw new Error(
        `Invalid ${label} snapshot at index ${index}: entry does not match the canonical type`,
      );
    }
    valid.push(entry);
  }
  return valid;
}

export function parsePosts(value: unknown): Post[] {
  return parseCollection(value, isPost, "posts");
}

export function parseProjects(value: unknown): Project[] {
  return parseCollection(value, isProject, "projects");
}

export function parsePhotoSets(value: unknown): PhotoSet[] {
  return parseCollection(value, isPhotoSet, "photo sets");
}
