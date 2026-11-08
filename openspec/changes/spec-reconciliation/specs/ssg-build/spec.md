# ssg-build Delta

## ADDED Requirements

### Requirement: Build emits sitemap and RSS feeds

The build SHALL write `sitemap.xml` and `rss.xml` into both `dist/` and `dist/client/` after prerendering completes. The sitemap SHALL list every static, detail, and paginated URL; the RSS 2.0 feed SHALL contain the 20 most recent posts.

#### Scenario: Feeds are written to both output directories

- **WHEN** `vite build` completes
- **THEN** `dist/sitemap.xml`, `dist/rss.xml`, `dist/client/sitemap.xml`, and `dist/client/rss.xml` exist

#### Scenario: Sitemap lists canonical URLs

- **WHEN** the sitemap is generated from the snapshot
- **THEN** it lists `/`, `/blog`, `/portfolio`, `/photography`, every blog, portfolio, and photo-set detail route, and every pagination page after page 1
- **AND** it never lists a `/page/1` variant

#### Scenario: RSS lists the most recent posts

- **WHEN** the snapshot contains more than 20 posts
- **THEN** `rss.xml` contains the 20 most recent by `publishedAt`, newest first
- **AND** each item includes title, link, permalink guid, UTC pubDate, and description
- **AND** items with an author include a `<dc:creator>` element

#### Scenario: Absolute URLs use the configured site origin

- **WHEN** the build resolves the site origin
- **THEN** `SITE_URL` wins when set, otherwise `VERCEL_PROJECT_PRODUCTION_URL` is used on Vercel, otherwise `https://waynejones.dev`
- **AND** trailing slashes are removed before routes are appended

## MODIFIED Requirements

### Requirement: Dynamic route paths are enumerable at build time

The project SHALL enable the prerender pass to discover which concrete paths correspond to dynamic route patterns by listing them in `prerender.pages` in `vite.config.ts`, derived from the snapshot JSON. Listing index routes SHALL also be enumerated.

#### Scenario: Dynamic routes declare paths

- **WHEN** inspecting the build configuration
- **THEN** `prerender.pages` contains a `blog/<slug>` entry for every post, a `portfolio/<slug>` entry for every project, and a `photography/<slug>` entry for every photo set in `src/content/data/*.json`
- **AND** it contains the `/blog`, `/portfolio`, and `/photography` index routes

#### Scenario: Multiple slugs produce multiple HTML files

- **WHEN** the snapshot contains N posts, M projects, and K photo sets
- **THEN** `dist/client/` contains N `blog/<slug>/index.html` files, M `portfolio/<slug>/index.html` files, and K `photography/<slug>/index.html` files
