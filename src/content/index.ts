import { MockAdapter } from "@/content/adapters/mock";
import { createStaticAdapter } from "@/content/adapters/static";
import type { ContentService } from "@/content/types";

/**
 * Content service entry point.
 *
 * Selects the active adapter based on `VITE_CMS`:
 *   - "ghost" in dev → lazy GhostAdapter (requires VITE_GHOST_URL +
 *     VITE_GHOST_CONTENT_API_KEY)
 *   - "snapshot" → StaticAdapter (committed snapshot JSON)
 *   - production build (default) → StaticAdapter
 *   - anything else in dev → MockAdapter (placeholder data)
 *
 * The Ghost adapter is imported lazily and only in development. This keeps its
 * build-time dependencies (parse5, Shiki) out of the production client bundle;
 * production and prerender always read the committed snapshot.
 *
 * Components must import from this module — never from `@/content/adapters/*`.
 */

/** Lazily loads the Ghost adapter so it never enters the client bundle. */
class LazyGhostAdapter implements ContentService {
  private servicePromise: Promise<ContentService> | null = null;

  private service(): Promise<ContentService> {
    this.servicePromise ??= import("@/content/adapters/ghost.ts").then((module) =>
      module.createGhostAdapter(),
    );
    return this.servicePromise;
  }

  async getPosts() {
    return (await this.service()).getPosts();
  }

  async getPost(slug: string) {
    return (await this.service()).getPost(slug);
  }

  async getProjects() {
    return (await this.service()).getProjects();
  }

  async getProject(slug: string) {
    return (await this.service()).getProject(slug);
  }

  async getPhotoSets() {
    return (await this.service()).getPhotoSets();
  }

  async getPhotoSet(slug: string) {
    return (await this.service()).getPhotoSet(slug);
  }

  async getFeaturedProjects(limit: number) {
    return (await this.service()).getFeaturedProjects(limit);
  }

  async getFeaturedPhotos(limit: number) {
    return (await this.service()).getFeaturedPhotos(limit);
  }

  async getRecentPosts(limit: number) {
    return (await this.service()).getRecentPosts(limit);
  }
}

function createContentService(): ContentService {
  const cms: string | undefined = import.meta.env.VITE_CMS;

  if (import.meta.env.DEV && cms === "ghost") {
    return new LazyGhostAdapter();
  }
  if (cms === "snapshot" || !import.meta.env.DEV) {
    return createStaticAdapter();
  }
  return new MockAdapter();
}

export const contentService: ContentService = createContentService();

export type { ContentService, ContentBlock, ContentInline, ContentTree } from "@/content/types";
export type { Author, Photo, PhotoSet, Post, Project } from "@/content/types";
