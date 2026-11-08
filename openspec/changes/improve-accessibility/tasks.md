# Tasks

## 1. Keyboard-accessible tiles

- [x] 1.1 Add `group-focus-visible:opacity-100` and the translate reset to the overlay in `src/components/home/work-portfolio/WorkTile.tsx`; verify a markup test asserts both `group-hover` and `group-focus-visible` classes are present
- [x] 1.2 Render the project's `featureImage` in `WorkTile` through `TileMedia` (widening `TileMedia`'s `aspect` type to the shared ratio union), with `alt=""` and a placeholder when absent; verify a test renders an `<img>` when `featureImage` is set and a placeholder when it is not
- [x] 1.3 Add `group-focus-visible:opacity-100` to the caption overlay in `src/components/home/photography/PhotoTile.tsx` and mark that overlay `aria-hidden="true"`; verify a test asserts the overlay is hidden from AT and the image keeps `photo.alt`
- [x] 1.4 Change `PhotoSetTile` to render its cover with `alt=""`; verify a test asserts exactly one occurrence of the set title in the rendered markup

## 2. Heading outline and decorative content

- [x] 2.1 Add `headingLevel?: 2 | 3` (default `3`) to `BlogCard` and `WorkTile`, pass `2` from `BlogListing` and `PortfolioListing`; verify tests assert `<h3>` on the homepage sections and `<h2>` on `/blog` and `/portfolio`
- [x] 2.2 Change the contact call to action in `ContactFooter.tsx` from `<p>` to `<h2>` and keep the existing classes; verify the rendered markup contains `<h2` and the homepage still has exactly one `<h1>`
- [x] 2.3 Mark the decorative rule in `Section.tsx` `aria-hidden="true"` and wrap the hero emoji in an `aria-hidden` span while normalizing the greeting copy; verify a test asserts the rule is hidden and the greeting reads as plain text without the emoji
- [x] 2.4 Keep breadcrumb separators `aria-hidden="true"` and verify a test asserts each separator is hidden

## 3. Loading states and route announcements

- [x] 3.1 Add `loading?: boolean` to `WorkPortfolio`, `Photography`, and `RecentPosts`; render `aria-busy="true"` plus a visually hidden `role="status"` message and `aria-hidden` skeletons while loading, and an explicit empty message when resolved with no items
- [x] 3.2 Pass `loading` from the Suspense fallbacks in `src/routes/index.tsx`; verify tests cover the loading markup and the empty-but-resolved markup
- [x] 3.3 Add `tabIndex={-1}` to `<main>` in `src/routes/__root.tsx` so the skip link can move focus, and add a persistent visually hidden `role="status" aria-live="polite"` region
- [x] 3.4 Add a `RouteAnnouncer` that watches the pathname with `useRouterState`, skips the first render, focuses `<main>` with `preventScroll`, and writes `document.title` into the live region; verify by navigating with a screen reader and confirming one announcement per route change
- [x] 3.5 Confirm the skip link focuses `<main>` and that route changes do not steal focus on initial load

## 4. Target sizes and focus rings

- [x] 4.1 Give primary header links in `src/routes/__root.tsx` a minimum 44×44px interactive area without widening the document at 320px; verify with a browser measurement
- [x] 4.2 Raise `PaginationControls` link and current-page boxes to at least 44×44px while keeping the row from overlapping; verify with a browser measurement

## 5. Link semantics and breadcrumbs

- [x] 5.1 Render the author byline in `ArticleMeta.tsx` as plain text (keeping the optional avatar) since no author route exists; verify a test asserts the author name is not a link
- [x] 5.2 Add `current?: string` to `ArticleLayout`, render it as the final breadcrumb `<span aria-current="page">`, and use index-based keys; verify a test asserts `aria-current="page"` appears once and the current title is not a link
- [x] 5.3 Pass `current` from `blog.$slug.tsx`, `portfolio.$slug.tsx`, and `photography.$slug.tsx`; verify each detail page renders the title in the trail

## 6. Hero image alt text

- [x] 6.1 Change `blog.$slug.tsx`, `portfolio.$slug.tsx`, and `photography.$slug.tsx` to pass `alt: ""` for their hero images; verify tests assert each hero `<img>` has an empty `alt` and the `<h1>` remains the only source of the title

## 7. Integration verification

- [x] 7.1 Run `pnpm exec tsc -b`, `pnpm lint`, `pnpm format:check`, and `pnpm test`
- [x] 7.2 Keyboard pass: Tab through `/`, `/blog`, `/portfolio`, `/photography`, and one detail route; confirm skip link, visible focus rings, tile overlays on focus, and 44px targets
- [x] 7.3 Screen-reader pass: confirm one title announcement per page, no duplicate tile/hero announcements, loading status announced once, and the author byline is text
- [x] 7.4 Run `pnpm exec vite build` and inspect a prerendered detail page for `aria-current`, hero `alt=""`, and heading order

## Workflow follow-up

- Archive `improve-accessibility` after review, syncing the `accessibility-foundation`, `photography-gallery`, and three detail-route deltas into `openspec/specs/`.
- Verify the archived result with `openspec validate`.
