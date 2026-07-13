## Context

The portfolio has reached the point where content exists in canonical types and the renderer consumes them, but no route actually loads and renders them. The detail routes (`/blog/$slug`, `/portfolio/$slug`, `/photography/$slug`) are stubs from the project's scaffold. The listing routes (`/blog`, `/portfolio`, `/photography`) have comments saying "Will list..." but no implementations. Pagination and 404 handling are missing. The SSG pipeline knows how to enumerate paths but doesn't have a contract yet for receiving them.

This change is the moment the site becomes a real portfolio. With it:
- `/blog/<slug>` provides a real article-viewing experience.
- `/portfolio/<slug>` provides case-study layout tailored to web projects.
- `/photography/<slug>` lets visitors actually browse a photo set.
- Listings paginate, so the site scales as content grows.
- Sitemap and RSS feeds expose content to crawlers and subscribers.

The existing infrastructure (TanStack Router file-based routing, the ContentService interface, view transitions for the morph animation, the renderer's `<PostBody>`) is the substrate on which this is built. Almost no new framework code is introduced — this is mostly composition work.

## Goals / Non-Goals

**Goals:**
- Replace every placeholder detail route with a complete implementation that loads, renders, and lays out real content.
- Introduce the `/blog/page/N` and `/portfolio/page/N` URL scheme with concrete pre-rendered pages.
- Add a top-level 404 affordance for missing slugs.
- Generate a `sitemap.xml` and `rss.xml` at the end of every build, derived from the snapshot.
- Preserve the existing view-transition names (WorkTile/PhotoTile/BlogCard morph into detail pages) — the morph happens today between current placeholders and destination placeholders; this change makes sure it's still wired when those slots have content.
- Honor the existing content types' fields: tag chips appear when `tags[]` is present, the author byline appears when `author` is present, etc.

**Non-Goals:**
- Rewrite the homepage. The homepage already lists projects/photos/posts via featured subsets. This change only consumes detail routes and may extend listing pages.
- Implement comments or other reader interaction features.
- Implement search.
- Build for any CMS other than Ghost — the ContentService abstraction already exists.
- Image optimization beyond what the renderer already does for inline images. Hero-image fetchpriority and responsive sizes optimization are a separate concern (the `image-optimization` change).
- New theme tokens or typography changes — the article layout uses existing tokens.
- Full <head> management — TanStack Router's `Head` component is used minimally for `title` and `description` here; deeper SEO work (OG image per post, structured data, etc.) is out of scope.

## Decisions

### Decision 1: Route enumeration via `getStaticPaths` on each dynamic route file

**Rationale:** TanStack Router's file-based routing determines paths from filenames; static enumeration requires a separate hook at build time (`vite-react-ssg`'s `getStaticPaths` or `ssgOptions.includedRoutes`). Putting the enumeration in the route file keeps related logic colocated. The single aggregator in `vite.config.ts` calls `getStaticPaths()`-like exposure on each file in turn, in order:

```
  ssgOptions.includedRoutes = async (paths, routes) => {
    const posts = (await import('@/content/data/posts.json')).default;
    const projects = (await import('@/content/data/projects.json')).default;
    const photosets = (await import('@/content/data/photosets.json')).default;
    return [
      ...paths,
      ...posts.map(p => `/blog/${p.slug}`),
      ...projects.map(p => `/portfolio/${p.slug}`),
      ...photosets.map(p => `/photography/${p.slug}`),
      ...paginate('/blog', posts.length, PAGE_SIZE),
      ...paginate('/portfolio', projects.length, PAGE_SIZE),
    ];
  };
```

**Alternative considered:** Putting `getStaticPaths` directly on each route file as `export const getStaticPaths = ...`. Rejected because TanStack Router file-based routing doesn't have that hook (it's `vite-react-ssg`'s side); centralizing in `vite.config.ts` keeps the route files framework-pure.

### Decision 2: `/blog/page/N` URL scheme

**Rationale:** The scheme is `/blog`, `/blog/page/2`, `/blog/page/3`, ... up to the last page. Page 1 is `/blog` (no `/page/1`). 404 returns the editorial 404 page where appropriate.

For TanStack Router file-based routing, this means:
- `blog.tsx` — handles `/blog` (page 1)
- `blog.page.$page.tsx` — handles `/blog/page/2`, `/blog/page/3`, ...
- `blog.page.$page.tsx("layout")` not needed; each page is a complete route

This avoids query-string-based pagination (`?page=2`) and subdirectory-style (`/blog/2`) variants — `/blog/page/N` is the cleanest, most predictable scheme for both humans and crawlers.

**Alternative considered:** Cursor-based pagination for infinite-scroll friendliness. Rejected for now — pagination controls are simpler (<link rel="next"> / <link rel="prev"> work cleanly) and our content volume doesn't strain a fixed-pagination model.

### Decision 3: 12 items per page for `/blog` and `/portfolio`

**Rationale:** A balance between content density on screen and total paginated count. With 15-50 posts, `/blog` typically sits between 2 and 5 pages. Photography and listing-specific tuning can come later.

**Alternative considered:** A configurable per-listing page size. Deferred — the constant lives in `src/content/pagination.ts` so future tuning is a single-file edit.

### Decision 4: Article layout components in `src/components/article/`

**Rationale:** The article-layout code (header, byline, tags, footer with author/related) is distinct from the content-tree renderer. Separating into a `src/components/article/` folder keeps concerns independent:
- `src/components/content/` is the renderer (CMS-agnostic, walks `ContentTree`)
- `src/components/article/` is the layout (header/footer/byline around `<PostBody />`)

This split lets future changes iterate on article layout without touching the renderer.

### Decision 5: View transition naming remains in the leaf tiles, targets remain in detail routes

**Rationale:** The morph animations (tile → detail hero image) were established in the `homepage` change. Today they connect placeholder source → placeholder destination. This change must preserve the existing `viewTransitionName` strings on both ends:
- `WorkTile` source: `work-tile-<slug>`
- `PhotoTile` source: `photo-<slug>` (the slug is the photo set's slug)
- `BlogCard` source: `blog-<slug>`
- Detail hero image destination: same string

When `<PortfolioHero>`/`<BlogHero>`/`<PhotoSetHero>` mount, they apply the matching `viewTransitionName`. The morph remains intact and now morphs between content-bearing cards and content-bearing heroes.

### Decision 6: 404 via TanStack Router `notFoundComponent` export

**Rationale:** TanStack Router supports a per-route `notFoundComponent` option exported alongside the route. Detail routes export one that renders the editorial 404 page. Wildcards at the top of the route tree catch anything else.

**Alternative considered:** TanStack Router's `notFoundMode: "root"` option, which places a 404 boundary above the entire route tree. Rejected — gives the same UX but losing the per-route `notFoundComponent` weakens clarity about where missing data was checked.

### Decision 7: Sitemap + RSS generation in `onFinished`

**Rationale:** `vite-react-ssg` runs an `onFinished(dir)` callback after all routes are written. We use it to:
- Read the snapshot JSON files
- Build a `sitemap.xml` and write it to the build output directory
- Build an `rss.xml` (filtered to blog-tagged posts) and write it to the build output

The sitemap lists each static route, each blog slug, each portfolio slug, each photo set slug. RSS is a simple Atom-compatible XML feed with the 20 most recent post entries.

**Alternative considered:** A separate post-build step. Rejected — `onFinished` gives us single-command reproducibility.

## Risks / Trade-offs

- **[Risk] Layout work for 3 different route types** → Mitigation: share a single `<ArticleLayout>` wrapper that handles common cases (breadcrumbs, header, footer, max-width container); route-specific code is held loosely and only invoked at the per-route root.
- **[Risk] Sitemap can list stale URLs across builds** → Mitigation: sitemap is generated from the snapshot every build, never cached. Adding a `lastmod` element would require per-content timestamps in the snapshot; deferred unless Ghost provides this.
- **[Risk] RSS for blog content has no built-in author formatting** → Implementation uses `<author>` field from canonical `Post.author` when present.
- **[Risk] Pagination dynamic routes may not be tested in dev mode** → Mitigation: TanStack Router matches `/blog/page/2` as a normal dynamic route in dev; `getStaticPaths` only runs at build time, so dev mode handles these routes transparently.
- **[Risk] Detail page sizes can be large** → Each detail page is a full content tree render; the SSG HTML for a 5000-word post will be ~100-200 KB. Mitigation: the renderer defers CodeBlock images via lazy loading; Shiki highlighting is pre-computed at build.

## Migration Plan

1. **Phase A: Pagination utility** — `src/content/pagination.ts` exposes a `paginate(items, pageSize)` helper that builds path list and a resolver.
2. **Phase B: Article shell components** — `<ArticleLayout>`, `<ArticleHeader>`, `<ArticleMeta>`, `<TagChips>`, etc. Shared across detail routes.
3. **Phase C: Detail routes** — flesh out `blog.$slug.tsx`, `portfolio.$slug.tsx`, `photography.$slug.tsx`.
4. **Phase D: Pagination routes** — `blog.page.$page.tsx` and `portfolio.page.$page.tsx`.
5. **Phase E: 404** — top-level 404 component, wired into each route via `notFoundComponent`.
6. **Phase F: Build-config aggregation** — hook up `ssgOptions.includedRoutes` with all enumerations + pagination.
7. **Phase G: sitemap.xml + rss.xml** — `onFinished` callback.

Rollback: detail routes revert to placeholders; listing pages revert to "Coming soon"; sitemap/RSS files stop being generated. No data layer changes.

## Open Questions

- Pagination scheme for photography page — is `/photography` paginated, or is it a curated card grid with the entire grid pre-baked? Current draft: photography homepage grid is fixed (always the first 6 featured photos from the snapshot), full sets are reached via `/photography/$slug`. No pagination on the listing.
- Tag chip links — should tags be navigable (e.g., `/blog/tag/design`)? Current draft: out of scope, deferred.
- Edit-post links on the public site — currently an `href` to Ghost admin. Worth including for the author's convenience but not a dealbreaker if OOS.
