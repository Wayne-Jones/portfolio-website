import { buildFeaturedPhotos } from "../featured.ts";
import { sortByPublishedAtDesc } from "../sort.ts";
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
  private readonly posts = sortByPublishedAtDesc(mockPosts);
  private readonly projects = sortByPublishedAtDesc(mockProjects);
  private readonly photoSets = sortByPublishedAtDesc(mockPhotoSets);

  getPosts(): Promise<Post[]> {
    return Promise.resolve(this.posts);
  }

  getPost(slug: string): Promise<Post | null> {
    return Promise.resolve(this.posts.find((p) => p.slug === slug) ?? null);
  }

  getProjects(): Promise<Project[]> {
    return Promise.resolve(this.projects);
  }

  getProject(slug: string): Promise<Project | null> {
    return Promise.resolve(this.projects.find((p) => p.slug === slug) ?? null);
  }

  getPhotoSets(): Promise<PhotoSet[]> {
    return Promise.resolve(this.photoSets);
  }

  getPhotoSet(slug: string): Promise<PhotoSet | null> {
    return Promise.resolve(this.photoSets.find((p) => p.slug === slug) ?? null);
  }

  getRecentProjects(limit: number): Promise<Project[]> {
    return Promise.resolve(this.projects.slice(0, limit));
  }

  getFeaturedPhotos(limit: number): Promise<Photo[]> {
    return Promise.resolve(buildFeaturedPhotos(this.photoSets, limit));
  }

  getRecentPosts(limit: number): Promise<Post[]> {
    return Promise.resolve(this.posts.slice(0, limit));
  }
}
