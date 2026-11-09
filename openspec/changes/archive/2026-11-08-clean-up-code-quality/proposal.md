## Why

The codebase has accumulated duplication and dead weight that make each future change more expensive than it should be:

- `getFeaturedPhotos` is copied verbatim into all three adapters, and the shared listing/metadata logic is copy-pasted between `BlogListing`/`PortfolioListing` and three detail routes.
- `getFeaturedProjects` is misnamed — it returns the first N projects in array order, not featured ones — and the Ghost `featured` field is parsed but never used.
- Recent/featured subsets slice whatever order the source returns, so their output depends on Ghost response order and snapshot file order.
- `vite.config.ts` swallows every error while reading snapshot slugs, and `scripts/snapshot-content.ts` parses `.env` with a naive `split("=")` that breaks on quotes, escapes, `export`, and CRLF.
- There are no route error boundaries, so a render failure produces a blank page.
- `useRevealRef` uses `useLayoutEffect` during SSR, and the hero parallax binds one global `document.querySelector` once, so it stops working after a breakpoint change.
- `src/components/ui/` (Button, Card, variants) is unused, along with `@base-ui/react`, `lucide-react`, and `@fontsource-variable/inter`; `zod` is a runtime dependency for a build-only adapter.
- The footer year is computed at module load, and the README no longer matches the implementation.
- There is no CI workflow, so lint, formatting, types, tests, and the build are only checked locally.

None of this changes what visitors see, but it is the difference between a codebase that is cheap to change and one that is not.

## What Changes

- Extract the featured-photo projection into one shared helper used by the static, mock, and Ghost adapters.
- Extract a shared listing shell for `/blog` and `/portfolio` and a shared metadata-join helper for tiles and detail headers.
- Rename `getFeaturedProjects(limit)` to `getRecentProjects(limit)` to match `getRecentPosts(limit)`, and delete the unused Ghost `featured` field.
- Sort every collection newest-first by `publishedAt` with a stable slug/id tiebreak, in both the adapters and the snapshot writer, so recent/featured output is deterministic.
- Fail the build when a snapshot JSON file is malformed instead of silently prerendering zero detail routes.
- Replace the naive `.env` parser with a quoted/escaped-value-aware loader and surface its errors.
- Add a shared route error component through the router so render failures show a recoverable error page.
- Replace `useLayoutEffect` in `useRevealRef` with an isomorphic layout effect, and make the hero parallax use a section ref plus breakpoint-change listeners.
- Delete the unused `src/components/ui/` components and scaffold assets, remove `@base-ui/react`, `lucide-react`, and `@fontsource-variable/inter`, and move `zod` to devDependencies.
- Compute the footer year at render time and bring the README back in line with the project.
- Add a GitHub Actions CI workflow that runs install, lint, format check, type check, tests, and the production build.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-adapter`: define deterministic collection ordering, replace `getFeaturedProjects` with `getRecentProjects`, and document the homepage subset methods.
- `content-snapshot`: require deterministic snapshot ordering and robust `.env` loading with clear failures.
- `ssg-build`: fail prerender enumeration on malformed snapshots and render a recoverable error UI through the router.
- `project-scaffold`: require CI coverage and dependency/dead-code hygiene, and stop requiring Base UI as an always-installed dependency.
- `shadcn-base-ui`: add components on demand and remove unused generated components.

## Impact

- `src/content/types.ts`, `src/content/index.ts`, `src/content/adapters/{static,mock,ghost}.ts`
- `src/content/featured.ts` (new), `src/lib/meta.ts` (new), `src/components/article/ListingPage.tsx` (new), `src/components/article/RouteError.tsx` (new)
- `src/components/article/{BlogListing,PortfolioListing,ArticleHeader,PhotoSetTile}.tsx`
- `src/components/home/shared/useReveal.ts`, `src/components/home/hero/Hero.tsx`
- `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/router.tsx`
- `vite.config.ts`, `scripts/snapshot-content.ts`, `scripts/load-env.ts` (new), `scripts/read-slugs.ts` (new)
- `src/components/ui/` (deleted), `package.json`
- `README.md`, `.github/workflows/ci.yml` (new)
- Tests for ordering, featured-photo projection, env parsing, slug reads, and the listing shell
- No user-facing route, data-shape, or content changes
