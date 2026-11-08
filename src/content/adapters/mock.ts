import type { ContentService, Photo, PhotoSet, Post, Project } from "../types.ts";
import { mockPhotoSets } from "./mock-fixtures/photo-sets.ts";
import { mockPosts } from "./mock-fixtures/posts.ts";
import { mockProjects } from "./mock-fixtures/projects.ts";

/**
 * Mock adapter — returns placeholder data for development.
 *
 * Used when `VITE_CMS` is unset or set to anything other than a
 * supported CMS name. Lets the UI run end-to-end without a real
 * Ghost instance.
 *
 * Updated to use canonical ContentTree literals for proper shape validation.
 * Fixture image URLs point at Unsplash's CDN as placeholder art — they are
 * hotlinked by the browser in dev only and never fetched at build time.
 */

export class MockAdapter implements ContentService {
  getPosts(): Promise<Post[]> {
    return Promise.resolve(mockPosts);
  }

  getPost(slug: string): Promise<Post | null> {
    return Promise.resolve(mockPosts.find((p) => p.slug === slug) ?? null);
  }

  getProjects(): Promise<Project[]> {
    return Promise.resolve(mockProjects);
  }

  getProject(slug: string): Promise<Project | null> {
    return Promise.resolve(mockProjects.find((p) => p.slug === slug) ?? null);
  }

  getPhotoSets(): Promise<PhotoSet[]> {
    return Promise.resolve(mockPhotoSets);
  }

  getPhotoSet(slug: string): Promise<PhotoSet | null> {
    return Promise.resolve(mockPhotoSets.find((p) => p.slug === slug) ?? null);
  }

  getFeaturedProjects(limit: number): Promise<Project[]> {
    return Promise.resolve(mockProjects.slice(0, limit));
  }

  getFeaturedPhotos(limit: number): Promise<Photo[]> {
    const photos: Photo[] = [];
    for (const set of mockPhotoSets) {
      const src = set.coverImage ?? set.images[0];
      if (src === undefined || src === "") continue;

      photos.push({
        src,
        alt: set.title,
        aspect: "landscape",
        setSlug: set.slug,
      });
      if (photos.length >= limit) break;
    }
    return Promise.resolve(photos);
  }

  getRecentPosts(limit: number): Promise<Post[]> {
    return Promise.resolve(mockPosts.slice(0, limit));
  }
}
