## Why

The portfolio has homepage composition, content types, view transitions, and a content adapter — but every detail route (blog post, project case study, photo set) is a placeholder stub. The SSG pipeline from `ssg-pipeline` knows how to enumerate per-slug paths, and the renderer from `content-format` knows how to render canonical content trees, but neither is wired into a route component. Without this wire-up, the site's "homepage of cards pointing to nowhere" UX never closes, and there's no value in actually deploying to Vercel.

This change wires detail routes to real content: blog posts render full bodies with the `<PostBody />` renderer, project pages get their case-study layout (role/client/year header + body + gallery), and photo set pages get a full-bleed image grid. Listing routes get pagination so the site scales beyond the homepage's "latest 4 / first 6 / first 3" window.

## What Changes

- Replace `blog.$slug.tsx` placeholder with a real implementation that:
  - Loads via TanStack Router loader → `contentService.getPost(slug)`
  - Lays out: feature image, title, eyebrow metadata (date + reading time + author), tag chips, then `<PostBody content={post.content} />`
  - Returns null/404 via TanStack's `notFoundComponent` when slug doesn't exist
- Replace `portfolio.$slug.tsx` placeholder with a real implementation that:
  - Loads via → `contentService.getProject(slug)`
  - Lays out: title, role/client/year header, eyebrow meta, then `<PostBody content={project.content} />`, then a `gallery` from `project.gallery[]`
- Add `photography.$slug.tsx`:
  - Loads via → `contentService.getPhotoSet(slug)`
  - Lays out: title, location + camera, then a full-bleed image grid from `photoSet.images[]`
- Update `blog.tsx` to be a paginated list at `/blog`:
  - Loader → `contentService.getPosts({ page, limit })`
  - Add a new dynamic route `blog.page.$page.tsx` for `/blog/page/2`, `/blog/page/3`, etc.
- Update `portfolio.tsx` to follow the same paginated pattern:
  - Add `portfolio.page.$page.tsx`
- Add a `notFound.tsx` (top-level 404) that handles missing slugs with editorial styling
- Wire `pnpm build`'s `ssgOptions.includedRoutes` to enumerate the slug list and the pagination envelopes from the snapshot
- Generate `sitemap.xml` and `rss.xml` in the `onFinished` hook of `vite.config.ts`'s `ssgOptions`

This change does **not** introduce Cloudinary-specific responsive variants (handled by `image-optimization`). The renderer emits Cloudinary `srcset` from `FigureImage` already, but full LCP/CLS polish on hero images on detail pages lands in `image-optimization`.

## Capabilities

### New Capabilities
- `blog-detail-route`: The `/blog/$slug` route that renders a single blog post with full body, header, and tag chips.
- `portfolio-detail-route`: The `/portfolio/$slug` route that renders a project case study.
- `photo-set-detail-route`: The `/photography/$slug` route that renders a photo set full image grid.
- `paginated-listing`: Pagination URL scheme (`/blog/page/N`, `/portfolio/page/N`) and route enumeration.

### Modified Capabilities
- None explicitly. This change consumes existing capabilities (ContentAdapter, View Transitions, Theme Tokens, Accessibility Foundation) without altering their requirements.

## Impact

- TanStack Router gets three new dynamic route files and the existing four homepage-route definitions are unchanged.
- New shared layout primitives in `src/components/article/` (e.g., `ArticleHeader`, `TagChips`, `ArticleLayout`) — kept separate from `src/components/content/` (rendering) so article-layout code and content-tree code stay decoupled.
- New 404 page at the top level (TanStack Router supports this via a `notFoundComponent` or a catch-all route file).
- New artifact-emitting code in `vite.config.ts`'s `onFinished` callback: sitemap.xml generation reads all slug paths from `src/content/data/*.json`, and RSS reads `posts.json` (filtered to blog-posts-only) and emits a feed.
- Static output grows by one HTML file per content item plus per pagination page (expected: ~30 files for 15-50 posts).
