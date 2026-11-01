import { createGhostAdapter } from "@/content/adapters/ghost";
import { MockAdapter } from "@/content/adapters/mock";
import { createStaticAdapter } from "@/content/adapters/static";
import type { ContentService } from "@/content/types";

/**
 * Content service entry point.
 *
 * Selects the active adapter based on `VITE_CMS`:
 *   - "ghost" → GhostAdapter (requires VITE_GHOST_URL + VITE_GHOST_CONTENT_API_KEY)
 *   - "snapshot" → StaticAdapter (committed snapshot JSON)
 *   - production build (default) → StaticAdapter
 *   - anything else in dev → MockAdapter (placeholder data)
 *
 * Components must import from this module — never from `@/content/adapters/*`.
 */

function createContentService(): ContentService {
  const cms: string | undefined = import.meta.env.VITE_CMS;
  if (cms === "ghost") {
    return createGhostAdapter();
  }
  if (cms === "snapshot") {
    return createStaticAdapter();
  }
  if (!import.meta.env.DEV) {
    return createStaticAdapter();
  }
  return new MockAdapter();
}

export const contentService: ContentService = createContentService();

export type { ContentService } from "@/content/types";
export type { Author, Photo, PhotoSet, Post, Project } from "@/content/types";
