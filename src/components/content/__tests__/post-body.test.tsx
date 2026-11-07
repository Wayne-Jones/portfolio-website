import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PostBody } from "@/components/content/PostBody";
import type { ContentBlock } from "@/content/types";

import { render } from "./test-utils";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

function paragraphWithLink(href: string, text: string): ContentBlock[] {
  return [
    {
      type: "paragraph",
      children: [{ type: "link", href, children: [{ type: "text", value: text }] }],
    },
  ];
}

describe("PostBody dispatcher", () => {
  it("renders blocks in tree order", () => {
    const tree: ContentBlock[] = [
      { type: "heading", level: 2, id: "intro", children: [{ type: "text", value: "Intro" }] },
      { type: "paragraph", children: [{ type: "text", value: "First" }] },
      { type: "divider" },
    ];

    const html = render(<PostBody content={tree} />);

    expect(html.indexOf("Intro")).toBeLessThan(html.indexOf("First"));
    expect(html).toContain("data-content-divider");
  });
});

describe("PostBody links", () => {
  it("renders internal links through the router", () => {
    const html = render(<PostBody content={paragraphWithLink("/blog", "Blog")} />);

    expect(html).toContain('href="/blog"');
    expect(html).toContain(">Blog</a>");
  });

  it("renders external links in a new tab", () => {
    const html = render(
      <PostBody content={paragraphWithLink("https://example.com/post", "Post")} />,
    );

    expect(html).toContain('href="https://example.com/post"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders unsafe link schemes as plain text", () => {
    const html = render(<PostBody content={paragraphWithLink("javascript:alert(1)", "Unsafe")} />);

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a ");
  });
});
