import { describe, expect, it } from "vitest";

import { parsePhotoSets, parsePosts, parseProjects } from "@/content/validate";

const baseEntry = {
  id: "1",
  slug: "entry",
  title: "Entry",
  excerpt: "Excerpt",
  publishedAt: "2026-01-01T00:00:00.000Z",
  tags: [],
  images: [],
};

const tree = [
  { type: "paragraph", children: [{ type: "text", value: "Hello" }] },
  {
    type: "gallery",
    images: [{ src: "https://example.com/a.jpg", alt: "A", caption: "Caption" }],
  },
];

describe("snapshot validation", () => {
  it("accepts canonical snapshot entries", () => {
    expect(parsePosts([{ ...baseEntry, content: tree }])).toHaveLength(1);
    expect(parseProjects([{ ...baseEntry, content: tree, gallery: [] }])).toHaveLength(1);
    expect(parsePhotoSets([{ ...baseEntry, content: tree }])).toHaveLength(1);
  });

  it("rejects the old string content shape", () => {
    expect(() => parsePosts([{ ...baseEntry, content: "<p>Hello</p>" }])).toThrow(
      /does not match the canonical type/u,
    );
  });

  it("rejects embed providers outside the canonical union", () => {
    expect(() =>
      parsePosts([
        {
          ...baseEntry,
          content: [{ type: "embed", provider: "vimeo", html: "<iframe></iframe>" }],
        },
      ]),
    ).toThrow(/does not match the canonical type/u);
  });

  it("rejects malformed nested blocks", () => {
    expect(() =>
      parsePosts([
        {
          ...baseEntry,
          content: [{ type: "list", ordered: false, items: [[{ type: "paragraph" }]] }],
        },
      ]),
    ).toThrow(/does not match the canonical type/u);
  });
});
