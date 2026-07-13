## Why

The portfolio website has a high-fidelity homepage and scaffolded content architecture but cannot yet serve real Ghost CMS content as a deployed product. Today, the site runs as a client-side React app: every visitor's browser hits Ghost directly through the Content API, every page requires hydration before showing content, and SEO crawlers see an empty shell until JavaScript executes. This makes the site unsuitable for production deployment, breaks search indexing, and exposes the read-only Content API key to every visitor instead of keeping content fetching at the trusted build boundary.

Building static assets at webhook time and serving them from a CDN is the right move: it produces sub-second first paint, full SEO content visibility, and removes Ghost's runtime availability/cost from the user-facing path. This change lays the pipeline foundation.

## What Changes

- Add `vite-react-ssg` (and its TanStack Router experimental adapter) as a build-time dependency.
- Replace the `vite build` script with `vite-react-ssg build` so production output is pre-rendered HTML per route, not a single SPA shell.
- Convert the root entry to the `ViteReactSSG(Tanstack)` wrapping pattern, exporting `createRoot` instead of mounting in an effect.
- Add a `prebuild` script (`scripts/snapshot-content.ts`) that fetches all Ghost content via the existing `GhostAdapter` and serializes it to `src/content/data/{posts,projects,photosets}.json`. The build script invokes it automatically.
- Extend the `ContentService` selection in `src/content/index.ts` so that:
  - `VITE_CMS=ghost` → live fetch (dev with real backend)
  - `VITE_CMS=snapshot` or unset at build time → reads from JSON snapshot
  - `VITE_CMS=mock` or any other value → returns `MockAdapter` (default offline dev)
- Add a `getStaticPaths` style hook on dynamic routes (`blog.$slug.tsx`, `portfolio.$slug.tsx`, `photography.$slug.tsx`) so SSG can enumerate which paths to pre-render from the content snapshot.
- Configure `ssgOptions.includedRoutes` in `vite.config.ts` to expand those slug patterns into concrete paths at build time.
- Document the Vercel deploy + Ghost webhook integration in `README.md` (webhook payload → `git pull && pnpm build && deploy` or Vercel's deploy hook).
- Add npm scripts: `pnpm prebuild`, `pnpm snapshot`, `pnpm dev:ghost`, and keep `pnpm dev` for mock/offline mode.

This change does **not** implement the content tree, render real post bodies, or wire pagination. Those come in subsequent changes.

## Capabilities

### New Capabilities
- `ssg-build`: Static site generation pipeline — graceful shutdown of pre-rendering, dynamic route enumeration, and build-time fetch orchestration.
- `content-snapshot`: Snapshotting the Ghost CMS state into local JSON at build time so the build is fully reproducible without depending on Ghost availability during the actual render pass.

### Modified Capabilities
- `content-adapter`: Add a new selection path that reads from a build-time JSON snapshot (`VITE_CMS=snapshot` or implicit at build time), keeping `ghost` for live dev and `mock` as the offline default.

## Impact

- New dependency: `vite-react-ssg` (~107KB package, transitively pulls `jsdom`, `html5parser`, `react-helmet-async`). No runtime bundle impact because it runs only at build time.
- Existing dependency `react-compiler` Babel plugin remains — `vite-react-ssg` invokes the same Vite config plugins and babel pipeline.
- `package.json` scripts change: `build` becomes `vite-react-ssg build`, with `prebuild` running automatically before it.
- New runtime code path: `src/content/data/*.json` files (gitignored or committed as snapshot — see design.md decision). Build output expands significantly (one HTML file per route + per slug).
- Existing client-side behavior in dev (`pnpm dev`) is unchanged: SPA + Suspense + skeleton states still show because live fetch remains intact.
- Requires CORS to be open on the Ghost instance for live dev mode (`pnpm dev:ghost`). Build mode does NOT require runtime CORS — content is fetched at build time from the deploy environment, which is a normal egress scenario.
- New external integration: a Vercel deploy hook triggered by a Ghost webhook on `post.published`, `post.updated`, `post.unpublished`, and `site.changed`. README documents the configuration; no code lives in this repo for the webhook receiver.
