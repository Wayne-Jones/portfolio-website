import type { Post } from "../../types.ts";

export const mockPosts: Post[] = [
  {
    id: "post-1",
    slug: "designing-for-the-quiet-web",
    title: "Designing for the quiet web",
    excerpt: "Notes on visual hierarchy, restraint, and the studio-craft aesthetic.",
    content: [
      {
        type: "heading",
        level: 2,
        id: "the-quiet-web",
        children: [{ type: "text", value: "The quiet web" }],
      },
      {
        type: "paragraph",
        children: [
          { type: "text", value: "This is placeholder blog content that documents the canonical " },
          { type: "strong", children: [{ type: "text", value: "content tree" }] },
          { type: "text", value: " shape. Read more in the " },
          { type: "link", href: "/blog", children: [{ type: "text", value: "writing index" }] },
          { type: "text", value: " and check " },
          { type: "inlineCode", value: "VITE_CMS=ghost" },
          { type: "text", value: " for live content." },
        ],
      },
      {
        type: "image",
        src: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        alt: "A quiet studio desk",
        caption: "Placeholder image block",
      },
      {
        type: "codeBlock",
        language: "typescript",
        code: 'const tree: ContentTree = [{ type: "divider" }];',
      },
    ],
    featureImage: undefined,
    publishedAt: "2026-01-01T00:00:00.000Z",
    readingTime: 4,
    tags: ["design", "essays"],
  },
  {
    id: "post-2",
    slug: "on-type-systems",
    title: "On type systems",
    excerpt: "Why Switzer + Inter pair well, and how fluid type scales beat rigid breakpoints.",
    content: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Placeholder content for the second blog post",
          },
        ],
      },
    ],
    publishedAt: "2026-01-01T00:00:00.000Z",
    readingTime: 6,
    tags: ["typography"],
  },
  {
    id: "post-3",
    slug: "building-with-restraint",
    title: "Building with restraint",
    excerpt: "Why the best interfaces often say the least, and how constraints breed creativity.",
    content: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Placeholder content for the third blog post",
          },
        ],
      },
    ],
    publishedAt: "2026-01-01T00:00:00.000Z",
    readingTime: 5,
    tags: ["design", "craft"],
  },
  {
    id: "post-4",
    slug: "a-field-guide-to-spacing",
    title: "A field guide to spacing",
    excerpt: "A practical scale for margins, padding, and the gaps between things.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the fourth blog post" }],
      },
    ],
    featureImage:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2025-12-18T00:00:00.000Z",
    readingTime: 5,
    tags: ["design", "craft"],
  },
  {
    id: "post-5",
    slug: "notes-on-editorial-grids",
    title: "Notes on editorial grids",
    excerpt: "Why a twelve-column grid is rarely the right answer for long-form reading.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the fifth blog post" }],
      },
    ],
    publishedAt: "2025-12-02T00:00:00.000Z",
    readingTime: 6,
    tags: ["design", "typography"],
  },
  {
    id: "post-6",
    slug: "type-at-small-sizes",
    title: "Type at small sizes",
    excerpt: "Optical sizing, tracking, and the compromises behind legible captions.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the sixth blog post" }],
      },
    ],
    publishedAt: "2025-11-20T00:00:00.000Z",
    readingTime: 4,
    tags: ["typography"],
  },
  {
    id: "post-7",
    slug: "the-case-for-fewer-colors",
    title: "The case for fewer colors",
    excerpt: "Constraint as a design tool, and what happens when a palette stops growing.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the seventh blog post" }],
      },
    ],
    publishedAt: "2025-11-05T00:00:00.000Z",
    readingTime: 5,
    tags: ["design", "color"],
  },
  {
    id: "post-8",
    slug: "writing-css-that-ages-well",
    title: "Writing CSS that ages well",
    excerpt: "Small rules, boring selectors, and leaving room for the next person.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the eighth blog post" }],
      },
    ],
    featureImage:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2025-10-22T00:00:00.000Z",
    readingTime: 7,
    tags: ["engineering", "css"],
  },
  {
    id: "post-9",
    slug: "quiet-motion-in-interfaces",
    title: "Quiet motion in interfaces",
    excerpt: "Motion should explain a change, not announce itself.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the ninth blog post" }],
      },
    ],
    publishedAt: "2025-10-08T00:00:00.000Z",
    readingTime: 4,
    tags: ["design", "motion"],
  },
  {
    id: "post-10",
    slug: "building-a-snapshot-pipeline",
    title: "Building a snapshot pipeline",
    excerpt: "Making a content-driven site build without a network connection.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the tenth blog post" }],
      },
    ],
    publishedAt: "2025-09-24T00:00:00.000Z",
    readingTime: 8,
    tags: ["engineering", "build"],
  },
  {
    id: "post-11",
    slug: "reading-the-browsers-defaults",
    title: "Reading the browser's defaults",
    excerpt: "What the platform already gives you before a single line of CSS.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the eleventh blog post" }],
      },
    ],
    featureImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2025-09-10T00:00:00.000Z",
    readingTime: 5,
    tags: ["engineering", "css"],
  },
  {
    id: "post-12",
    slug: "on-slow-websites",
    title: "On slow websites",
    excerpt: "Performance as an editorial decision, not a technical afterthought.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the twelfth blog post" }],
      },
    ],
    publishedAt: "2025-08-27T00:00:00.000Z",
    readingTime: 6,
    tags: ["engineering", "performance"],
  },
  {
    id: "post-13",
    slug: "designing-with-constraints",
    title: "Designing with constraints",
    excerpt: "A fixed palette, one typeface, and the freedom that follows.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the thirteenth blog post" }],
      },
    ],
    publishedAt: "2025-08-13T00:00:00.000Z",
    readingTime: 4,
    tags: ["design", "craft"],
  },
  {
    id: "post-14",
    slug: "a-year-of-side-projects",
    title: "A year of side projects",
    excerpt: "What stuck, what didn't, and the patterns between them.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the fourteenth blog post" }],
      },
    ],
    publishedAt: "2025-07-30T00:00:00.000Z",
    readingTime: 7,
    tags: ["essays"],
  },
  {
    id: "post-15",
    slug: "what-i-learned-shipping-weekly",
    title: "What I learned shipping weekly",
    excerpt: "A year of small releases, and why the cadence mattered more than the features.",
    content: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Placeholder content for the fifteenth blog post" }],
      },
    ],
    publishedAt: "2025-07-16T00:00:00.000Z",
    readingTime: 6,
    tags: ["essays", "process"],
  },
];
