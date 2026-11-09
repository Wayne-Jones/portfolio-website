## Why

Keyboard and screen-reader users cannot reach or understand several parts of the site:

- Homepage and listing tiles hide their only visible text behind `group-hover`; tabbing to a tile leaves a blank box with no focus reveal.
- Photo tiles announce the same text twice (image `alt` plus an overlay caption), and photo-set tiles repeat the title in both `alt` and the adjacent heading.
- Every article hero repeats the page title as its `alt`, so screen readers hear the `<h1>` twice.
- Loading skeletons have no `aria-busy` or live status, so assistive tech reports an empty section while content is pending.
- The contact call to action is a `<p>`, listing cards skip from `<h1>` to `<h3>`, and the decorative rule above section titles is exposed as a separator.
- Primary navigation, pagination controls, and other interactive targets fall below a comfortable touch size.
- The author byline links to `/blog` even though no author page exists, and the hero emoji is read aloud as "waving hand".

These are WCAG 2.2 AA regressions in a site whose `accessibility-foundation` spec already claims AA compliance, so they should be fixed together.

## What Changes

- Reveal tile overlays on keyboard focus as well as hover, keep their text in the accessibility tree, and give project tiles a media frame (feature image or neutral placeholder) so they are never empty boxes.
- Stop duplicate announcements: remove `alt`/caption overlap, set decorative hero images to `alt=""`, and hide the visible caption overlay from assistive tech when the image already carries the same description.
- Give the page a valid heading outline: exactly one `<h1>`, headings without skipped levels on listing pages, and a real heading for the contact call to action.
- Announce loading: Suspense fallbacks set `aria-busy`, expose a visually hidden status message, and mark skeleton shapes `aria-hidden`.
- Hide decorative content from assistive tech: the section rule, the hero emoji, and separators between breadcrumb items.
- Raise interactive target sizes to at least 44×44 CSS pixels for primary navigation and pagination.
- Fix link semantics: the author byline is plain text unless a dedicated author route exists, breadcrumbs mark the current page, and keys are stable.
- Complete the already-specified route focus management and route-change announcement, including making `<main>` focusable for the skip link.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `accessibility-foundation`: add keyboard parity for hover content, target-size, heading-outline, loading-state, decorative-content, and breadcrumb requirements; tighten the visible-focus and alt-text requirements.
- `photography-gallery`: stop duplicated tile announcements and reveal the homepage photo caption on focus, not only hover.
- `blog-detail-route`: make the hero image decorative when the title follows as `<h1>` and stop linking the author byline to the unfiltered blog index.
- `portfolio-detail-route`: make the project hero image decorative when the title follows as `<h1>`.
- `photo-set-detail-route`: make the cover image decorative when the title follows as `<h1>`.

## Impact

- `src/routes/__root.tsx` (skip-link target, nav targets, route focus/announcement)
- `src/components/home/work-portfolio/WorkTile.tsx`, `src/components/home/photography/PhotoTile.tsx`, `src/components/photography/PhotoSetTile.tsx`
- `src/components/photography/TileMedia.tsx`, `src/components/content/nodes/FigureImage.tsx`
- `src/components/article/{ArticleHeader,ArticleLayout,ArticleMeta,BlogListing,PortfolioListing,PaginationControls}.tsx`
- `src/components/home/{blog/BlogCard,blog/RecentPosts,work-portfolio/WorkPortfolio,photography/Photography,shared/Section,contact-footer/ContactFooter,hero/Hero}.tsx`
- `src/routes/blog.$slug.tsx`, `src/routes/portfolio.$slug.tsx`, `src/routes/photography.$slug.tsx`
- Component tests for alt text, heading levels, focus reveal classes, loading state, and link destinations
- No data-model or dependency changes
