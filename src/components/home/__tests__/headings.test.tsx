import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { BlogCard } from "@/components/home/blog/BlogCard";
import type { Post } from "@/content/types";

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
  slug: "a-post",
  title: "A Post",
  excerpt: "A post",
  content: [],
  publishedAt: "2026-01-01T00:00:00.000Z",
  tags: [],
};

describe("BlogCard heading levels", () => {
  it("defaults to an h3 and accepts an h2 for listing pages", () => {
    expect(render(<BlogCard post={post} />)).toContain("<h3");
    expect(render(<BlogCard post={post} headingLevel={2} />)).toContain("<h2");
  });
});
