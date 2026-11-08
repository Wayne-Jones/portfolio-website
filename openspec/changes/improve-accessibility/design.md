# Design

## Context

See `proposal.md` for motivation and the delta specs for required behaviour. Current state that shapes the approach:

- `WorkTile` renders only a gradient and an absolutely positioned metadata block, both at `opacity-0` until `group-hover`. It reads `Project.featureImage` nowhere, so the tile is an empty 4:3 box before hover.
- `PhotoTile` renders `TileMedia` with `photo.alt` and then repeats the same string in an overlay that only appears on hover. `PhotoSetTile` renders `alt={photoSet.title}` next to an `<h2>` with the same title inside the same link.
- All three detail routes pass `alt={title}` to `ArticleHeader`, which renders the image immediately before `<h1>{title}</h1>`.
- Homepage sections use `projects.length === 0` / `photos.length === 0` / `posts.length === 0` as the loading state, so the skeleton and the empty state are the same branch. `Section` has no busy or live handling.
- `BlogCard` and `WorkTile` hard-code `<h3>`, but `/blog` and `/portfolio` render them directly under the page `<h1>`.
- `ArticleLayout` breadcrumbs render only `Home` and the section link; the current page title is not in the trail, so there is nothing to mark `aria-current`.
- `ArticleMeta` wraps the author name in `<Link to="/blog" title="Posts by …">`; no author route exists.
- `button-variants.ts` includes `outline-none`, which suppresses the global `:focus-visible` rule from `globals.css`. The component is otherwise unused and is removed by the `clean-up-code-quality` change, so this change does not re-style it.
- `__root.tsx` has no route-change focus target (its `<main>` is not focusable) and no live region, although `accessibility-foundation` already requires both.
- Tests render markup with `react-dom/server` (`renderToStaticMarkup`) in a Node environment, so assertions are about produced HTML, not computed styles.

## Goals / Non-Goals

**Goals:**

- Make every interactive element usable and understandable with keyboard and screen reader.
- Remove duplicate announcements without hiding unique information.
- Keep the fixes local to shared components so all routes inherit them.
- Add markup-level tests that fail when the regressions return.

**Non-Goals:**

- Visual redesign of tiles, cards, or the contact section.
- Adding an author page or filtering `/blog` by author.
- Automated axe/Pa11y integration or adding a browser test dependency.
- Reworking the `content-renderer` node components beyond the hero images already in scope.
- Tag chips: they render as informational `<span>`s, not controls, so target-size rules do not apply.
- Colour contrast changes; the existing token palette already meets AAA.

## Decisions

### Use `group-focus-visible` alongside `group-hover` for tile overlays

Tailwind's `group-focus-visible:` variant maps to `:focus-visible` on the group (the tile link), which is exactly the keyboard case. Add `group-focus-visible:opacity-100` and the matching translate reset to `WorkTile` and `PhotoTile`. Keep the text in the DOM (no `hidden` or `aria-hidden` on the content itself) so screen readers can read it.

Alternative: `group-focus-within` requires a focusable descendant; the link is the group itself, so `focus-visible` is the correct trigger. Mouse clicks do not trigger `:focus-visible`, which avoids a sticky overlay after a click.

### Render project media through the existing `TileMedia`

Widen `TileMedia`'s `aspect` prop from `Photo["aspect"]` to the shared ratio union and use it for `WorkTile` with `src={project.featureImage}` and `alt=""` (the `<h3>` already names the tile). When the project has no image, `TileMedia` already renders a neutral placeholder. This avoids a second image pipeline and gives project tiles the same lazy loading and Cloudinary handling as photo tiles.

Alternative: add an `<img>` inside `WorkTile` directly. Rejected because it duplicates the placeholder and Cloudinary logic.

### Remove duplicate text at the source, not with `aria-hidden` everywhere

- `PhotoSetTile`: `alt=""`, title stays in the `<h2>`.
- Detail heroes: routes pass `alt: ""`; `ArticleHeader` is unchanged.
- `PhotoTile`: keep the descriptive `photo.alt` on the `<img>` and mark the visual caption overlay `aria-hidden="true"`. The caption is decorative repetition once the image carries the description.

Alternative: hide the image instead. Rejected because the image is the content; hiding it removes the only description when the caption is not descriptive.

### Make heading level a prop on shared cards

`BlogCard` and `WorkTile` accept `headingLevel?: 2 | 3`, defaulting to `3` (homepage sections under `<h2>`), and `BlogListing` / `PortfolioListing` pass `2`. This is a small, explicit API rather than CSS tricks or duplicate components.

Alternative: always use `<h2>`. Rejected because the homepage sections already establish `<h2>`, so cards would then skip a level under it.

### Distinguish loading from empty and put `aria-busy` on the section

Add `loading?: boolean` to `WorkPortfolio`, `Photography`, and `RecentPosts`. The Suspense fallbacks in `src/routes/index.tsx` pass `loading`; a resolved empty array renders an explicit "Nothing here yet" message instead of skeletons. `Section` accepts `loading` and emits `aria-busy="true"` plus a visually hidden `role="status"` message ("Loading selected projects…"); the skeleton grid is `aria-hidden="true"`. When the fallback unmounts, the busy section goes with it and the loaded section renders normally.

Alternative: track pending state in a stable wrapper. Rejected as unnecessary complexity for a static site where the fallback is already the loading representation.

### Route-level live region and a focusable main

Add a small `RouteAnnouncer` inside the root layout: it reads the current pathname with `useRouterState`, skips the first render, then focuses a `<main tabIndex={-1}>` and writes `document.title` into a persistent `role="status" aria-live="polite"` element. This implements the two existing `accessibility-foundation` requirements and also makes the skip link's `#main` target focusable.

Alternative: rely on `<title>` changes alone. Rejected because single-page navigation does not reliably announce title changes.

### Breadcrumb current item is a non-link

Add `current?: string` to `ArticleLayout` and render it as the final `<li>` with `<span aria-current="page">`. Detail routes pass their title. Keys use the item index because two crumbs can legitimately share a path. Separators keep `aria-hidden="true"`.

Alternative: derive the last crumb from the route. Rejected because `ArticleLayout` is presentational and already receives the data it needs.

## Risks / Trade-offs

- **Focusing `<main>` on every navigation can interrupt reading or scroll restoration** → Skip the initial render, run after the route commits, and use `preventScroll` on focus so the router's scroll restoration stays in control.
- **Live-region updates can be missed if the region mounts at the same time as the text** → Render the region persistently in the root layout and update only its text content after navigation.
- **`aria-busy` in a fallback that unmounts may not announce the loaded state** → The route announcer covers navigation; the section status covers pending state. Accept the small gap rather than adding a state machine to the static build.
- **44px targets increase header height and can crowd 320px screens** → Combine with the responsive change's wrapping rules; verify at 320px that the nav still fits and the document does not widen.
- **`group-focus-visible` may not fire for programmatic focus** → Tests should assert the class is present; manual verification covers real Tab behaviour.
- **Changing `PhotoSetTile` to `alt=""` loses alt text in RSS/social contexts** → Tiles are HTML-only; social previews use the route metadata, not the tile.
- **Heading-level props can be passed inconsistently** → Default to 3 (the homepage context) and add tests for both listings and the homepage.

## Migration Plan

1. Fix shared primitives first (`TileMedia`, `Section`, `ArticleLayout`, `ArticleMeta`, root announcer).
2. Update route call sites (hero `alt`, breadcrumb `current`, heading levels) and the three homepage sections' loading/empty split.
3. Add markup tests alongside each component group; then run the existing suite and a keyboard/screen-reader pass.
4. Rollback is a revert of the change; no data or API migration.
