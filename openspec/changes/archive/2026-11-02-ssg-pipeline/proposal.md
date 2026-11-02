## Why

The portfolio website has a high-fidelity homepage and scaffolded content architecture but cannot yet serve real Ghost CMS content as a deployed product. Today, the site runs as a client-side React app: every visitor's browser hits Ghost directly through the Content API, every page requires hydration before showing content, and SEO crawlers see an empty shell until JavaScript executes. This makes the site unsuitable for production deployment, breaks search indexing, and exposes the read-only Content API key to every visitor instead of keeping content fetching at the trusted build boundary.

Building static assets at webhook time and serving them from a CDN is the right move: it produces sub-second first paint, full SEO content visibility, and removes Ghost's runtime availability/cost from the user-facing path. This change lays the pipeline foundation.

## What Changes

- Adopt **TanStack Start** (`@tanstack/react-start`, v1) as the build-time SSG layer — the official Vite plugin for TanStack Router. This replaces the earlier plan to use `vite-react-ssg`, whose TanStack adapter is a throwing stub in every 0.9.x release.
- Keep `vite build` as the production command; the `tanstackStart({ prerender: { enabled: true } })` plugin emits pre-rendered HTML per route (one `index.html` per static route + per slug) into `dist/client/`, not a single SPA shell.
- Convert the root entry: move the router into `src/router.tsx` exporting a `getRouter()` factory (preserving the `startViewTransition` override and `Register` augmentation); `__root.tsx` renders the HTML document with `HeadContent`/`Scripts` and a `head` export; `src/main.tsx` and `index.html` are removed.
- Add a `prebuild` script (`scripts/snapshot-content.ts`) that fetches all Ghost content via the existing `GhostAdapter` and serializes it to `src/content/data/{posts,projects,photosets}.json`. The build script invokes it automatically.
- Extend the `ContentService` selection in `src/content/index.ts` so that:
  - `VITE_CMS=ghost` → live fetch (dev with real backend)
  - `VITE_CMS=snapshot` or unset at build time → reads from JSON snapshot
  - `VITE_CMS=mock` or any other value → returns `MockAdapter` (default offline dev)
- Enumerate dynamic slug paths in `vite.config.ts` (`prerender.pages`) from the snapshot JSON — `blog/$slug` and `portfolio/$slug` for every content item.
- Add `src/routes/$.tsx` splat route for client-side 404 handling on static hosts, plus `vercel.json` (`outputDirectory: dist/client`).
- Document the Vercel deploy + Ghost webhook integration in `README.md` (webhook payload → Vercel deploy hook → `pnpm build`).
- Add npm scripts: `pnpm prebuild`, `pnpm snapshot`, `pnpm dev:ghost`, and keep `pnpm dev` for mock/offline mode.

This change does **not** implement the content tree, render real post bodies, or wire pagination. Those come in subsequent changes.

## Capabilities

### New Capabilities
- `ssg-build`: Static site generation pipeline — graceful shutdown of pre-rendering, dynamic route enumeration, and build-time fetch orchestration.
- `content-snapshot`: Snapshotting the Ghost CMS state into local JSON at build time so the build is fully reproducible without depending on Ghost availability during the actual render pass.

### Modified Capabilities
- `content-adapter`: Add a new selection path that reads from a build-time JSON snapshot (`VITE_CMS=snapshot` or implicit at build time), keeping `ghost` for live dev and `mock` as the offline default.

## Impact

- New dependency: `@tanstack/react-start` (v1, pinned) — the official TanStack framework plugin for Vite. Build-time only; no runtime bundle impact beyond the small client runtime Start adds for hydration.
- `vite-react-ssg` (installed during earlier investigation) is removed.
- Existing dependency `react-compiler` Babel plugin remains — Start runs the same Vite config plugins and babel pipeline.
- `package.json` scripts: `build` stays `tsc -b && vite build` (SSG is driven by the Vite plugin, not a different CLI), with `prebuild` running automatically before it. Output moves from `dist/` to `dist/client/`.
- New runtime code path: `src/content/data/*.json` files (committed as snapshot — see design.md decision). Build output expands significantly (one HTML file per route + per slug).
- Dev mode changes: `pnpm dev` now runs the Start dev server (SSR + HMR) instead of a pure SPA; loaders execute server-side, so skeleton states appear only during client navigations, not first load. View transitions and animations are preserved.
- Requires CORS to be open on the Ghost instance for live dev mode (`pnpm dev:ghost`). Build mode does NOT require runtime CORS — content is fetched at build time from the deploy environment, which is a normal egress scenario.
- New external integration: a Vercel deploy hook triggered by a Ghost webhook on `post.published`, `post.updated`, `post.unpublished`, and `site.changed`. README documents the configuration; no code lives in this repo for the webhook receiver.
