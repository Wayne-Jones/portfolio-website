## 1. Pagination Utility

- [ ] 1.1 Create `src/content/pagination.ts` exporting `paginate(totalCount, pageSize)` returning `{ pageCount, lastPage }`, and `resolvePage(items, page, pageSize)` returning the appropriate slice
- [ ] 1.2 Add `pageSize` constant (default 12) co-located with the pagination utility
- [ ] 1.3 Add helper to enumerate pagination paths for `ssgOptions.includedRoutes`

## 2. Article Layout Primitives

- [ ] 2.1 Create `src/components/article/ArticleLayout.tsx` — common wrapper that holds max-width container, breadcrumbs, header, body slot, footer slots
- [ ] 2.2 Create `src/components/article/ArticleHeader.tsx` — title, eyebrow metadata, feature image slot
- [ ] 2.3 Create `src/components/article/ArticleMeta.tsx` — date, reading time, author byline
- [ ] 2.4 Create `src/components/article/TagChips.tsx` — array of tag pills with muted styling
- [ ] 2.5 Create `src/components/article/NotFound.tsx` — editorial 404 affordance with link back to homepage
- [ ] 2.6 Ensure each article primitive stays below the folder boundary and reuses the theme tokens already in use

## 3. Blog Detail Route

- [ ] 3.1 Replace `src/routes/blog.$slug.tsx` placeholder with full implementation: loader → `contentService.getPost(slug)`, render header + body
- [ ] 3.2 Wire the loader through `Route.useLoaderData()` and pass the post data to `ArticleLayout.Post`
- [ ] 3.3 Set `notFoundComponent` for the route to render `NotFound` when loader returns null
- [ ] 3.4 Use `viewTransitionName: "blog-<slug>"` on the hero image
- [ ] 3.5 Set `<title>` and meta description via TanStack Router's `Head` export

## 4. Portfolio Detail Route

- [ ] 4.1 Replace `src/routes/portfolio.$slug.tsx` placeholder with full implementation: loader → `contentService.getProject(slug)`, render header + body + gallery
- [ ] 4.2 Project metadata (role, client, year) renders as a single-line string
- [ ] 4.3 Use `viewTransitionName: "work-tile-<slug>"` on the hero image
- [ ] 4.4 Set `<title>` and meta description
- [ ] 4.5 When `project.gallery` is non-empty, render `<Gallery>` with masonry layout

## 5. Photo Set Detail Route

- [ ] 5.1 Create `src/routes/photography.$slug.tsx` (new file) with loader → `contentService.getPhotoSet(slug)`
- [ ] 5.2 Render title, location, camera, cover image, then a full-bleed image grid using `FigureImage` per image
- [ ] 5.3 Use `viewTransitionName: "photo-<slug>"` on the cover image
- [ ] 5.4 Set `notFoundComponent` for the route to render `NotFound` when loader returns null
- [ ] 5.5 Set `<title>` and meta description

## 6. Pagination Routes

- [ ] 6.1 Update `src/routes/blog.tsx` and `blog.index.tsx` to be the page-1 listing implementation: loader → `getPosts({ page: 1, limit: 12 })`, render list of blog cards
- [ ] 6.2 Create `src/routes/blog.page.$page.tsx` — dynamic page route reading `Route.useParams().page`
- [ ] 6.3 Loader validates `page >= 1` and resolves `getPosts({ page, limit: 12 })`; null/empty returns `NotFound`
- [ ] 6.4 Same pattern for `src/routes/portfolio.tsx` (page 1) and `src/routes/portfolio.page.$page.tsx`
- [ ] 6.5 Add `<PaginationControls>` primitive (in `src/components/article/`) rendering prev/next and numeric indicators

## 7. Build Configuration Aggregation

- [ ] 7.1 Update `vite.config.ts`'s `ssgOptions.includedRoutes` to:
  - Read snapshot JSON files
  - Concatenate paths for `/blog/<slug>`, `/portfolio/<slug>`, `/photography/<slug>` from posts/projects/photosets
  - Concatenate pagination paths `/blog/page/N`, `/portfolio/page/N`
- [ ] 7.2 Run `pnpm build` and verify the output contains HTML for every enumerated path

## 8. Sitemap and RSS

- [ ] 8.1 Add a `sitemap.xml` generator reading all paths (static + dynamic + pagination) and emitting the file to `dist/sitemap.xml` in `onFinished`
- [ ] 8.2 Add an `rss.xml` generator reading blog posts from the snapshot (filtered to blog-tagged) and emitting the file to `dist/rss.xml` in `onFinished`
- [ ] 8.3 Verify both files appear in `dist/` after `pnpm build`

## 9. Verification

- [ ] 9.1 Run `pnpm dev` and click through homepage → blog card → blog post: confirm full body renders
- [ ] 9.2 Run `pnpm dev` and click through homepage → work tile → portfolio page: confirm case-study layout
- [ ] 9.3 Run `pnpm dev` and click through homepage → photo tile → photo set: confirm full image grid
- [ ] 9.4 Run `pnpm dev` and navigate to `/blog/page/2`: confirm only blog-tagged posts are listed and pagination controls work
- [ ] 9.5 Run `pnpm dev` and navigate to `/blog/this-does-not-exist`: confirm `NotFound` component
- [ ] 9.6 Run `pnpm build` and verify `dist/blog/<slug>/index.html` files exist for every slug in the snapshot
- [ ] 9.7 Run `pnpm build` and verify `dist/blog/page/2/index.html` exists when pagination requires a second page
- [ ] 9.8 Run `pnpm build` and verify `dist/sitemap.xml` and `dist/rss.xml` exist and contain the expected entries
- [ ] 9.9 Run `pnpm preview` against `dist/` and confirm full pages render from pre-built HTML only
- [ ] 9.10 Run `pnpm lint` and `pnpm build` clean

## 10. Documentation

- [ ] 10.1 Document the pagination URL scheme in README (`/blog/page/N`)
- [ ] 10.2 Document the 404 affordance and its context (what gets caught)
- [ ] 10.3 Document the sitemap.xml and rss.xml artifacts and how they're generated
