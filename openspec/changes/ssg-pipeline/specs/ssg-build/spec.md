# SSG Build

## Purpose

Define how the portfolio site is statically pre-rendered at build time, including dynamic route enumeration and orchestration of build-time content fetching.

## Requirements

### Requirement: Build script produces static HTML

The project SHALL run `vite-react-ssg build` as its production build command, producing one fully-rendered `index.html` per route at the config-specified output directory.

#### Scenario: Build replaces the previous SPA build
- **WHEN** `pnpm build` is invoked
- **THEN** the output directory contains one `index.html` per route in the route tree, plus per-slug pages for each dynamic route with declared paths

#### Scenario: Build script replaces Vite SPA build
- **WHEN** inspecting the `build` script in `package.json`
- **THEN** it runs `vite-react-ssg build` rather than `vite build`

### Requirement: Prebuild fetches content snapshot before render

The project SHALL execute a `prebuild` script that fetches all content via the content service and writes JSON files to `src/content/data/` before the build's render pass begins.

#### Scenario: Snapshot writes JSON files
- **WHEN** `pnpm build` is invoked
- **THEN** `src/content/data/posts.json`, `src/content/data/projects.json`, and `src/content/data/photosets.json` exist after `prebuild` completes

#### Scenario: Snapshot is idempotent under missing Ghost
- **WHEN** the build environment cannot reach the Ghost Content API
- **THEN** the build fails at the snapshot step with a clear error rather than producing a partially-rendered output

### Requirement: Root entry adapts to SSG pattern

The project SHALL export a `createRoot` from the root entrypoint using the `ViteReactSSG(Tanstack)` wrapping pattern, enabling SSG to drive the app's initialization during the render pass.

#### Scenario: main.tsx exports createRoot
- **WHEN** inspecting `src/main.tsx`
- **THEN** it imports `Experimental_ViteReactSSG` from `vite-react-ssg/tanstack` and exports a `createRoot` configured with the existing TanStack router instance
- **AND** it does NOT imperatively call `router.mount` or use `createRoot` from `react-dom/client` for the production mount

#### Scenario: Dev mode continues to hydrate as before
- **WHEN** `pnpm dev` or `pnpm dev:ghost` is invoked
- **THEN** the application mounts the existing router via the same hydration entry, with `vite` (not `vite-react-ssg`) driving the dev server

### Requirement: Dynamic route paths are enumerable at build time

The project SHALL enable `vite-react-ssg` to discover which concrete paths correspond to dynamic route patterns (e.g., `blog/$slug`) at build time, by exporting a `getStaticPaths` from each dynamic route file or by aggregating paths in `ssgOptions.includedRoutes`.

#### Scenario: Dynamic routes declare paths
- **WHEN** inspecting the build configuration
- **THEN** a list of slugs derived from `contentService.getPosts()`, `getProjects()`, and `getPhotoSets()` is supplied to `vite-react-ssg` so that each `blog/$slug`, `portfolio/$slug`, and `photography/$slug` is pre-rendered

#### Scenario: Multiple slugs produce multiple HTML files
- **WHEN** the snapshot contains N posts and M projects
- **THEN** the output directory contains N `blog/<slug>/index.html` files and M `portfolio/<slug>/index.html` files

### Requirement: Build does not require runtime Ghost access

The project SHALL complete a production build without depending on Ghost being reachable at any point during the actual render pass — only during the pre-snapshot fetch.

#### Scenario: Render pass reads local JSON
- **WHEN** the snapshot files in `src/content/data/` exist
- **THEN** the render pass does not perform any outbound network request to Ghost

#### Scenario: Build configuration hides secrets at render time
- **WHEN** `vite build` runs (called via `vite-react-ssg build`)
- **THEN** the production output (`dist/`) does not contain the value of `VITE_GHOST_CONTENT_API_KEY`; only the snapshot content is embedded

### Requirement: Pagination and listing page enumeration

The project SHALL determine which pagination paths to pre-render at build time, by enumerating the total pagination envelope for each listing route (`/blog`, `/portfolio`) and producing one HTML file per page.

#### Scenario: Pagination paths are concrete
- **WHEN** the content service reports N total items and a per-page limit of L
- **THEN** the build produces `ceil(N/L)` HTML files for the `/blog/page/2`, `/blog/page/3`, etc. URLs

#### Scenario: Missing pagination produces single page
- **WHEN** the content service reports fewer items than the per-page limit
- **THEN** no `page/2` HTML files are produced; the listing page is rendered as a single page only
