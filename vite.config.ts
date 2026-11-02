import { readFileSync } from "node:fs";
import path from "node:path";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";

function readSlugs(filename: string): string[] {
  const file = path.resolve(import.meta.dirname, "src/content/data", filename);
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(parsed)) {
      return [];
    }
    const entries: unknown[] = parsed;
    const slugs: string[] = [];
    for (const entry of entries) {
      if (
        typeof entry === "object" &&
        entry !== null &&
        "slug" in entry &&
        typeof entry.slug === "string"
      ) {
        slugs.push(entry.slug);
      }
    }
    return slugs;
  } catch {
    return [];
  }
}

const dynamicPages = [
  ...readSlugs("posts.json").map((slug) => ({ path: `/blog/${slug}` })),
  ...readSlugs("projects.json").map((slug) => ({ path: `/portfolio/${slug}` })),
];

// https://vite.dev/config/
export default defineConfig({
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
      presets: [
        ["@babel/preset-react", { runtime: "automatic" }],
        reactCompilerPreset(),
      ],
      exclude: [/\?tsr-split/u, /node_modules/u],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
