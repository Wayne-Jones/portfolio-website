## 1. Pagination Utility

- [x] 1.1 Create `src/content/pagination.ts` exporting `paginate(totalCount, pageSize)` returning `{ pageCount, lastPage }`, and `resolvePage(items, page, pageSize)` returning the appropriate slice
- [x] 1.2 Add `pageSize` constant (default 12) co-located with the pagination utility
- [x] 1.3 Add helper to enumerate pagination paths for the `vite.config.ts` prerender list

## 2. Article Layout Primitives

- [x] 2.1 Create `src/components/article/ArticleLayout.tsx` — common wrapper that holds max-width container, breadcrumbs, header, body slot, footer slots
- [x] 2.2 Create `src/components/article/ArticleHeader.tsx` — title, eyebrow metadata, feature image slot
- [x] 2.3 Create `src/components/article/ArticleMeta.tsx` — date, reading time, author byline
- [x] 2.4 Create `src/components/article/TagChips.tsx` — array of tag pills with muted styling
- [x] 2.5 Create `src/components/article/NotFound.tsx` — editorial 404 affordance with link back to homepage
- [x] 2.6 Ensure each article primitive stays below the folder boundary and reuses the theme tokens already in use

## 3. Blog Detail Route

- [x] 3.1 Replace `src/routes/blog.$slug.tsx` placeholder with full implementation: loader → `contentService.getPost(slug)`, render header + body
- [x] 3.2 Wire the loader through `Route.useLoaderData()` and pass the post data to `ArticleLayout.Post`
- [x] 3.3 `throw notFound()` when the loaded post is `null`, and set `notFoundComponent` to render `NotFound`
- [x] 3.4 Use `viewTransitionName: "blog-<slug>"` on the hero image
- [x] 3.5 Set `<title>` and meta description via TanStack Router's `Head` export

## 4. Portfolio Detail Route

- [x] 4.1 Replace `src/routes/portfolio.$slug.tsx` placeholder with full implementation: loader → `contentService.getProject(slug)`, render header + body + gallery
- [x] 4.2 Project metadata (role, client, year) renders as a single-line string
- [x] 4.3 Use `viewTransitionName: "work-tile-<slug>"` on the hero image
- [x] 4.4 Set `<title>` and meta description
- [x] 4.5 When `project.gallery` is non-empty, render `<Gallery>` with masonry layout

## 5. Photo Set Detail Route

- [x] 5.1 Create `src/routes/photography.$slug.tsx` (new file) with loader → `contentService.getPhotoSet(slug)`
- [x] 5.2 Render title, location, camera, cover image, then a full-bleed image grid using `FigureImage` per image
- [x] 5.3 Use `viewTransitionName: "photo-<slug>"` on the cover image
- [x] 5.4 `throw notFound()` when the loaded set is `null`, and set `notFoundComponent` to render `NotFound`
- [x] 5.5 Set `<title>` and meta description

## 6. Pagination Routes

- [x] 6.1 `blog.tsx` is a layout route (`<Outlet />`); `blog.index.tsx` is the page-1 listing: loader → `contentService.getPosts()` sliced with `resolvePage(posts, 1)`, render list of blog cards
- [x] 6.2 Create `src/routes/blog.page.$page.tsx` — dynamic page route reading `Route.useParams().page`
- [x] 6.3 Loader rejects non-numeric/zero pages with `notFound()`, redirects `page === 1` to `/blog`, and `notFound()`s pages beyond `pageCount`
- [x] 6.4 Same pattern for `src/routes/portfolio.tsx` (layout) + `portfolio.index.tsx` (page 1) and `src/routes/portfolio.page.$page.tsx`
- [x] 6.5 Add `<PaginationControls>` primitive (in `src/components/article/`) rendering prev/next and numeric indicators

## 7. Build Configuration Aggregation

- [x] 7.1 Update `vite.config.ts`'s `tanstackStart({ prerender: { pages } })` enumeration to:
  - Read snapshot JSON files
  - Concatenate paths for `/blog/<slug>`, `/portfolio/<slug>`, `/photography/<slug>` from posts/projects/photosets
  - Concatenate pagination paths `/blog/page/N`, `/portfolio/page/N`
- [x] 7.2 Run `pnpm exec vite build` and verify the output contains HTML for every enumerated detail route (pagination pages are absent only because the snapshot fits on one page)

## 8. Sitemap and RSS

- [x] 8.1 Add a `sitemap.xml` generator (`scripts/generate-feeds.ts`) reading all paths (static + dynamic + pagination) and emitting the file from the `buildApp` Vite plugin into `dist/client/` and `dist/`
- [x] 8.2 Add an `rss.xml` generator reading the 20 most recent posts from the snapshot and emitting an RSS 2.0 feed (author as `<dc:creator>`) from the same plugin
- [x] 8.3 Verified `sitemap.xml` and `rss.xml` in both `dist/` and `dist/client/` after `vite build`

## 9. Verification

- [x] 9.1 Run `pnpm dev` and click through homepage → blog card → blog post: confirm full body renders
- [x] 9.2 Run `pnpm dev` and click through homepage → work tile → portfolio page: confirm case-study layout
- [ ] 9.3 Run `pnpm dev` and click through homepage → photo tile → photo set: confirm full image grid — blocked: committed `photosets.json` has empty `images[]`/no cover, so the homepage renders skeletons; tile hrefs and `photo-<slug>` names are type-checked, the `/photography/$slug` grid renders in the build
- [ ] 9.4 Run `pnpm dev` and navigate to `/blog/page/2`: confirm only blog-tagged posts are listed and pagination controls work — blocked: snapshot has 3 posts with `pageSize = 12`, so page 2 does not exist; covered by `pagination` unit tests
- [x] 9.5 Run `pnpm dev` and navigate to `/blog/this-does-not-exist`: confirmed `NotFound` component with HTTP 404 status (also `/blog/page/99` → 404, `/blog/page/1` → 307 to `/blog`)
- [x] 9.6 Run `pnpm exec vite build` and verified `dist/client/blog/<slug>/index.html` for every snapshot slug (plus portfolio and photography detail pages)
- [ ] 9.7 Run `pnpm build` and verify `dist/client/blog/page/2/index.html` exists when pagination requires a second page — blocked: snapshot has 3 posts with `pageSize = 12`; covered by `pagination` unit tests
- [x] 9.8 Verified `sitemap.xml` and `rss.xml` exist in the build output and enumerate the static, detail, and feed entries
- [x] 9.9 Ran `pnpm preview` against the build output and confirmed `/`, listings, detail pages, `sitemap.xml`, and `rss.xml` all serve prerendered HTML
- [x] 9.10 `pnpm lint`, `pnpm format:check`, `pnpm test` (64 passing), `pnpm exec tsc -b`, and `pnpm exec vite build` all clean

## 10. Documentation

- [x] 10.1 Document the pagination URL scheme in README (`/blog/page/N`)
- [x] 10.2 Document the 404 affordance and its context (what gets caught)
- [x] 10.3 Document the sitemap.xml and rss.xml artifacts and how they're generated
