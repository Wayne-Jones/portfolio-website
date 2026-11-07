/**
 * Canonical content types — CMS-agnostic.
 *
 * These types are the contract between the content layer and the UI.
 * Adapters (Ghost, mock, future CMS) map their native shapes to these
 * types. Components must never import from a specific adapter.
 *
 * ## Canonical content tree
 *
 * A post body is a `ContentTree` — an ordered `ContentBlock[]`. Every block is
 * a discriminated union keyed by `type`:
 *
 *   paragraph  { children: ContentInline[] }
 *   heading    { level: HeadingLevel; id?: string; children: ContentInline[] }
 *   image      { src; alt; caption?; width?; height? }
 *   codeBlock  { language?; code; highlightedHtml? }   // highlighted at build time
 *   blockquote { children: ContentBlock[] }
 *   list       { ordered: boolean; items: ContentBlock[][] }
 *   divider    {}
 *   embed      { provider: EmbedProvider; html: string; url?: string }
 *   gallery    { images: GalleryImage[] }
 *   callout    { variant?: CalloutVariant; children: ContentInline[] }
 *   bookmark   { url; title; description?; image? }
 *   html       { html: string }                        // sanitized escape hatch
 *
 * Inline marks are `ContentInline[]`: `text`, `link` (`children`), `emphasis`
 * (`children`), `strong` (`children`), `inlineCode`, and `hardBreak`.
 *
 * The union is intentionally closed: adding a block type forces the renderer's
 * exhaustive `PostBody` switch to handle it (compile error otherwise). Unknown
 * source patterns map to `html` rather than throwing at translation time.
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
  content: ContentTree;
  featureImage?: string;
  publishedAt: string; // ISO 8601
  updatedAt?: string;
  readingTime?: number; // minutes
  tags: string[];
  author?: Author;
}

/** An image used by image/gallery blocks and project galleries. */
export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

/** A portfolio project (case study). */
export interface Project {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: ContentTree;
  featureImage?: string;
  publishedAt: string;
  /** Project-specific metadata. */
  role?: string;
  client?: string;
  year?: number;
  /** Gallery images shown on the case study page. */
  gallery?: GalleryImage[];
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
  content: ContentTree;
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

/** Heading levels supported by the canonical tree (`h2`–`h6`). */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

/** Tone of a callout block. */
export type CalloutVariant = "info" | "warning" | "success";

/** Inline content nodes — nested text marks. */
export type ContentInline =
  | { type: "text"; value: string }
  | { type: "link"; href: string; children: ContentInline[] }
  | { type: "emphasis"; children: ContentInline[] }
  | { type: "strong"; children: ContentInline[] }
  | { type: "inlineCode"; value: string }
  | { type: "hardBreak" };

/** Block-level content nodes — the canonical tree. */
export type ContentBlock =
  | { type: "paragraph"; children: ContentInline[] }
  | {
      type: "heading";
      level: HeadingLevel;
      id?: string;
      children: ContentInline[];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
    }
  | {
      type: "codeBlock";
      language?: string;
      code: string;
      highlightedHtml?: string;
    }
  | { type: "blockquote"; children: ContentBlock[] }
  | { type: "list"; ordered: boolean; items: ContentBlock[][] }
  | { type: "divider" }
  | { type: "embed"; provider: EmbedProvider; html: string; url?: string }
  | {
      type: "gallery";
      images: GalleryImage[];
    }
  | {
      type: "callout";
      variant?: CalloutVariant;
      children: ContentInline[];
    }
  | {
      type: "bookmark";
      url: string;
      title: string;
      description?: string;
      image?: string;
    }
  | { type: "html"; html: string };

export type ContentTree = ContentBlock[];

/** Known embed providers. Unknown providers fall back to sanitized HTML. */
export type EmbedProvider = "youtube" | "twitter" | "codepen" | "generic" | "unknown";

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
