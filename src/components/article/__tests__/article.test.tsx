import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { ArticleMeta } from "@/components/article/ArticleMeta";

import { render } from "../../content/__tests__/test-utils";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe("ArticleMeta", () => {
  it("renders the author as plain text, not a link", () => {
    const html = render(
      <ArticleMeta
        publishedAt="2026-01-01T00:00:00.000Z"
        author={{ name: "Wayne Jones", slug: "wayne-jones" }}
      />,
    );

    expect(html).toContain("Wayne Jones");
    expect(html).not.toContain('href="/blog"');
    expect(html).not.toContain("Posts by");
  });

  it("hides metadata separators from assistive technology", () => {
    const html = render(<ArticleMeta publishedAt="2026-01-01T00:00:00.000Z" readingTime={5} />);

    expect(html).toContain('<span aria-hidden="true">·</span>');
  });
});

describe("ArticleLayout breadcrumbs", () => {
  it("renders the current title as the final non-link crumb", () => {
    const html = render(
      <ArticleLayout
        breadcrumbs={[{ label: "Blog", to: "/blog" }]}
        current="Current Post"
        header={<h1>Current Post</h1>}
      >
        <p>Body</p>
      </ArticleLayout>,
    );

    expect(html.match(/aria-current="page"/gu)).toHaveLength(1);
    expect(html).toContain('<span aria-current="page">Current Post</span>');
    expect(html).not.toMatch(/<a[^>]*>Current Post<\/a>/u);
  });

  it("hides every breadcrumb separator", () => {
    const html = render(
      <ArticleLayout
        breadcrumbs={[{ label: "Blog", to: "/blog" }]}
        current="Current Post"
        header={<h1>Current Post</h1>}
      >
        <p>Body</p>
      </ArticleLayout>,
    );

    expect(html.match(/<span aria-hidden="true">\/<\/span>/gu)).toHaveLength(2);
  });

  it("omits the current crumb when no title is supplied", () => {
    const html = render(
      <ArticleLayout breadcrumbs={[{ label: "Blog", to: "/blog" }]} header={<h1>Post</h1>}>
        <p>Body</p>
      </ArticleLayout>,
    );

    expect(html).not.toContain('aria-current="page"');
  });
});

describe("ArticleHeader hero image", () => {
  it("renders a decorative hero so the h1 remains the only title source", () => {
    const html = render(
      <ArticleHeader title="Post Title" image={{ src: "https://example.com/hero.jpg", alt: "" }} />,
    );

    expect(html).toContain("<img");
    expect(html).toContain('alt=""');
    expect(html.match(/<h1/gu)).toHaveLength(1);
    expect(html).toContain("Post Title</h1>");
  });
});
