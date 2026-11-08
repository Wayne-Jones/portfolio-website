import path from "node:path";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import type { PluginOption } from "vite";

import { generateFeeds } from "./scripts/generate-feeds.ts";
import { readSlugs } from "./scripts/read-slugs.ts";
import { pageSize, paginationPaths } from "./src/content/pagination.ts";

const postSlugs = readSlugs("posts.json");
const projectSlugs = readSlugs("projects.json");
const photosetSlugs = readSlugs("photosets.json");

const dynamicPages = [
  ...postSlugs.map((slug) => ({ path: `/blog/${slug}` })),
  ...projectSlugs.map((slug) => ({ path: `/portfolio/${slug}` })),
  ...photosetSlugs.map((slug) => ({ path: `/photography/${slug}` })),
  ...paginationPaths("/blog", postSlugs.length, pageSize)
    .slice(1)
    .map((pagePath) => ({ path: pagePath })),
  ...paginationPaths("/portfolio", projectSlugs.length, pageSize)
    .slice(1)
    .map((pagePath) => ({ path: pagePath })),
];

/**
 * Writes `sitemap.xml` and `rss.xml` after prerendering finishes. The
 * `buildApp` hook runs after TanStack Start's own post-build step, so every
 * prerendered page already exists on disk.
 */
function feedsPlugin(siteUrl: string): PluginOption {
  return {
    name: "portfolio:feeds",
    apply: "build",
    buildApp: {
      order: "post",
      handler() {
        const distDirectory = path.resolve(import.meta.dirname, "dist");
        generateFeeds(path.join(distDirectory, "client"), siteUrl);
        generateFeeds(distDirectory, siteUrl);
        return Promise.resolve();
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load every env var (not just VITE_*) so build-time SITE_URL is available
  // from .env as well as the shell/CI environment.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      // TanStack Start — must run before the React plugin. Handles file-based
      // routing (generates routeTree.gen.ts from src/routes/) and the SSR/prerender pipeline.
      tanstackStart({
        prerender: {
          enabled: true,
          autoStaticPathsDiscovery: true,
          autoSubfolderIndex: true,
        },
        pages: dynamicPages,
        router: {
          routesDirectory: "routes",
          generatedRouteTree: "routeTree.gen.ts",
          quoteStyle: "double",
          semicolons: true,
        },
      }),
      react(),
      babel({
        presets: [["@babel/preset-react", { runtime: "automatic" }], reactCompilerPreset()],
        exclude: [/\?tsr-split/u, /node_modules/u],
      }),
      tailwindcss(),
      feedsPlugin(env.SITE_URL ?? ""),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
