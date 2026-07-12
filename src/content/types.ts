/**
 * Canonical content types — CMS-agnostic.
 *
 * These types are the contract between the content layer and the UI.
 * Adapters (Ghost, mock, future CMS) map their native shapes to these
 * types. Components must never import from a specific adapter.
 */

/** Author metadata for any content type. */
export interface Author {
  name: string;
  slug: string;
  avatar?: string;
}

/** A blog post. */
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featureImage?: string;
  publishedAt: string; // ISO 8601
  updatedAt?: string;
  readingTime?: number; // minutes
  tags: string[];
  author?: Author;
}

/** A portfolio project (case study). */
export interface Project {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featureImage?: string;
  publishedAt: string;
  /** Project-specific metadata. */
  role?: string;
  client?: string;
  year?: number;
  /** Gallery image URLs shown on the case study page. */
  gallery?: string[];
  tags: string[];
  author?: Author;
}

/** A single photo for homepage masonry display. */
export interface Photo {
  src: string;
  alt: string;
  aspect: "portrait" | "landscape" | "square";
}

/** A photography set (a single shoot / gallery). */
export interface PhotoSet {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  /** Photography-specific metadata. */
  location?: string;
  camera?: string;
  /** Ordered image URLs in the set. */
  images: string[];
  tags: string[];
  author?: Author;
}

/**
 * ContentService — the abstraction every adapter implements.
 *
 * Components import `contentService` from `@/content` and call these
 * methods. They never know which adapter is active.
 */
export interface ContentService {
  getPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;

  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;

  getPhotoSets(): Promise<PhotoSet[]>;
  getPhotoSet(slug: string): Promise<PhotoSet | null>;

  getFeaturedProjects(limit: number): Promise<Project[]>;
  getFeaturedPhotos(limit: number): Promise<Photo[]>;
  getRecentPosts(limit: number): Promise<Post[]>;
}
