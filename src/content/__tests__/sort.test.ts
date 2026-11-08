import { describe, expect, it } from "vitest";

import { sortByPublishedAtDesc, type SortableContent } from "@/content/sort";

function entry(id: string, slug: string, publishedAt: string): SortableContent {
  return { id, slug, publishedAt };
}

describe("sortByPublishedAtDesc", () => {
  it("orders newest-first by publishedAt", () => {
    const sorted = sortByPublishedAtDesc([
      entry("3", "oldest", "2024-01-01T00:00:00.000Z"),
      entry("1", "newest", "2026-01-01T00:00:00.000Z"),
      entry("2", "middle", "2025-01-01T00:00:00.000Z"),
    ]);

    expect(sorted.map((item) => item.slug)).toEqual(["newest", "middle", "oldest"]);
  });

  it("orders equal timestamps by slug, then id", () => {
    const sorted = sortByPublishedAtDesc([
      entry("2", "b", "2026-01-01T00:00:00.000Z"),
      entry("1", "b", "2026-01-01T00:00:00.000Z"),
      entry("3", "a", "2026-01-01T00:00:00.000Z"),
    ]);

    expect(sorted.map((item) => `${item.slug}-${item.id}`)).toEqual(["a-3", "b-1", "b-2"]);
  });

  it("is repeatable and does not mutate the input", () => {
    const input = [
      entry("1", "first", "2025-01-01T00:00:00.000Z"),
      entry("2", "second", "2026-01-01T00:00:00.000Z"),
      entry("3", "third", "2025-01-01T00:00:00.000Z"),
    ];
    const original = [...input];

    const first = sortByPublishedAtDesc(input);
    const second = sortByPublishedAtDesc(input);

    expect(first).not.toBe(input);
    expect(first.map((item) => item.slug)).toEqual(["second", "first", "third"]);
    expect(second.map((item) => item.slug)).toEqual(first.map((item) => item.slug));
    expect(input).toEqual(original);
  });
});
