import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { paginationPaths } from "../src/content/pagination.ts";

interface SlugEntry {
  slug: string;
}

interface FeedPost extends SlugEntry {
  title: string;
  excerpt: string;
  publishedAt: string;
  author?: { name: string };
}

const staticPaths = ["/", "/blog", "/portfolio", "/photography"] as const;

/**
 * Resolves the absolute site URL used by the sitemap and RSS feed.
 *
 * An explicit `SITE_URL` wins (passed from `vite.config.ts` via `loadEnv`, or
 * read from the process env); on Vercel the production URL is used as a
 * fallback, and local builds fall back to the canonical project domain.
 */
function resolveSiteUrl(override?: string): string {
  const explicit =
    override !== undefined && override !== "" ? override : process.env.SITE_URL;
  if (explicit !== undefined && explicit !== "") {
    return explicit.replace(/\/+$/u, "");
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel !== undefined && vercel !== "") {
    return `https://${vercel.replace(/\/+$/u, "")}`;
  }

  return "https://waynejones.dev";
}

function readSnapshot<T>(filename: string): T[] {
  const file = new URL(`../src/content/data/${filename}`, import.meta.url);
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

/** All canonical URLs, including detail routes and pagination pages. */
export function collectPaths(): string[] {
  const posts = readSnapshot<SlugEntry>("posts.json");
  const projects = readSnapshot<SlugEntry>("projects.json");
  const photoSets = readSnapshot<SlugEntry>("photosets.json");

  const paths = [
    ...staticPaths,
    ...posts.map((post) => `/blog/${post.slug}`),
    ...projects.map((project) => `/portfolio/${project.slug}`),
    ...photoSets.map((photoSet) => `/photography/${photoSet.slug}`),
    ...paginationPaths("/blog", posts.length).slice(1),
    ...paginationPaths("/portfolio", projects.length).slice(1),
  ];

  return [...new Set(paths)];
}

function absoluteUrl(siteUrl: string, route: string): string {
  return new URL(route, `${siteUrl}/`).toString();
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function renderSitemap(siteUrl: string): string {
  const urls = collectPaths()
    .map((route) => `  <url><loc>${escapeXml(absoluteUrl(siteUrl, route))}</loc></url>`)
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

function renderRss(siteUrl: string): string {
  const posts = readSnapshot<FeedPost>("posts.json")
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 20);

  const items = posts
    .map((post) => {
      const url = absoluteUrl(siteUrl, `/blog/${post.slug}`);
      const author =
        post.author === undefined
          ? []
          : [`      <dc:creator>${escapeXml(post.author.name)}</dc:creator>`];

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        ...author,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    "    <title>Portfolio — Blog</title>",
    `    <link>${escapeXml(absoluteUrl(siteUrl, "/blog"))}</link>`,
    "    <description>Essays on design, engineering, and the quiet web.</description>",
    "    <language>en</language>",
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

/** Writes `sitemap.xml` and `rss.xml` into the given build output directory. */
export function generateFeeds(outputDirectory: string, siteUrlOverride?: string): void {
  const siteUrl = resolveSiteUrl(siteUrlOverride);
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(path.join(outputDirectory, "sitemap.xml"), renderSitemap(siteUrl), "utf8");
  writeFileSync(path.join(outputDirectory, "rss.xml"), renderRss(siteUrl), "utf8");
}
