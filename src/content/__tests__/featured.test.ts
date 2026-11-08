import { describe, expect, it } from "vitest";

import { buildFeaturedPhotos } from "@/content/featured";
import type { PhotoSet } from "@/content/types";

function photoSet(overrides: Partial<PhotoSet> & Pick<PhotoSet, "id" | "slug">): PhotoSet {
  return {
    title: `Set ${overrides.slug}`,
    excerpt: "",
    content: [],
    publishedAt: "2026-01-01T00:00:00.000Z",
    images: [],
    tags: [],
    ...overrides,
  };
}

describe("buildFeaturedPhotos sources", () => {
  it("prefers the cover image", () => {
    const photos = buildFeaturedPhotos(
      [
        photoSet({
          id: "1",
          slug: "cover",
          title: "Cover set",
          coverImage: "https://example.com/cover.jpg",
          images: ["https://example.com/first.jpg"],
        }),
      ],
      6,
    );

    expect(photos).toEqual([
      {
        src: "https://example.com/cover.jpg",
        alt: "Cover set",
        aspect: "landscape",
        setSlug: "cover",
      },
    ]);
  });

  it("falls back to the first image when the cover is missing or empty", () => {
    const photos = buildFeaturedPhotos(
      [
        photoSet({ id: "1", slug: "no-cover", images: ["https://example.com/first.jpg"] }),
        photoSet({
          id: "2",
          slug: "empty-cover",
          coverImage: "",
          images: ["https://example.com/second.jpg"],
        }),
      ],
      6,
    );

    expect(photos.map((photo) => photo.src)).toEqual([
      "https://example.com/first.jpg",
      "https://example.com/second.jpg",
    ]);
  });
});

describe("buildFeaturedPhotos selection", () => {
  it("skips sets with no usable image", () => {
    const photos = buildFeaturedPhotos(
      [
        photoSet({ id: "1", slug: "empty" }),
        photoSet({ id: "2", slug: "empty-first", images: [""] }),
        photoSet({ id: "3", slug: "usable", images: ["https://example.com/usable.jpg"] }),
      ],
      6,
    );

    expect(photos.map((photo) => photo.setSlug)).toEqual(["usable"]);
  });

  it("returns one photo per set", () => {
    const photos = buildFeaturedPhotos(
      [
        photoSet({
          id: "1",
          slug: "one",
          images: ["https://example.com/one-a.jpg", "https://example.com/one-b.jpg"],
        }),
        photoSet({
          id: "2",
          slug: "two",
          images: ["https://example.com/two-a.jpg", "https://example.com/two-b.jpg"],
        }),
      ],
      6,
    );

    expect(photos).toHaveLength(2);
    expect(photos.map((photo) => photo.src)).toEqual([
      "https://example.com/one-a.jpg",
      "https://example.com/two-a.jpg",
    ]);
  });
});

describe("buildFeaturedPhotos limit", () => {
  it("respects the limit and rejects non-positive values", () => {
    const sets = Array.from({ length: 5 }, (_, index) =>
      photoSet({
        id: String(index),
        slug: `set-${index}`,
        images: [`https://example.com/${index}.jpg`],
      }),
    );

    expect(buildFeaturedPhotos(sets, 2)).toHaveLength(2);
    expect(buildFeaturedPhotos(sets, 0)).toEqual([]);
    expect(buildFeaturedPhotos(sets, -1)).toEqual([]);
  });
});
