import type { ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { PhotoSet, Post, Project } from "@/content/types";

import { render } from "../components/content/__tests__/test-utils";

const holder = vi.hoisted(() => ({ loaderData: undefined as unknown }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  createFileRoute: () => (config: Record<string, unknown>) => ({
    ...config,
    useLoaderData: () => holder.loaderData,
  }),
  notFound: () => {
    throw new Error("notFound");
  },
}));

import { Route as BlogRoute } from "@/routes/blog.$slug";
import { Route as PhotoSetRoute } from "@/routes/photography.$slug";
import { Route as PortfolioRoute } from "@/routes/portfolio.$slug";

function componentOf(route: unknown): ComponentType {
  // The mocked route factory above attaches the component to the route object.
  // eslint-disable-next-line typescript/no-unsafe-type-assertion
  return (route as { component: ComponentType }).component;
}

const BlogDetail = componentOf(BlogRoute);
const PortfolioDetail = componentOf(PortfolioRoute);
const PhotoSetDetail = componentOf(PhotoSetRoute);

const post: Post = {
  id: "post-1",
  slug: "post-title",
  title: "Post Title",
  excerpt: "A post",
  content: [],
  featureImage: "https://example.com/post.jpg",
  publishedAt: "2026-01-01T00:00:00.000Z",
  tags: [],
  author: { name: "Wayne Jones", slug: "wayne-jones" },
};

const project: Project = {
  id: "project-1",
  slug: "project-title",
  title: "Project Title",
  excerpt: "A project",
  content: [],
  featureImage: "https://example.com/project.jpg",
  publishedAt: "2026-01-01T00:00:00.000Z",
  tags: [],
};

const photoSet: PhotoSet = {
  id: "set-1",
  slug: "photo-set-title",
  title: "Photo Set Title",
  excerpt: "A set",
  content: [],
  coverImage: "https://example.com/cover.jpg",
  publishedAt: "2026-01-01T00:00:00.000Z",
  images: [],
  tags: [],
};

function expectDetailPage(html: string, title: string): void {
  expect(html).toContain(`<span aria-current="page">${title}</span>`);
  expect(html.match(/aria-current="page"/gu)).toHaveLength(1);
  expect(html).toContain("<img");
  expect(html).toContain('alt=""');
  expect(html.match(/<h1/gu)).toHaveLength(1);
  expect(html).toContain(`${title}</h1>`);
}

describe("blog detail route", () => {
  it("renders the current post in the breadcrumb trail and a decorative hero", () => {
    holder.loaderData = post;

    expectDetailPage(render(<BlogDetail />), "Post Title");
  });
});

describe("portfolio detail route", () => {
  it("renders the current project in the breadcrumb trail and a decorative hero", () => {
    holder.loaderData = project;

    expectDetailPage(render(<PortfolioDetail />), "Project Title");
  });
});

describe("photo set detail route", () => {
  it("renders the current set in the breadcrumb trail and a decorative cover", () => {
    holder.loaderData = photoSet;

    expectDetailPage(render(<PhotoSetDetail />), "Photo Set Title");
  });
});
