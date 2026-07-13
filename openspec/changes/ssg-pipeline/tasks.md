## 1. Dependencies

- [ ] 1.1 Install `vite-react-ssg` and pin a specific version in `package.json`'s `devDependencies`
- [ ] 1.2 Verify the install pulls in `jsdom`, `html5parser`, and `react-helmet-async` transitively without conflict

## 2. Snapshot Script

- [ ] 2.1 Create `scripts/snapshot-content.ts` with an `import.meta`-compatible entrypoint, exporting an async `run()` function
- [ ] 2.2 Wire calls to `contentService.getPosts()`, `getProjects()`, `getPhotoSets()` (using factory that selects `GhostAdapter` from env vars, falling back to a temporary snapshot-mode wrapper)
- [ ] 2.3 Write `src/content/data/posts.json`, `projects.json`, `photosets.json` using `fs.writeFile`, with deterministic JSON output (sort keys or stringify stable)
- [ ] 2.4 Add `pnpm snapshot` script to `package.json` pointing to `tsx scripts/snapshot-content.ts`
- [ ] 2.5 Add `prebuild` script in `package.json` that runs `pnpm snapshot` automatically before `pnpm build`
- [ ] 2.6 Error handling: catch `fetch` errors and connection issues, print to stderr, exit with process code 1

## 3. Static Adapter

- [ ] 3.1 Create `src/content/adapters/static.ts` with a `StaticAdapter` class implementing `ContentService`
- [ ] 3.2 Pre-load all snapshot JSON files via `import` statements (so the build bundles them) and cache them in memory
- [ ] 3.3 Implement single-item methods (`getPost`, `getProject`, `getPhotoSet`) with array `.find` lookups by slug
- [ ] 3.4 Implement featured/limited methods (`getFeaturedProjects`, `getFeaturedPhotos`, `getRecentPosts`) as `slice` operations on cached arrays
- [ ] 3.5 Implement `getPosts`, `getProjects`, `getPhotoSets` as direct returns of cached arrays
- [ ] 3.6 Add `createStaticAdapter()` factory at the bottom of the file
- [ ] 3.7 Update `src/content/index.ts` to add the third selection branch: `VITE_CMS=snapshot` → `StaticAdapter`; default at build time → `StaticAdapter`; default in dev → `MockAdapter`; `VITE_CMS=ghost` → `GhostAdapter`

## 4. Root Entry Conversion

- [ ] 4.1 Update `src/main.tsx` to import `Experimental_ViteReactSSG as ViteReactSSG` from `vite-react-ssg/tanstack`
- [ ] 4.2 Replace the imperative `createRoot().render()` call with an exported `createRoot = ViteReactSSG({ router, routes: routeTree, basename: ... }, setupCallback)`
- [ ] 4.3 Move shared setup code (any providers, hooks) into the setupCallback
- [ ] 4.4 Verify `pnpm dev` still mounts the app correctly via TanStack Router's regular hydration
- [ ] 4.5 Add a small comment block at the top of `main.tsx` explaining why both dev and prod share this entry

## 5. Build Configuration

- [ ] 5.1 Update `vite.config.ts` to add `ssgOptions` per `vite-react-ssg` documentation (concurrency, root container id, includeAllRoutes: false)
- [ ] 5.2 Implement `ssgOptions.includedRoutes` to enumerate dynamic paths by reading from the snapshot JSON files at build time
- [ ] 5.3 Update `package.json` `build` script to `vite-react-ssg build`
- [ ] 5.4 Verify `pnpm build` produces one `index.html` per static route

## 6. Dynamic Route getStaticPaths (placeholder slugs only)

- [ ] 6.1 Add a `getStaticPaths` export shape that `vite-react-ssg` recognizes to each of `blog.$slug.tsx`, `portfolio.$slug.tsx`, `photography.$slug.tsx` — returning slug arrays from the snapshot, even though the body is still a stub (detail rendering happens in `detail-routes` change)
- [ ] 6.2 Verify the build now outputs `blog/<slug>/index.html` and `portfolio/<slug>/index.html` files per content item

## 7. Verification

- [ ] 7.1 Run `pnpm snapshot` and confirm the three JSON files appear in `src/content/data/`
- [ ] 7.2 Run `pnpm dev` (mock mode) and confirm the homepage renders identically to before
- [ ] 7.3 Run `pnpm dev:ghost` and confirm the dev server still hits Ghost for live mode (where CORS is configured)
- [ ] 7.4 Run `pnpm build` and confirm pre-rendered HTML files for static routes and every slug
- [ ] 7.5 Run `pnpm preview` against the built artifact and confirm no outbound requests are issued at first paint
- [ ] 7.6 Inspect the produced `dist/index.html` for any static route and verify content is present at first paint
- [ ] 7.7 Verify the build output `dist/` does not contain the value of `VITE_GHOST_CONTENT_API_KEY`
- [ ] 7.8 Run `pnpm lint` and `pnpm build` with zero warnings and zero errors cap

## 8. Documentation

- [ ] 8.1 Write a README section covering: dev modes (`pnpm dev`, `pnpm dev:ghost`), snapshot refresh (`pnpm snapshot`), build (`pnpm build`, `pnpm prebuild`), preview (`pnpm preview`)
- [ ] 8.2 Document the Ghost webhook → Vercel deploy hook integration in README (Ghost admin → Settings → Integrations → Custom Webhook → URL is the Vercel deploy hook URL; events: `post.published`, `post.updated`, `post.unpublished`, `site.changed`)
- [ ] 8.3 Add a note in README about the snapshot being committed to git and how to refresh it
- [ ] 8.4 Update `.env.example` to clarify that `VITE_CMS` is optional and the build-mode default is snapshot

## 9. External Setup (Not Code)

- [ ] 9.1 In Ghost admin, capture a deploy Webhook target URL pointing at a Vercel Deploy Hook (no code change here — configurations live in Ghost and Vercel dashboards)
- [ ] 9.2 In Vercel project settings, generate a Deploy Hook URL and paste it into the Ghost integration
