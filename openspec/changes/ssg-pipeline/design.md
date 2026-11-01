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
- Preserve the existing dev-mode developer experience: `pnpm dev` continues to run against `MockAdapter` (offline default) or `GhostAdapter` (`pnpm dev:ghost`) with no behavior regressions to animations, Suspense loading states, or view transitions.
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

### Decision 1: Use TanStack Start with static prerendering

**Rationale:** TanStack Start is the official TanStack framework — a Vite plugin wrapping the existing TanStack Router file-based routing. As of v1 it ships first-class static prerendering (`tanstackStart({ prerender: { enabled: true } })`): the build executes loaders at build time, embeds dehydrated loader data in the HTML, and emits one `index.html` per path to `dist/client/`. The app's file-based routes, typed loaders, and `defer()` + Suspense patterns carry over without a route-file rewrite, and the framework is actively maintained by the TanStack team.

The initial plan used `vite-react-ssg@0.9.2`, whose TanStack adapter is a published stub — every 0.9.x build throws "[vite-react-ssg] Sorry, this Version has no support for tanstack router". The only functional release (0.8.9) is unmaintained and still depends on `@tanstack/start`. Since every real TanStack SSG adapter depends on `@tanstack/start`, adopting TanStack Start itself is strictly better than patching a dormant fork.

**Alternatives considered:**
- `vite-react-ssg` 0.9.x: TanStack adapter is a throwing stub; 0.8.9 is unmaintained and pulls in `@tanstack/start` anyway.
- Patch/fork `vite-react-ssg@0.9.2` locally: viable but reinvents what Start now does natively.
- `vike` (formerly `vite-plugin-ssr`): Battle-tested but heavier (1.7MB unpacked) and framework-agnostic in a way that adds overhead for a project this small. Doc surface and TanStack Router integration are weaker.
- `vite-plugin-prerender`: Framework-agnostic, but uses Puppeteer-based prerendering rather than route-aware SSG. Loaders don't run at build time, which loses the typed loader benefits.
- Roll our own ssrHelpers with React 18 stream + Vite SSR: Maximum control, lots of yak shaving, no upside for this scoped project.

**Compatibility note:** Start added official Vite 8 (Rolldown) peer support in the `1.167.x` line (April 2026, including `rolldownOptions` handling and modulepreload fixes). Pin `@tanstack/react-start` to a version ≥ that line and verify dev + prerender once installed.

### Decision 2: Snapshot content to JSON before the build runs

**Rationale:** Separating "fetch content from Ghost" from "render content to HTML" makes the build reproducible and decoupled. The snapshot step runs first, writes JSON, then the build reads it. If the JSON is already present and newer than the last snapshot, the snapshot step can be skipped on warm builds — but for webhook-driven rebuilds, every webhook fires a fresh build and we want a fresh snapshot anyway. This also means `pnpm preview` (running the built artifact locally) works without Ghost available.

**Implementation sketch:**

```
scripts/snapshot-content.ts
  ↓ fetch all content via contentService.getAllPosts/getAllProjects/getAllPhotoSets
  ↓ write src/content/data/posts.json
  ↓   src/content/data/projects.json
  ↓   src/content/data/photosets.json

vite build (tanstackStart prerender)
  ↓ loads the JSON snapshot in the adapter
  ↓ runs each route's loader against the snapshot
  ↓ enumerates dynamic route paths via the top-level `pages` option
  ↓ produces dist/client/{route}/index.html per route + per slug
```

**Alternative considered:** Have the build call Ghost directly during the render pass. Rejected: forces network availability during the render pass; if Ghost hiccups the build breaks mid-way and may produce half-rendered output.

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

### Decision 5: Enumerate dynamic slug paths in the prerender config from the snapshot JSON

**Rationale:** TanStack Start's `autoStaticPathsDiscovery` covers only non-parameterized routes; `$slug` routes must be listed explicitly via the top-level `pages` option. The slugs are already sitting in `src/content/data/*.json` when the config loads (the `prebuild` snapshot runs before `vite build`), so `vite.config.ts` imports the JSON and builds a concrete `pages` array:

```ts
import posts from "./src/content/data/posts.json";
import projects from "./src/content/data/projects.json";

pages: [
  ...posts.map((p) => `/blog/${p.slug}`),
  ...projects.map((p) => `/portfolio/${p.slug}`),
  // photography/$slug paths deferred until the detail-routes change adds the route file
],

prerender: {
  enabled: true,
  autoStaticPathsDiscovery: true,
  autoSubfolderIndex: true,
}
```

This centralizes enumeration in the build config (the only place with access to both the route tree and the snapshot) and keeps the route files free of SSG-specific hooks — matching TanStack Start's conventions.

**Alternative considered:** `crawlLinks` to discover slug pages by following links from listing pages. Rejected as the primary mechanism: it works today but fails silently for content not linked from an already-rendered page, and a broken link fails the whole build. `pages` is deterministic and explicit.

### Decision 6: Keep Suspense and loaders intact; loader data baked into HTML at build time

**Rationale:** TanStack Start runs each route's loader during prerendering and embeds the dehydrated loader data in the emitted HTML, so the existing `defer()` + Suspense pattern in `index.tsx` requires **no code changes to existing routes**. At build time the deferred promises resolve against the snapshot JSON and the rendered sections (not the skeleton fallbacks) are baked into the static HTML; during client-side navigation the same loaders run against the StaticAdapter. The Suspense boundaries remain as loading states for client navigations and keep working in `pnpm dev:ghost` mode.

This is the migration-safe path: every existing page continues to work; Start eats the loader outputs at build time. Verification task 7.9 asserts the deferred homepage sections appear in the prerendered HTML.

**Alternative considered:** Rewrite all routes to use server-only data loaders, removing `defer()` and the Suspense fallback components. Rejected: throws away working code without a compelling reason; the hybrid model above is cleaner.

### Decision 7: Webhook → Vercel rebuild via Ghost's native integration

**Rationale:** Ghost has a built-in "Deploy" integration in admin that can POST to any HTTPS endpoint (Vercel's deploy hook URL). No custom receiver needed. Webhook fires on `post.published`, `post.updated`, `post.unpublished`, `site.changed` (the four we care about). Vercel receives the POST, queues a build, the build runs `pnpm prebuild` (snapshot) + `pnpm build`, output ships to the CDN.

**Implementation in this change:** README documents the configuration, `.env.example` includes the optional `VERCEL_DEPLOY_HOOK` URL placeholder, and the `pnpm build` script can be invoked locally to reproduce production builds. No application code for webhook handling.

**Alternative considered:** Vercel Edge Functions for ISR. Rejected for now — the expected content volume (15-50 posts + projects + photo sets) makes full rebuilds trivial. Revisit if rebuild time exceeds ~60s.

## Risks / Trade-offs

- **[Risk] TanStack Start is v1 and fast-moving** → Mitigation: pin `@tanstack/react-start` and `@tanstack/react-router` to a specific version pair and upgrade deliberately. The prerender surface we use (`prerender.enabled`, `pages`, `autoSubfolderIndex`) is stable in the 1.16x line.
- **[Risk] Vite 8 (Rolldown) compatibility** → Mitigation: Start added official Vite 8 peer support in 1.167.x; pin ≥ that line and verify `pnpm dev` and `pnpm build` in task 1.1 before proceeding. A known modulepreload quirk (April 2026, TanStack/router#7197) is fixed on newer Rolldown/Vite; re-verify at install time.
- **[Risk] `defer()` + Suspense under static prerender** → The deferred promises must resolve during the prerender pass so the HTML contains the rendered sections, not the skeleton fallbacks. Mitigation: snapshot-backed loaders resolve immediately; verification task 7.9 asserts the deferred sections are baked into `dist/client/index.html`.
- **[Risk] Static hosting 404 handling** → TanStack Router's `defaultNotFoundComponent` throws on static hosts. Mitigation: `src/routes/$.tsx` splat route renders the not-found UI; hosting rewrites fall through to the app shell.
- **[Risk] Build size grows dramatically with many slugs** → For 15-50 routes the output is sub-MB per page. If the site grows past ~200 slugs, the snapshot JSON grows and rebuild time matters — mitigation: defer to ISR at that point.
- **[Risk] Snapshot drift between deploys if Ghost is updated during the snapshot window** → Snapshot is always fetched fresh at the start of `pnpm build`, so the same deploy sees a consistent point-in-time. The only race is "edited in Ghost during the snapshot", which Ghost's webhook ack can mitigate (wait for save before triggering Vercel rebuild).
- **[Risk] Ghost CORS configuration needed for `pnpm dev:ghost`** → Documented in README. Build mode does not require runtime CORS.
- **[Risk] Slug enumeration is config-time, not dev-time** → the top-level `pages` option is only consulted during `vite build`. Mitigation: `pnpm dev` and `pnpm dev:ghost` continue to use TanStack Router's regular dynamic route matching, so dev behavior is unaffected.
- **[Risk] Lost randomized data fetch behavior** → `MockAdapter` returns static data today; no client-only randomness to worry about. Worth flagging if A/B tests or randomized featured content is added later.
- **[Risk] Build environment needs egress to Ghost** → Vercel has unrestricted egress to the public internet by default. Self-hosted builds need network access configured.

## Migration Plan

1. **Phase A: Install + compatibility check** — install `@tanstack/react-start` (pinned ≥1.167.x for Vite 8 support), remove `vite-react-ssg`, verify `pnpm dev` boots the Start dev server.
2. **Phase B: Snapshot script** — write `scripts/snapshot-content.ts`, add `prebuild` chain, verify snapshot JSON appears, verify the build reads it.
3. **Phase C: Root entry conversion** — move the router into `src/router.tsx` (`getRouter()` factory preserving the `startViewTransition` override and `Register` augmentation), convert `__root.tsx` to render the HTML document (`HeadContent`/`Scripts`, `head` export), add the `$.tsx` splat 404, remove `src/main.tsx` and `index.html`.
4. **Phase D: Prerender configuration** — add `tanstackStart({ prerender })` with `pages` enumerated from the snapshot JSON, set `trailingSlash: "never"`, add `vercel.json` (`outputDirectory: dist/client`), verify `pnpm build` emits one `index.html` per route and per slug.
5. **Phase E: Adapter update** — implement `StaticAdapter` reading from JSON, update `src/content/index.ts` selector with the new branches, verify all three modes work.
6. **Phase F: Documentation** — README section on `pnpm dev`/`dev:ghost`/`snapshot`/`build`/`preview`, Ghost webhook → Vercel deploy hook configuration, environment variable expectations, local-only flexibilities.

Rollback strategy: remove the `tanstackStart` plugin, restore `src/main.tsx` + `index.html` + the fragment-based `__root.tsx`, keep the snapshot script (still useful for non-SSG development). The adapter selection keeps the existing modes; only the `snapshot` and `build-time implicit` branches are new.

## Open Questions

- Should `pnpm snapshot` run before every `pnpm build` regardless (forcing fresh data), or only when the JSON is missing/stale? Current draft: always, for predictability. Final answer can land in tasks.
- State handling for the photo-set list page — currently the photo set array isn't loaded by the homepage loader. Is that already preferring individual photo paths from the `images` array, or do we need a separate content method? Out of scope for this change but flagged for `detail-routes`.
- Should the snapshot include a small index file keyed by slug for O(1) lookups, or do callers parse the JSON each time? Trivial either way; final design can decide in implementation.
- Should this change create the `photography.$slug.tsx` route file (stub) so `photography/<slug>/index.html` can be pre-rendered, or defer it to `detail-routes`? Current draft: defer — there is no route file to pre-render, so photography slugs are out of scope for this change's verification.
