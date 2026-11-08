# Tasks

## 1. Shared content helpers

- [x] 1.1 Add `src/content/sort.ts` with `sortByPublishedAtDesc` (ISO date, then slug, then id) and unit tests for newest-first, equal timestamps, and repeatability
- [x] 1.2 Add `src/content/featured.ts` with `buildFeaturedPhotos(sets, limit)` and unit tests for cover preference, first-image fallback, empty sets, one-per-set, and the limit
- [x] 1.3 Replace the three duplicated `getFeaturedPhotos` loops in `StaticAdapter`, `MockAdapter`, and `GhostAdapter` with the shared helper; verify the existing content tests pass
- [x] 1.4 Sort the collections returned by every adapter through `sortByPublishedAtDesc`; verify a shuffled fixture produces the same order in each adapter
- [x] 1.5 Rename `getFeaturedProjects` to `getRecentProjects` in `types.ts`, `index.ts`, all adapters, and the homepage loader; verify `grep -r getFeaturedProjects src` returns nothing and the homepage test still renders four projects
- [x] 1.6 Remove the unused `featured` field from the Ghost post schema and verify `pnpm exec tsc -b` passes

## 2. Shared listing and metadata

- [ ] 2.1 Add `src/components/article/ListingPage.tsx` for the eyebrow/title/description, grid, empty message, and pagination; rewrite `BlogListing` and `PortfolioListing` to use it; verify tests cover headings, cards, empty state, and pagination for both
- [ ] 2.2 Add `joinMetadata(parts)` in `src/lib/meta.ts` and use it in `PhotoSetTile` and `photography.$slug`; verify a test covers location-only, camera-only, both, and neither
- [ ] 2.3 Move the portfolio role/client/year placeholder join into a named helper and use it in `portfolio.$slug`; verify the rendered metadata is unchanged

## 3. Error handling and client hooks

- [ ] 3.1 Add `src/components/article/RouteError.tsx` (message, retry, home link) and set `defaultErrorComponent` in `src/router.tsx`; verify a temporarily throwing route in dev shows the error page inside the site shell
- [ ] 3.2 Add `src/lib/use-isomorphic-layout-effect.ts` and use it in `useRevealRef`; verify `pnpm build` emits no `useLayoutEffect` SSR warning and sections still reveal
- [ ] 3.3 Refactor `useParallaxScroll` to use a section ref and desktop/reduced-motion media-query change listeners; verify resizing across 1024px starts and stops parallax without a reload

## 4. Build-time scripts

- [ ] 4.1 Extract `readSlugs` into `scripts/read-slugs.ts` using `existsSync` plus thrown, file-named errors; wire it into `vite.config.ts`; verify tests cover missing (empty), malformed JSON (throws), and non-array root (throws)
- [ ] 4.2 Extract `.env` loading into `scripts/load-env.ts` using `node:util` `parseEnv` with line validation and no-overwrite precedence; wire it into `scripts/snapshot-content.ts`; verify tests cover `=` in values, quotes, escapes, `export`, CRLF, empty values, precedence, and malformed lines
- [ ] 4.3 Sort each array in `writeSnapshot` with the shared sort helper; verify two snapshots from shuffled input are byte-identical
- [ ] 4.4 Run `SNAPSHOT_SOURCE=mock pnpm snapshot` and confirm the committed snapshot is intentionally updated in sorted order, then commit it

## 5. Dead code, dependencies, and docs

- [ ] 5.1 Delete `src/components/ui/button.tsx`, `button-variants.ts`, and `card.tsx`; verify `grep -r "@/components/ui" src` returns nothing
- [ ] 5.2 Remove `@base-ui/react`, `lucide-react`, and `@fontsource-variable/inter` from `package.json`, move `zod` to `devDependencies`, and add an `engines.node` floor; verify `pnpm install` and `pnpm build` succeed
- [ ] 5.3 Remove unused scaffold assets from `src/assets/` (the Vite/React logos and the unused `hero.png`) after confirming no references; verify the build still resolves every asset
- [ ] 5.4 Move the footer year inside `RootLayout` so it is computed at render; verify a test renders the current year and the value is not a module constant
- [ ] 5.5 Update `README.md`: correct the stack/font sourcing, project tree (no `ui/`, new scripts, `.github`), lint description, AAA contrast, view-transition wording, and add the CI section
- [ ] 5.6 Add `.github/workflows/ci.yml` running frozen install, lint, format check, `tsc -b`, test, and build with `SNAPSHOT_SOURCE=snapshot`; verify the same commands pass locally

## 6. Integration verification

- [ ] 6.1 Run `pnpm exec tsc -b`, `pnpm lint`, `pnpm format:check`, and `pnpm test`
- [ ] 6.2 Run `pnpm build` and confirm the snapshot step, prerender, sitemap, and RSS all complete without network access
- [ ] 6.3 Confirm homepage ordering is newest-first, `/photography` still lists every set, and the RSS feed's 20 posts are newest-first
- [ ] 6.4 Confirm no route renders a blank page by triggering the error component once in dev

## Workflow follow-up

- Archive `clean-up-code-quality` after review, syncing the `content-adapter`, `content-snapshot`, `ssg-build`, `project-scaffold`, and `shadcn-base-ui` deltas into `openspec/specs/`.
- Verify the archived result with `openspec validate`.
