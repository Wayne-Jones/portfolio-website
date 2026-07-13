## Context

The portfolio site is a Vite + React 19 + TanStack Router + Tailwind v4 application. Today's `pnpm dev` runs a fully client-side SPA where every page renders after a chained Hydrate → Loader → `defer()` → Suspense dance, with content fetched live from Ghost on every visitor pageview. The `GhostAdapter` already exists with Zod-validated schemas and a tag-based content split (portfolio posts, photography posts, blog posts). What it lacks is any build-time orchestration: there is no pre-rendering, no JSON snapshot, no notion of which routes should produce static HTML.

Deploying this as-is means:
- Production is a single SPA shell; every pageview incurs a Ghost round-trip + render-frame cost.
- Search crawlers see virtually nothing meaningful until the JS bundle hydrates.
- Ghost's uptime, CORS configuration, and rate limits become part of the user-facing latency budget.
- We can't trivially pre-compute responsive image variants, syntax-highlighted code blocks, or RSS/sitemap artifacts because everything runs in the browser.

The move to SSG with a build-time content snapshot is the canonical headless-CMS-to-static-site pattern and addresses all of the above. The TanStack Router codebase plus its typed loaders and the existing Ghost adapter are well-positioned for this — only the orchestration layer is missing.

## Goals / Non-Goals

**Goals:**
- Generate one fully-rendered HTML file per route at build time, including per-slug pages for blog/portfolio/photography.
- Make the build process fully self-contained: an interrupted network connection to Ghost during the render pass must not break the build.
- Preserve the existing dev-mode developer experience: `pnpm dev` continues to run live against `MockAdapter` (offline default) or `GhostAdapter` (`pnpm dev:ghost`) with no behavior regressions to animations, Suspense skeletons, or view transitions.
- Produce a deployable Vercel-friendly artifact without runtime server functions.
- Document the Ghost-side webhook configuration so the pipeline is end-to-end.

**Non-Goals:**
- Render real post bodies (handled by `content-format` change).
- Implement detail routes' UI (handled by `detail-routes` change).
- Implement CodeBlock or syntax highlighting (handled by `content-format` change).
- Implement Cloudinary-specific image transformations (handled by `image-optimization` change).
- Implement pagination on listing pages (handled by `detail-routes` change).
- Set up ISR or on-demand revalidation on Vercel — full rebuilds on webhook are sufficient for the expected content volume.
- Move from Ghost storage adapter to Cloudinary plumbing on the Ghost side — the Ghost admin is already configured for this.

## Decisions

### Decision 1: Use `vite-react-ssg` with the experimental TanStack Router adapter

**Rationale:** `vite-react-ssg` is the only React-focused SSG plugin with first-class (though experimental) TanStack support. It's actively maintained (latest release five days before this proposal), 238 GitHub stars, and the TanStack adapter `ViteReactSSG` from `vite-react-ssg/tanstack` matches the existing `createRouter({ routeTree })` setup with minimal change. The plugin's loader semantics — loaders execute at build time against the manifest, then resolve from the manifest during browser navigation — are exactly what's needed to keep our existing `defer()` + Suspense patterns working *and* get static HTML out.

**Alternatives considered:**
- `vike` (formerly `vite-plugin-ssr`): Battle-tested but heavier (1.7MB unpacked) and framework-agnostic in a way that adds overhead for a project this small. Doc surface and TanStack Router integration are weaker.
- `vite-plugin-prerender`: Framework-agnostic, but uses Puppeteer-based prerendering rather than route-aware SSG. Loaders don't run at build time, which loses the typed loader benefits.
- Roll our own ssrHelpers with React 18 stream + Vite SSR: Maximum control, lots of yak shaving, no upside for this scoped project.

### Decision 2: Snapshot content to JSON before the build runs

**Rationale:** Separating "fetch content from Ghost" from "render content to HTML" makes the build reproducible and decoupled. The snapshot step runs first, writes JSON, then the build reads it. If the JSON is already present and newer than the last snapshot, the snapshot step can be skipped on warm builds — but for webhook-driven rebuilds, every webhook fires a fresh build and we want a fresh snapshot anyway. This also means `pnpm preview` (running the built artifact locally) works without Ghost available.

**Implementation sketch:**

```
scripts/snapshot-content.ts
  ↓ fetch all content via contentService.getAllPosts/getAllProjects/getAllPhotoSets
  ↓ write src/content/data/posts.json
  ↓   src/content/data/projects.json
  ↓   src/content/data/photosets.json

vite-react-ssg build
  ↓ loads the JSON snapshot in the adapter
  ↓ runs each route's loader against the snapshot
  ↓ enumerates dynamic route paths via getStaticPaths
  ↓ produces {route}/index.html per route + per slug
```

**Alternative considered:** Have `vite-react-ssg` call Ghost directly during the build. Rejected: forces network availability during the render pass; if Ghost hiccups the build breaks mid-way and may produce half-rendered output.

### Decision 3: Three dev modes via `VITE_CMS` and an implicit build-time default

**Rationale:** We already have `VITE_CMS=ghost` and unset-as-mock. Adding `snapshot` and a default-at-build-time keeps the existing two and adds a third without changing anyone's muscle memory.

```
                       VITE_CMS unset   VITE_CMS=mock   VITE_CMS=ghost   VITE_CMS=snapshot
  pnpm dev             MockAdapter      MockAdapter     GhostAdapter     StaticAdapter  (reads JSON)
                                                                  
  pnpm build           StaticAdapter    StaticAdapter   StaticAdapter    StaticAdapter
                       (implicit because we're building)
```

The implicit-at-build-time rule keeps the existing `.env.example` simple — users don't need to set `VITE_CMS` to get the build working.

**Alternative considered:** Separate flag like `BUILD_STATIC=1`. Rejected: it's a single boolean at build time, easier to derive from `import.meta.env.MODE === 'production'` or from Vite's build hook context.

### Decision 4: Commit snapshot JSON to git, ignore in `.gitignore`

**Rationale:** Two reference points:
- **Commit**: reproducible builds, no "did we forget to snapshot" failure mode, README mentions `pnpm snapshot` is run explicitly when content changes.
- **Ignore**: snapshots are derivative of upstream; commits get noisy with rewrites on every content update; CI/build does the snapshot fresh.

We choose **commit** because the project is small, content churn is low, and a git-tracked snapshot provides a clean way to `pnpm preview` against real-looking content without ever visiting Ghost during local development. The `pnpm snapshot` command is documented as the in-dev way to refresh it.

### Decision 5: `getStaticPaths` per dynamic route, `includedRoutes` aggregator

**Rationale:** `vite-react-ssg` expects a route's `getStaticPaths` to return an array of slugs to pre-render. Each of `blog.$slug.tsx`, `portfolio.$slug.tsx`, `photography.$slug.tsx` exports one. The top-level `ssgOptions.includedRoutes` aggregator in `vite.config.ts` then unions them:

```ts
includedRoutes(paths, routes) {
  return [
    ...paths,
    ...flatMapDynamic(routes, 'blog.$slug', await contentService.getPosts()),
    ...flatMapDynamic(routes, 'portfolio.$slug', await contentService.getProjects()),
    ...flatMapDynamic(routes, 'photography.$slug', await contentService.getPhotoSets()),
  ]
}
```

This keeps each route route-file-local (good for TanStack Router's file-based conventions) and centralizes the enumeration in the build config.

### Decision 6: Keep Suspense and loaders intact; loader data baked into HTML at build time

**Rationale:** The current homepage uses `defer()` and Suspense. Targeting tanstack-start-style "loader data baked into HTML at build time, hydrated from JSON during browser nav" — produced by `vite-react-ssg/tanstack` automatically — means **no code changes to existing routes**. The Suspense boundaries become dead code in the static HTML (their data is already there) but stay useful in `pnpm dev:ghost` mode where real fetches happen.

This is the migration-safe path: every existing page continues to work; the SSG plugin eats the loader outputs at build time.

**Alternative considered:** Rewrite all routes to use server-only data loaders, removing `defer()` and the Suspense fallback components. Rejected: throws away working code without a compelling reason; the hybrid model above is cleaner.

### Decision 7: Webhook → Vercel rebuild via Ghost's native integration

**Rationale:** Ghost has a built-in "Deploy" integration in admin that can POST to any HTTPS endpoint (Vercel's deploy hook URL). No custom receiver needed. Webhook fires on `post.published`, `post.updated`, `post.unpublished`, `site.changed` (the four we care about). Vercel receives the POST, queues a build, the build runs `scripts/snapshot-content.ts` + `vite-react-ssg build`, output ships to the CDN.

**Implementation in this change:** README documents the configuration, `.env.example` includes the optional `VERCEL_DEPLOY_HOOK` URL placeholder, and the `pnpm build` script can be invoked locally to reproduce production builds. No application code for webhook handling.

**Alternative considered:** Vercel Edge Functions for ISR. Rejected for now — the expected content volume (15-50 posts + projects + photo sets) makes full rebuilds trivial. Revisit if rebuild time exceeds ~60s.

## Risks / Trade-offs

- **[Risk] `vite-react-ssg/tanstack` is marked experimental** → Mitigation: Pin a specific version of `vite-react-ssg` in `package.json`. The plugin is MIT, source is small and self-contained; if it falls behind TanStack Router's evolution we can fork or pin to a working build. The integration surface in `main.tsx` is ~10 lines, easily replaced.
- **[Risk] Build size grows dramatically with many slugs** → For 15-50 routes the output is sub-MB per page. If the site grows past ~200 slugs, the snapshot JSON grows and rebuild time matters — mitigation: defer to ISR at that point.
- **[Risk] Snapshot drift between deploys if Ghost is updated during the snapshot window** → Snapshot is always fetched fresh at the start of `pnpm build`, so the same deploy sees a consistent point-in-time. The only race is "edited in Ghost during the snapshot", which Ghost's webhook ack can mitigate (wait for save before triggering Vercel rebuild).
- **[Risk] Ghost CORS configuration needed for `pnpm dev:ghost`** → Documented in README. Build mode does not require runtime CORS.
- **[Risk] `getStaticPaths` runs at build time only, not in dev** → Mitigation: `pnpm dev` and `pnpm dev:ghost` continue to use TanStack Router's regular dynamic route matching; `getStaticPaths` is ignored unless we're inside the SSG build. This matches `vite-react-ssg`'s documented behavior.
- **[Risk] Lost randomized data fetch behavior** → `MockAdapter` returns static data today; no client-only randomness to worry about. Worth flagging if A/B tests or randomized featured content is added later.
- **[Risk] Build environment needs egress to Ghost** → Vercel has unrestricted egress to the public internet by default. Self-hosted builds need network access configured.

## Migration Plan

1. **Phase A: Local install + scaffolding** — install plugin, write empty `main.tsx` shim, verify `pnpm dev` still works.
2. **Phase B: Snapshot script** — write `scripts/snapshot-content.ts`, add `prebuild` chain, verify snapshot JSON appears, verify `pnpm build` runs.
3. **Phase C: SSG conversion** — flip `main.tsx` to `ViteReactSSG(Tanstack)`, add `getStaticPaths` to dynamic route stubs (the placeholders already exist from scaffolding), add `ssgOptions.includedRoutes`, verify `pnpm preview` shows pre-rendered HTML.
4. **Phase D: Adapter update** — implement `StaticAdapter` reading from JSON, update `src/content/index.ts` selector with the new branches, verify all three modes work.
5. **Phase E: Documentation** — README section on `pnpm dev`/`dev:ghost`/`snapshot`/`build`/`preview`, Ghost webhook → Vercel deploy hook configuration, environment variable expectations, local-only flexibilities.

Rollback strategy: revert `package.json` build script to `vite build`, remove `vite-react-ssg` config, keep the snapshot script (still useful for non-SSG development). The adapter selection keeps the existing two modes; only the `snapshot` and `build-time implicit` branches are new.

## Open Questions

- Should `pnpm snapshot` run before every `pnpm build` regardless (forcing fresh data), or only when the JSON is missing/stale? Current draft: always, for predictability. Final answer can land in tasks.
- State handling for the photo-set list page — currently the photo set array isn't loaded by the homepage loader. Is that already preferring individual photo paths from the `images` array, or do we need a separate content method? Out of scope for this change but flagged for `detail-routes`.
- Should the snapshot include a small index file keyed by slug for O(1) lookups, or do callers parse the JSON each time? Trivial either way; final design can decide in implementation.
