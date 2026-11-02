## 1. Dependencies

- [x] 1.1 Verify `@tanstack/react-start` (≥1.167.x) supports the installed Vite 8/Rolldown; confirm peer version alignment with `@tanstack/react-router@^1.170`
- [x] 1.2 Install `@tanstack/react-start` pinned, remove `vite-react-ssg` from `devDependencies`
- [x] 1.3 Verify `pnpm dev` boots the Start dev server with the existing Vite config (React Compiler Babel preset, Tailwind v4) with no console errors

## 2. Snapshot Script

- [x] 2.1 Create `scripts/snapshot-content.ts` with an `import.meta`-compatible entrypoint, exporting an async `run()` function
- [x] 2.2 Wire calls to `contentService.getPosts()`, `getProjects()`, `getPhotoSets()` (using factory that selects `GhostAdapter` from env vars, falling back to a temporary snapshot-mode wrapper)
- [x] 2.3 Write `src/content/data/posts.json`, `projects.json`, `photosets.json` using `fs.writeFile`, with deterministic JSON output (sort keys or stringify stable)
- [x] 2.4 Add `pnpm snapshot` script to `package.json` running `node scripts/snapshot-content.ts` (uses Node 24's native TS type-stripping; requires `.ts` extensions on relative imports)
- [x] 2.5 Add `prebuild` script in `package.json` that runs `pnpm snapshot` automatically before `pnpm build`
- [x] 2.6 Error handling: catch `fetch` errors and connection issues, print to stderr, exit with process code 1

## 3. Static Adapter

- [x] 3.1 Create `src/content/adapters/static.ts` with a `StaticAdapter` class implementing `ContentService`
- [x] 3.2 Pre-load all snapshot JSON files via `import` statements (so the build bundles them) and cache them in memory
- [x] 3.3 Implement single-item methods (`getPost`, `getProject`, `getPhotoSet`) with array `.find` lookups by slug
- [x] 3.4 Implement featured/limited methods (`getFeaturedProjects`, `getFeaturedPhotos`, `getRecentPosts`) as `slice` operations on cached arrays
- [x] 3.5 Implement `getPosts`, `getProjects`, `getPhotoSets` as direct returns of cached arrays
- [x] 3.6 Add `createStaticAdapter()` factory at the bottom of the file
- [x] 3.7 Update `src/content/index.ts` to add the third selection branch: `VITE_CMS=snapshot` → `StaticAdapter`; default at build time → `StaticAdapter`; default in dev → `MockAdapter`; `VITE_CMS=ghost` → `GhostAdapter`

## 4. Root Entry Conversion

- [x] 4.1 Create `src/router.tsx` exporting `getRouter()` — `createRouter({ routeTree, defaultPreload: "intent", defaultViewTransition: true, trailingSlash: "never" })` with the `startViewTransition` override and the `Register` module augmentation preserved
- [x] 4.2 Convert `src/routes/__root.tsx` to render the HTML document: `<html>`/`<head>`/`<body>`, `HeadContent`, `Scripts`, and a `head: () => ({ meta, links })` export carrying the meta/favicon currently in `index.html`
- [x] 4.3 Remove `src/main.tsx` and `index.html`; confirm the Start plugin's default client/server entries hydrate and render
- [x] 4.4 Add `src/routes/$.tsx` splat route rendering the not-found UI (TanStack Router's default not-found component is not static-host-safe)
- [x] 4.5 Verify `pnpm dev` (mock) and `pnpm dev:ghost` serve pages server-side with HMR and no regressions to view transitions/animations

## 5. Build Configuration

- [x] 5.1 Update `vite.config.ts`: add `tanstackStart({ prerender: { enabled: true, autoStaticPathsDiscovery: true, autoSubfolderIndex: true }, pages: [...] })`; keep route generation and existing plugins (verify plugin ordering — Start plugin must come before the React plugin)
- [x] 5.2 Enumerate dynamic slugs: the top-level `pages` entries derived from `src/content/data/posts.json` (`/blog/<slug>`) and `projects.json` (`/portfolio/<slug>`) at config load time
- [x] 5.3 Update `package.json`: `build` stays `tsc -b && vite build`; `preview` runs plain `vite preview` — Start's preview plugin serves the built `dist/client` static output (an `--outDir dist/client` override breaks the plugin's server-bundle path resolution)
- [x] 5.4 Add `vercel.json` — `outputDirectory: "dist/client"`, `cleanUrls: true`, catch-all rewrite to `/` for the `$.tsx` 404 fallback
- [x] 5.5 Verify `pnpm build` emits one `index.html` per static route in `dist/client/`

## 6. Dynamic Route Prerendering (placeholder slugs only)

- [x] 6.1 Confirm `blog.<slug>` and `portfolio.<slug>` entries in `prerender.pages` map to the existing `blog.$slug.tsx`/`portfolio.$slug.tsx` routes (route bodies are stubs — detail rendering happens in `detail-routes` change)
- [x] 6.2 Verify the build outputs `blog/<slug>/index.html` and `portfolio/<slug>/index.html` per content item; note `photography/$slug` is deferred until `detail-routes` adds the route file

## 7. Verification

- [x] 7.1 Run `pnpm snapshot` and confirm the three JSON files appear in `src/content/data/`
- [x] 7.2 Run `pnpm dev` (mock mode) and confirm the homepage renders identically to before (SSR dev server)
- [x] 7.3 Run `pnpm dev:ghost` and confirm the dev server still hits Ghost for live mode (where CORS is configured)
- [x] 7.4 Run `pnpm build` and confirm pre-rendered HTML files for static routes and every slug under `dist/client/`
- [x] 7.5 Run `pnpm preview` against the built artifact and confirm no outbound requests are issued at first paint
- [x] 7.6 Inspect the produced `dist/client/index.html` for any static route and verify content is present at first paint
- [x] 7.7 Verify `dist/client/` does not contain the value of `VITE_GHOST_CONTENT_API_KEY`
- [x] 7.8 Run `pnpm lint` and `pnpm build` with zero warnings and zero errors cap

## 8. Documentation

- [x] 8.1 Write a README section covering: dev modes (`pnpm dev`, `pnpm dev:ghost`), snapshot refresh (`pnpm snapshot`), build (`pnpm build`, `pnpm prebuild`), preview (`pnpm preview`, served from `dist/client/`)
- [x] 8.2 Document the Ghost webhook → Vercel deploy hook integration in README (Ghost admin → Settings → Integrations → Custom Webhook → URL is the Vercel deploy hook URL; events: `post.published`, `post.updated`, `post.unpublished`, `site.changed`)
- [x] 8.3 Add a note in README about the snapshot being committed to git and how to refresh it
- [x] 8.4 Update `.env.example` to clarify that `VITE_CMS` is optional and the build-mode default is snapshot
- [x] 8.5 Document the static deploy shape: `dist/client/` output, `vercel.json`, `trailingSlash: "never"`, and the `$.tsx` 404 fallback

## 9. External Setup (Not Code)

- [x] 9.1 In Ghost admin, capture a deploy Webhook target URL pointing at a Vercel Deploy Hook (no code change here — configurations live in Ghost and Vercel dashboards)
- [x] 9.2 In Vercel project settings, generate a Deploy Hook URL and paste it into the Ghost integration
