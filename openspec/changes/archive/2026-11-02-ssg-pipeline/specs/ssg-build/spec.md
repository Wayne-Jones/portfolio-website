# SSG Build

## Purpose

Define how the portfolio site is statically pre-rendered at build time, including dynamic route enumeration and orchestration of build-time content fetching.

## ADDED Requirements

### Requirement: Build script produces static HTML

The project SHALL run `vite build` with the TanStack Start plugin's `prerender` option enabled as its production build, producing one fully-rendered `index.html` per route in `dist/client/`.

#### Scenario: Build replaces the previous SPA build
- **WHEN** `pnpm build` is invoked
- **THEN** `dist/client/` contains one `index.html` per route in the route tree, plus per-slug pages for each dynamic route with declared paths

#### Scenario: SSG is driven by the Vite plugin, not a different CLI
- **WHEN** inspecting the `build` script in `package.json`
- **THEN** it runs `vite build` (SSG driven by `tanstackStart({ prerender: { enabled: true } })` in `vite.config.ts`)

### Requirement: Prebuild fetches content snapshot before render

The project SHALL execute a `prebuild` script that fetches all content via the content service and writes JSON files to `src/content/data/` before the build's render pass begins.

#### Scenario: Snapshot writes JSON files
- **WHEN** `pnpm build` is invoked
- **THEN** `src/content/data/posts.json`, `src/content/data/projects.json`, and `src/content/data/photosets.json` exist after `prebuild` completes

#### Scenario: Snapshot is idempotent under missing Ghost
- **WHEN** the build environment cannot reach the Ghost Content API
- **THEN** the build fails at the snapshot step with a clear error rather than producing a partially-rendered output

### Requirement: Root entry adapts to the SSG pipeline

The project SHALL expose the router through a `getRouter()` factory in `src/router.tsx` so both the build-time render pass and the client hydration share one router definition, with the HTML document produced by the root route.

#### Scenario: router.tsx exports a router factory
- **WHEN** inspecting `src/router.tsx`
- **THEN** it exports a `getRouter()` function creating the router from `routeTree.gen.ts` with the existing options (`defaultPreload: "intent"`, `defaultViewTransition: true`, `trailingSlash: "never"`), the `startViewTransition` override, and the `Register` module augmentation
- **AND** `src/main.tsx` and the standalone `index.html` template are removed (the root route renders the document)

#### Scenario: Root route renders the HTML document
- **WHEN** inspecting `src/routes/__root.tsx`
- **THEN** it renders `<html>`/`<head>`/`<body>` with `HeadContent` and `Scripts`, and declares meta/favicon via a `head` export

#### Scenario: Unknown paths render the 404 UI
- **WHEN** a browser requests a path that was not pre-rendered
- **THEN** a `$.tsx` splat route renders the not-found UI instead of the static host's default 404

#### Scenario: Dev mode serves SSR pages
- **WHEN** `pnpm dev` or `pnpm dev:ghost` is invoked
- **THEN** the Start dev server renders pages server-side with HMR, using `MockAdapter`/`GhostAdapter` per `VITE_CMS`

### Requirement: Dynamic route paths are enumerable at build time

The project SHALL enable the prerender pass to discover which concrete paths correspond to dynamic route patterns (e.g., `blog/$slug`) by listing them in `prerender.pages` in `vite.config.ts`, derived from the snapshot JSON.

#### Scenario: Dynamic routes declare paths
- **WHEN** inspecting the build configuration
- **THEN** `prerender.pages` contains a `blog/<slug>` entry for every post and a `portfolio/<slug>` entry for every project in `src/content/data/*.json`

#### Scenario: Multiple slugs produce multiple HTML files
- **WHEN** the snapshot contains N posts and M projects
- **THEN** `dist/client/` contains N `blog/<slug>/index.html` files and M `portfolio/<slug>/index.html` files

### Requirement: Build does not require runtime Ghost access

The project SHALL complete a production build without depending on Ghost being reachable at any point during the actual render pass — only during the pre-snapshot fetch.

#### Scenario: Render pass reads local JSON
- **WHEN** the snapshot files in `src/content/data/` exist
- **THEN** the render pass does not perform any outbound network request to Ghost

#### Scenario: Build configuration hides secrets at render time
- **WHEN** `vite build` runs (with the prerender plugin active)
- **THEN** the production output (`dist/client/`) does not contain the value of `VITE_GHOST_CONTENT_API_KEY`; only the snapshot content is embedded

### Requirement: Pagination and listing page enumeration

The project SHALL determine which pagination paths to pre-render at build time, by enumerating the total pagination envelope for each listing route (`/blog`, `/portfolio`) and producing one HTML file per page.

#### Scenario: Pagination paths are concrete
- **WHEN** the content service reports N total items and a per-page limit of L
- **THEN** the build produces `ceil(N/L)` HTML files for the `/blog/page/2`, `/blog/page/3`, etc. URLs

#### Scenario: Missing pagination produces single page
- **WHEN** the content service reports fewer items than the per-page limit
- **THEN** no `page/2` HTML files are produced; the listing page is rendered as a single page only
