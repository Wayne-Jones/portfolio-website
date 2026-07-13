import type { ContentService, Photo, PhotoSet, Post, Project } from "@/content/types";

/**
 * Mock adapter — returns placeholder data for development.
 *
 * Used when `VITE_CMS` is unset or set to anything other than a
 * supported CMS name. Lets the UI run end-to-end without a real
 * Ghost instance.
 */

const now = "2026-01-01T00:00:00.000Z";

const mockPosts: Post[] = [
  {
    id: "post-1",
    slug: "designing-for-the-quiet-web",
    title: "Designing for the quiet web",
    excerpt: "Notes on visual hierarchy, restraint, and the studio-craft aesthetic.",
    content:
      "<p>This is placeholder blog content. The real Ghost adapter will replace this when <code>VITE_CMS=ghost</code> is set</p>",
    featureImage: undefined,
    publishedAt: now,
    readingTime: 4,
    tags: ["design", "essays"],
  },
  {
    id: "post-2",
    slug: "on-type-systems",
    title: "On type systems",
    excerpt: "Why Switzer + Inter pair well, and how fluid type scales beat rigid breakpoints.",
    content: "<p>Placeholder content for the second blog post</p>",
    publishedAt: now,
    readingTime: 6,
    tags: ["typography"],
  },
  {
    id: "post-3",
    slug: "building-with-restraint",
    title: "Building with restraint",
    excerpt: "Why the best interfaces often say the least, and how constraints breed creativity.",
    content: "<p>Placeholder content for the third blog post</p>",
    publishedAt: now,
    readingTime: 5,
    tags: ["design", "craft"],
  },
];

const mockProjects: Project[] = [
  {
    id: "project-1",
    slug: "northwind-studio",
    title: "Northwind Studio",
    excerpt: "A brand site for an independent design studio.",
    content: "<p>Placeholder case study content</p>",
    publishedAt: now,
    role: "Design + build",
    client: "Northwind Studio",
    year: 2025,
    gallery: [],
    tags: ["portfolio", "web"],
  },
  {
    id: "project-2",
    slug: "halcyon-coffee",
    title: "Halcyon Coffee",
    excerpt: "A modular publishing system for a long-form journalism outlet.",
    content: "<p>Placeholder case study content</p>",
    publishedAt: now,
    role: "Lead engineer",
    client: "Halcyon Coffee Co.",
    year: 2024,
    gallery: [],
    tags: ["portfolio", "publishing"],
  },
  {
    id: "project-3",
    slug: "stone-mountain-wines",
    title: "Stone Mountain Wines",
    excerpt: "An e-commerce experience for a boutique vineyard.",
    content: "<p>Placeholder case study content</p>",
    publishedAt: now,
    role: "Full-stack development",
    client: "Stone Mountain Vineyards",
    year: 2024,
    gallery: [],
    tags: ["portfolio", "ecommerce"],
  },
  {
    id: "project-4",
    slug: "lighthouse-journal",
    title: "Lighthouse Journal",
    excerpt: "A digital home for an independent literary magazine.",
    content: "<p>Placeholder case study content</p>",
    publishedAt: now,
    role: "Design + development",
    client: "Lighthouse Journal",
    year: 2023,
    gallery: [],
    tags: ["portfolio", "editorial"],
  },
];

const mockPhotoSets: PhotoSet[] = [
  {
    id: "photoset-1",
    slug: "coastal-mornings",
    title: "Coastal mornings",
    excerpt: "A series of long-exposure shots from the Oregon coast.",
    content: "<p>Placeholder photo set description</p>",
    coverImage: undefined,
    publishedAt: now,
    location: "Oregon, USA",
    camera: "Fujifilm X-T5",
    images: [],
    tags: ["photography"],
  },
];

const mockPhotos: Photo[] = [
  { src: "", alt: "Brooklyn, 2025", aspect: "landscape" },
  { src: "", alt: "Maine coast, 2025", aspect: "landscape" },
  { src: "", alt: "Portrait study, 2024", aspect: "portrait" },
  { src: "", alt: "Central Park, 2025", aspect: "square" },
  { src: "", alt: "Hudson Valley, 2024", aspect: "landscape" },
  { src: "", alt: "Street scene, 2024", aspect: "portrait" },
  { src: "", alt: "Dusk over the East River, 2025", aspect: "landscape" },
];

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
    return Promise.resolve(mockPhotos.slice(0, limit));
  }

  getRecentPosts(limit: number): Promise<Post[]> {
    return Promise.resolve(mockPosts.slice(0, limit));
  }
}
