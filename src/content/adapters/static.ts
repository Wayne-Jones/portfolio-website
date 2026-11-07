import photoSetsData from "@/content/data/photosets.json";
import postsData from "@/content/data/posts.json";
import projectsData from "@/content/data/projects.json";
import type { ContentService, Photo, PhotoSet, Post, Project } from "@/content/types";
import { parsePhotoSets, parsePosts, parseProjects } from "@/content/validate";

/**
 * Static adapter — reads content from the committed snapshot JSON files.
 *
 * Used in production builds (default) and when `VITE_CMS=snapshot`.
 * Imports the JSON directly so the build bundles it; content is cached
 * in memory at module load. Snapshots are validated against the canonical
 * types so a stale/invalid snapshot fails fast instead of reaching the UI.
 */

const cachedPosts = parsePosts(postsData);
const cachedProjects = parseProjects(projectsData);
const cachedPhotoSets = parsePhotoSets(photoSetsData);

export class StaticAdapter implements ContentService {
  getPosts(): Promise<Post[]> {
    return Promise.resolve(cachedPosts);
  }

  getPost(slug: string): Promise<Post | null> {
    return Promise.resolve(cachedPosts.find((p) => p.slug === slug) ?? null);
  }

  getProjects(): Promise<Project[]> {
    return Promise.resolve(cachedProjects);
  }

  getProject(slug: string): Promise<Project | null> {
    return Promise.resolve(cachedProjects.find((p) => p.slug === slug) ?? null);
  }

  getPhotoSets(): Promise<PhotoSet[]> {
    return Promise.resolve(cachedPhotoSets);
  }

  getPhotoSet(slug: string): Promise<PhotoSet | null> {
    return Promise.resolve(cachedPhotoSets.find((p) => p.slug === slug) ?? null);
  }

  getFeaturedProjects(limit: number): Promise<Project[]> {
    return Promise.resolve(cachedProjects.slice(0, limit));
  }

  getFeaturedPhotos(limit: number): Promise<Photo[]> {
    const photos: Photo[] = cachedPhotoSets
      .flatMap((set) => set.images)
      .slice(0, limit)
      .map((src, i) => ({
        src,
        alt: `Photo from set ${i}`,
        aspect: "landscape" as const,
      }));
    return Promise.resolve(photos);
  }

  getRecentPosts(limit: number): Promise<Post[]> {
    return Promise.resolve(cachedPosts.slice(0, limit));
  }
}

export function createStaticAdapter(): StaticAdapter {
  return new StaticAdapter();
}
