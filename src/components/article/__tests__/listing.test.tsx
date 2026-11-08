import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { BlogListing } from "@/components/article/BlogListing";
import { PortfolioListing } from "@/components/article/PortfolioListing";
import type { Post, Project } from "@/content/types";

import { render } from "../../content/__tests__/test-utils";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const post: Post = {
  id: "post-1",
  slug: "first-post",
  title: "First post",
  excerpt: "An excerpt",
  content: [],
  publishedAt: "2026-01-01T00:00:00.000Z",
  tags: [],
};

const project: Project = {
  id: "project-1",
  slug: "first-project",
  title: "First project",
  excerpt: "An excerpt",
  content: [],
  publishedAt: "2026-01-01T00:00:00.000Z",
  tags: [],
};

describe("BlogListing", () => {
  it("renders the heading, description, cards, and pagination", () => {
    const html = render(
      <BlogListing
        posts={[post, { ...post, id: "post-2", slug: "second", title: "Second" }]}
        page={2}
        pageCount={3}
      />,
    );

    expect(html).toContain("<h1");
    expect(html).toContain("Blog</h1>");
    expect(html).toContain("Essays on design, engineering, and the quiet web.");
    expect(html).toContain("First post");
    expect(html).toContain("Second");
    expect(html).toContain('aria-label="Pagination"');
    expect(html).toContain('<span aria-current="page"');
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
  });

  it("renders the empty state without pagination", () => {
    const html = render(<BlogListing posts={[]} page={1} pageCount={1} />);

    expect(html).toContain("No posts yet.");
    expect(html).not.toContain('aria-label="Pagination"');
    expect(html).not.toContain("<h2");
  });
});

describe("PortfolioListing", () => {
  it("renders the heading, description, cards, and pagination", () => {
    const html = render(
      <PortfolioListing
        projects={[project, { ...project, id: "project-2", slug: "second", title: "Second" }]}
        page={1}
        pageCount={2}
      />,
    );

    expect(html).toContain("Portfolio</h1>");
    expect(html).toContain("Selected case studies across product design and engineering.");
    expect(html).toContain("First project");
    expect(html).toContain("Second");
    expect(html).toContain('aria-label="Pagination"');
    expect(html).toContain('<span aria-current="page"');
    expect(html).toContain("Next");
  });

  it("renders the empty state without pagination", () => {
    const html = render(<PortfolioListing projects={[]} page={1} pageCount={1} />);

    expect(html).toContain("No projects yet.");
    expect(html).not.toContain('aria-label="Pagination"');
  });
});
