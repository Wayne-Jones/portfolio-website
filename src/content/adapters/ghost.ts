import { z } from "zod";

import type { Author, ContentService, Photo, PhotoSet, Post, Project } from "@/content/types";

/**
 * Ghost adapter — maps Ghost Content API responses to canonical types.
 *
 * Ghost posts are the unified primitive: projects and photo sets are
 * just posts tagged with `#portfolio` or `#photography` respectively.
 * Blog posts are posts without either of those tags.
 *
 * Env vars required: VITE_GHOST_URL, VITE_GHOST_CONTENT_API_KEY
 */

const PORTFOLIO_TAG = "portfolio";
const PHOTOGRAPHY_TAG = "photography";

/** https://docs.ghost.org/content-api/tags */
const GhostTagSchema = z.object({
  slug: z.string(),
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  feature_image: z.string().nullable(),
  visibility: z.string(),
  accent_color: z.string().nullable(),
  url: z.string(),
});

/** https://docs.ghost.org/content-api/authors */
const GhostAuthorSchema = z.object({
  slug: z.string(),
  id: z.string(),
  name: z.string(),
  profile_image: z.string().nullable(),
  cover_image: z.string().nullable(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  url: z.string(),
});

/** https://docs.ghost.org/content-api/posts */
const GhostPostSchema = z.object({
  slug: z.string(),
  id: z.string(),
  title: z.string(),
  html: z.string().nullable(),
  feature_image: z.string().nullable(),
  featured: z.boolean(),
  visibility: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  published_at: z.string().nullable(),
  custom_excerpt: z.string().nullable(),
  excerpt: z.string(),
  reading_time: z.number(),
  url: z.string(),
  tags: z.array(GhostTagSchema).nullish(),
  primary_tag: GhostTagSchema.nullish(),
  authors: z.array(GhostAuthorSchema).nullish(),
  primary_author: GhostAuthorSchema.nullish(),

  // Ghost custom post metadata — added via plugins/theme.
  role: z.string().nullable().nullish(),
  client: z.string().nullable().nullish(),
  year: z.number().nullable().nullish(),
  gallery: z.array(z.string()).nullable().nullish(),
  location: z.string().nullable().nullish(),
  camera: z.string().nullable().nullish(),
  images: z.array(z.string()).nullable().nullish(),
});

type GhostPost = z.infer<typeof GhostPostSchema>;

const GhostPaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
  total: z.number(),
  next: z.number().nullable(),
  prev: z.number().nullable(),
});

const GhostPostsResponseSchema = z.object({
  posts: z.array(GhostPostSchema),
  meta: z.object({ pagination: GhostPaginationSchema }).nullish(),
});

function mapAuthor(post: GhostPost): Author | undefined {
  const a = post.primary_author;
  if (!a) return undefined;
  return {
    name: a.name,
    slug: a.slug,
    avatar: a.profile_image ?? undefined,
  };
}

function mapBasePost(post: GhostPost): Omit<Post, "content"> {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.custom_excerpt ?? post.excerpt ?? "",
    featureImage: post.feature_image ?? undefined,
    publishedAt: post.published_at ?? "",
    updatedAt: post.updated_at ?? undefined,
    readingTime: post.reading_time ?? undefined,
    tags: (post.tags ?? []).map((t) => t.name),
    author: mapAuthor(post),
  };
}

function mapPost(post: GhostPost): Post {
  return {
    ...mapBasePost(post),
    content: post.html ?? "",
  };
}

function mapProject(post: GhostPost): Project {
  return {
    ...mapBasePost(post),
    content: post.html ?? "",
    role: post.role ?? undefined,
    client: post.client ?? undefined,
    year: post.year ?? undefined,
    gallery: post.gallery ?? undefined,
  };
}

function mapPhotoSet(post: GhostPost): PhotoSet {
  return {
    ...mapBasePost(post),
    content: post.html ?? "",
    coverImage: post.feature_image ?? undefined,
    location: post.location ?? undefined,
    camera: post.camera ?? undefined,
    images: post.images ?? [],
  };
}

function hasTag(post: GhostPost, tag: string): boolean {
  return (post.tags ?? []).some(
    (t) => t.slug === tag || t.name.toLowerCase() === tag.toLowerCase(),
  );
}

export class GhostAdapter implements ContentService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // Strip trailing slash for clean URL composition.
    this.baseUrl = baseUrl.replace(/\/$/u, "");
    this.apiKey = apiKey;
  }

  private async fetchPosts(params: Record<string, string>): Promise<GhostPost[]> {
    const search = new URLSearchParams({
      key: this.apiKey,
      include: "tags,authors",
      ...params,
    });
    const url = `${this.baseUrl}/ghost/api/content/posts/?${search.toString()}`;
    const res = await fetch(url, {
      headers: { "Accept-Version": "v6.0" },
    });
    if (!res.ok) {
      throw new Error(`Ghost Content API request failed: ${res.status} ${res.statusText}`);
    }
    const data = GhostPostsResponseSchema.parse(await res.json());
    return data.posts ?? [];
  }

  async getPosts(): Promise<Post[]> {
    // Fetch a generous page and filter out portfolio/photography posts.
    const posts = await this.fetchPosts({ limit: "100" });
    return posts
      .filter((p) => !hasTag(p, PORTFOLIO_TAG) && !hasTag(p, PHOTOGRAPHY_TAG))
      .map(mapPost);
  }

  async getPost(slug: string): Promise<Post | null> {
    const posts = await this.fetchPosts({
      filter: `slug:${slug}`,
      limit: "1",
    });
    const post = posts[0];
    if (post == null) return null;
    if (hasTag(post, PORTFOLIO_TAG) || hasTag(post, PHOTOGRAPHY_TAG)) {
      // Wrong content type — return null so callers can 404 cleanly.
      return null;
    }
    return mapPost(post);
  }

  async getProjects(): Promise<Project[]> {
    const posts = await this.fetchPosts({
      filter: `tag:${PORTFOLIO_TAG}`,
      limit: "100",
    });
    return posts.map(mapProject);
  }

  async getProject(slug: string): Promise<Project | null> {
    const posts = await this.fetchPosts({
      filter: `slug:${slug}+tag:${PORTFOLIO_TAG}`,
      limit: "1",
    });
    const post = posts[0];
    return post == null ? null : mapProject(post);
  }

  async getPhotoSets(): Promise<PhotoSet[]> {
    const posts = await this.fetchPosts({
      filter: `tag:${PHOTOGRAPHY_TAG}`,
      limit: "100",
    });
    return posts.map(mapPhotoSet);
  }

  async getPhotoSet(slug: string): Promise<PhotoSet | null> {
    const posts = await this.fetchPosts({
      filter: `slug:${slug}+tag:${PHOTOGRAPHY_TAG}`,
      limit: "1",
    });
    const post = posts[0];
    return post == null ? null : mapPhotoSet(post);
  }

  async getFeaturedProjects(limit: number): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.slice(0, limit);
  }

  async getFeaturedPhotos(limit: number): Promise<Photo[]> {
    const sets = await this.getPhotoSets();
    return sets
      .flatMap((set) => set.images)
      .slice(0, limit)
      .map((src, i) => ({
        src,
        alt: `Photo from set ${i}`,
        aspect: "landscape" as const,
      }));
  }

  async getRecentPosts(limit: number): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.slice(0, limit);
  }
}

/**
 * Factory — builds a GhostAdapter from Vite env vars.
 * Throws a descriptive error if required vars are missing.
 */
export function createGhostAdapter(): GhostAdapter {
  const baseUrl: string | undefined = import.meta.env.VITE_GHOST_URL;
  const apiKey: string | undefined = import.meta.env.VITE_GHOST_CONTENT_API_KEY;
  if (baseUrl == null || apiKey == null) {
    throw new Error("GhostAdapter requires VITE_GHOST_URL and VITE_GHOST_CONTENT_API_KEY");
  }
  return new GhostAdapter(baseUrl, apiKey);
}
