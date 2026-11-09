# Design

## Context

See `proposal.md` for motivation and the delta specs for required behaviour. Relevant current state:

- `StaticAdapter`, `MockAdapter`, and `GhostAdapter` each contain their own `getFeaturedPhotos` loop. The loops differ only in the phrase `cover !== undefined && cover !== ""` versus `cover ??`, so they have already drifted.
- `BlogListing` and `PortfolioListing` differ only in copy, the card component, and `basePath`; `PhotoSetTile` and `photography.$slug` contain the same `[location, camera].filter(...).join(" · ")`.
- `ContentService.getFeaturedProjects` returns `slice(0, limit)`; the Ghost schema parses `featured` but `mapBasePost` never maps it.
- Collection order comes from Ghost's response or JSON file order; `getRecentPosts` and `getRecentProjects` slice that order directly. `getFeaturedPhotos` iterates sets in the same implicit order.
- `vite.config.ts`'s `readSlugs` has an empty `catch` that returns `[]`, so an invalid snapshot silently emits no detail pages. `scripts/snapshot-content.ts` parses `.env` with `line.split("=")`.
- `src/router.tsx` has no `defaultErrorComponent`, so an uncaught render error leaves the React root empty.
- `useRevealRef` calls `useLayoutEffect`, which warns during the prerender pass. `Hero`'s parallax resolves `[data-slot='hero']` through `document.querySelector` once at mount and only checks the desktop media query once.
- `src/components/ui/{button,button-variants,card}.tsx` have no importers. `@base-ui/react` exists only for `button.tsx`; `lucide-react` is only referenced by `components.json`; `@fontsource-variable/inter` is unused because Inter is self-hosted from `src/assets/fonts/inter`. `zod` is imported only by the Ghost adapter, which is dev/build-only.
- `__root.tsx` computes `currentYear` at module scope. The README describes `hero.png` as the hero image, `pnpm lint` as schema validation, AA instead of AAA contrast, and no `ui/` deletion.
- There is no `.github/` directory.

## Goals / Non-Goals

**Goals:**

- Remove duplicated logic where the copies have already diverged.
- Make ordering and failure modes explicit and testable.
- Delete code and dependencies that nothing uses.
- Put the existing quality gates into CI so they cannot rot.

**Non-Goals:**

- Changing page content, routes, or canonical data shapes.
- Adding a new linting/analysis tool (no Knip, ESLint, or dependency-cruiser).
- A redraw of the README as marketing copy; only correcting what is wrong.
- Reworking the Ghost adapter beyond the ordering helper, the unused field, and the method rename.
- Replacing the custom router or moving away from TanStack Start.

## Decisions

### One featured-photo projection, one sort helper

Add `src/content/featured.ts` exporting `buildFeaturedPhotos(sets, limit)` and `src/content/sort.ts` exporting `sortByPublishedAtDesc`. Each adapter caches or returns arrays already passed through the sort helper, then calls the shared projection. `getFeaturedPhotos` now iterates an explicitly sorted set list, so the homepage preview order is independent of JSON order.

Alternative: a base adapter class with shared methods. Rejected because the adapters differ in data access (static imports vs `fetch`), and inheritance would couple them more than a pair of pure helpers.

### Rename `getFeaturedProjects` to `getRecentProjects`

The homepage wants the four newest projects, not a curated flag. `getRecentProjects` matches `getRecentPosts`, removes the false implication, and lets us delete the unused `featured` field from the Ghost schema. Update `ContentService`, all three adapters, the lazy Ghost proxy, the homepage loader, tests, and the `content-adapter` spec. `getFeaturedPhotos` keeps its name because it genuinely means "one representative photo per set".

Alternative: map Ghost's `featured` flag into the canonical `Project` and filter by it. Rejected because snapshots may contain zero featured projects, which would empty the homepage section, and the current design treats homepage projects as "most recent".

### Align ordering at both boundaries

Sort in the adapters (so any consumer sees stable order) and in `writeSnapshot` (so the committed file is stable even if a future adapter forgets). Timestamps are ISO strings, so lexicographic comparison equals chronological for the expected format; the helper falls back to `Date.parse` if the strings are not comparable, and finally to `slug`/`id`.

Alternative: sort only in the UI. Rejected because feeds, sitemap generation, and tests also read the collections.

### Shared listing shell and metadata helper

Create `src/components/article/ListingPage.tsx` owning the header, grid wrapper, empty message, and pagination. `BlogListing` and `PortfolioListing` become small components that map their items into cards. Create `src/lib/meta.ts` with `joinMetadata(parts)` that filters `undefined`/empty and joins with ` · `; use it in `PhotoSetTile` and `photography.$slug`. Portfolio's role/client/year row keeps its em-dash placeholders but moves into a named function beside `joinMetadata`.

Alternative: merge the two listings into one route-level component. Rejected because they are different routes with different content types and copy; a shared presentational shell is the smaller change.

### Router-level error component

Set `defaultErrorComponent: RouteError` in `src/router.tsx`. `RouteError` renders inside the root layout, so the header/footer remain, shows the error message, a "Try again" button wired to the router's `reset`, and a home link. This covers loader and render failures for every route without adding an `errorComponent` to each file.

Alternative: per-route `errorComponent` exports. Rejected as repetitive and easy to forget on new routes.

### Isomorphic layout effect for reveal

Add `src/lib/use-isomorphic-layout-effect.ts` (`typeof window === "undefined" ? useEffect : useLayoutEffect`) and use it in `useRevealRef`. The client still measures before paint (no flash of revealed content), while the server render no longer triggers the React warning.

Alternative: switch to `useEffect` unconditionally. Rejected because the reveal measurement happens after paint, which can flash content that should start hidden.

### Parallax binds to a section ref and reacts to breakpoint changes

Add a `ref` to the hero `<section>` and pass it into `useParallaxScroll`. The effect attaches a `change` listener to the desktop and reduced-motion media queries, adds the scroll listener only while desktop and motion is allowed, and cleans up both on change and unmount. No `document.querySelector`, no one-shot decision.

Alternative: CSS `animation-timeline: scroll()` with `@supports`. Rejected as progressive enhancement that would still need a JS fallback for Safari; the ref-based listener is small and already works.

### Extract slug reading and make failures loud

Move `readSlugs` into `scripts/read-slugs.ts`. Use `existsSync` to return `[]` only for a missing file; let `JSON.parse` errors and non-array roots throw an `Error` that names the file and the expected shape. `vite.config.ts` imports it. Tests use temporary directories to cover missing, malformed, and wrong-shape files.

Alternative: catch and `console.warn` then continue. Rejected because a malformed snapshot already produced a silently empty site once; failing the build is the point.

### Use Node's `parseEnv` behind a small loader

Move `.env` loading into `scripts/load-env.ts`. Read the file once, validate each non-comment line has a key and `=`, call `parseEnv` from `node:util` for quoting/escape/CRLF handling, then assign only keys that are absent from `process.env`. Wrap parse errors with context. This removes the `split("=")` bug without adding a dotenv dependency.

Alternative: add `dotenv` as a devDependency. Rejected because Node already ships an equivalent parser.

### Delete the unused UI layer and its dependencies

Remove `src/components/ui/{button,button-variants,card}.tsx`, then remove `@base-ui/react`, `lucide-react`, and `@fontsource-variable/inter` from `package.json`. Keep `components.json` so a future `shadcn add` works and installs the primitive it needs. Move `zod` to `devDependencies` because only the dev/build-only Ghost adapter imports it.

Alternative: keep the components "for later". Rejected because unused code is exactly what the audit is removing; git history preserves it.

### Compute the footer year at render

Move `new Date().getFullYear()` inside `RootLayout`. The prerendered and hydrating renders happen within the same year in practice; the point is to stop freezing the value in a module that a long-running dev server keeps alive.

### CI mirrors local scripts

Add `.github/workflows/ci.yml` using `pnpm/action-setup`, `actions/setup-node` with the pnpm cache, and `pnpm install --frozen-lockfile`. Run `pnpm lint`, `pnpm format:check`, `pnpm exec tsc -b`, `pnpm test`, and `pnpm build` with `SNAPSHOT_SOURCE=snapshot` so CI never reaches for Ghost. Pin Node 24 to match the deployment runtime.

Alternative: a single `pnpm verify` script. Nice, but adding it is optional; the workflow can call the existing scripts, which the spec requires.

## Risks / Trade-offs

- **Renaming a public interface method touches many files and archived specs** → Grep for `getFeaturedProjects` and update every live reference; archived changes stay untouched by design.
- **Sorting changes the homepage tile order the first time it runs** → Expected and desired; verify the four newest projects and six sets look reasonable before committing.
- **`zod` in devDependencies can break a production-only install** → Vercel and standard CI install dev dependencies for builds; add `engines.node` and document that `pnpm install --prod` is not a supported build path.
- **Router `reset` does not recover loader failures in every TanStack version** → Always render a home link alongside retry; test with a deliberately throwing route in dev.
- **`parseEnv` behaviour on malformed lines varies by Node version** → Pre-validate the key/value shape in the loader and add tests for the exact formats the requirement lists; pin Node 24 in CI.
- **Deleting `src/components/ui/` means the next shadcn component re-installs `@base-ui/react`** → That is the intended on-demand behaviour; `components.json` is untouched.
- **`useIsomorphicLayoutEffect` still runs after hydration on the server-rendered markup** → The existing reveal CSS already hides `[data-reveal]` only after the effect adds the attribute; verify no flash at 320px and on a throttled load.

## Migration Plan

1. Land the content-layer helpers, sort, and rename together; run the content tests before touching UI.
2. Replace the listing/metadata duplicates and add the router error component.
3. Fix the hero/reveal hooks, then the build scripts (`read-slugs`, `load-env`) with their tests.
4. Delete the UI layer and dependencies, move `zod`, update the footer and README, and add CI.
5. Rollback is a revert of the change; the snapshot JSON stays byte-identical apart from the intended ordering.
