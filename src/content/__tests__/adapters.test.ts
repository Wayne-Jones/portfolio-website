import { afterEach, describe, expect, it, vi } from "vitest";

import { GhostAdapter } from "@/content/adapters/ghost";
import { MockAdapter } from "@/content/adapters/mock";
import { mockPhotoSets } from "@/content/adapters/mock-fixtures/photo-sets";
import { mockPosts } from "@/content/adapters/mock-fixtures/posts";
import { mockProjects } from "@/content/adapters/mock-fixtures/projects";
import { StaticAdapter } from "@/content/adapters/static";
import photoSetsData from "@/content/data/photosets.json";
import postsData from "@/content/data/posts.json";
import projectsData from "@/content/data/projects.json";
import { sortByPublishedAtDesc } from "@/content/sort";
import { parsePhotoSets, parsePosts, parseProjects } from "@/content/validate";

/** Reverses a collection so the fixture order cannot accidentally match. */
function shuffled<T>(items: readonly T[]): T[] {
  return [...items].reverse();
}

function ghostTag(slug: string) {
  return {
    slug,
    id: `tag-${slug}`,
    name: slug,
    description: null,
    feature_image: null,
    visibility: "public",
    accent_color: null,
    url: `https://example.com/tag/${slug}/`,
  };
}

function ghostPost(id: string, slug: string, publishedAt: string, tags: string[] = []) {
  return {
    slug,
    id,
    title: slug,
    html: "",
    feature_image: null,
    visibility: "public",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: null,
    published_at: publishedAt,
    custom_excerpt: null,
    excerpt: "",
    reading_time: 1,
    url: `https://example.com/${slug}/`,
    tags: tags.map(ghostTag),
    primary_tag: null,
    authors: [],
    primary_author: null,
    role: null,
    client: null,
    year: null,
    gallery: null,
    location: null,
    camera: null,
    images: null,
  };
}

function stubGhostPosts(posts: unknown[]): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => ({
      ok: true,
      json: () => ({ posts }),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("adapter ordering", () => {
  it("StaticAdapter returns newest-first collections", async () => {
    const adapter = new StaticAdapter();

    expect(await adapter.getPosts()).toEqual(sortByPublishedAtDesc(parsePosts(postsData)));
    expect(await adapter.getProjects()).toEqual(sortByPublishedAtDesc(parseProjects(projectsData)));
    expect(await adapter.getPhotoSets()).toEqual(
      sortByPublishedAtDesc(parsePhotoSets(photoSetsData)),
    );
  });

  it("MockAdapter returns the same order for a shuffled fixture", async () => {
    const adapter = new MockAdapter();

    expect(await adapter.getPosts()).toEqual(sortByPublishedAtDesc(shuffled(mockPosts)));
    expect(await adapter.getProjects()).toEqual(sortByPublishedAtDesc(shuffled(mockProjects)));
    expect(await adapter.getPhotoSets()).toEqual(sortByPublishedAtDesc(shuffled(mockPhotoSets)));
  });

  it("GhostAdapter orders posts regardless of the API response order", async () => {
    stubGhostPosts([
      ghostPost("3", "oldest", "2024-01-01T00:00:00.000Z"),
      ghostPost("1", "newest", "2026-01-01T00:00:00.000Z"),
      ghostPost("2", "middle", "2025-01-01T00:00:00.000Z"),
    ]);

    const posts = await new GhostAdapter("https://example.com", "key").getPosts();

    expect(posts.map((post) => post.slug)).toEqual(["newest", "middle", "oldest"]);
  });

  it("GhostAdapter orders projects and photo sets", async () => {
    stubGhostPosts([
      ghostPost("2", "b-set", "2025-01-01T00:00:00.000Z", ["portfolio", "photography"]),
      ghostPost("1", "a-set", "2026-01-01T00:00:00.000Z", ["portfolio", "photography"]),
    ]);
    const adapter = new GhostAdapter("https://example.com", "key");

    const projects = await adapter.getProjects();
    const photoSets = await adapter.getPhotoSets();

    expect(projects.map((project) => project.slug)).toEqual(["a-set", "b-set"]);
    expect(photoSets.map((set) => set.slug)).toEqual(["a-set", "b-set"]);
  });
});

describe("adapter homepage subsets", () => {
  it("returns recent projects and one featured photo per set", async () => {
    const adapter = new MockAdapter();

    const projects = await adapter.getRecentProjects(4);
    const photos = await adapter.getFeaturedPhotos(6);

    expect(projects).toHaveLength(4);
    expect(projects.map((project) => project.slug)).toEqual(
      (await adapter.getProjects()).slice(0, 4).map((project) => project.slug),
    );
    expect(photos).toHaveLength(2);
    expect(new Set(photos.map((photo) => photo.setSlug)).size).toBe(photos.length);
  });
});
