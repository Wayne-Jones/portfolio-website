# Paginated Listing

## Purpose

Define paginated list routes for blog posts and portfolio projects, including the URL scheme, page size, and enumeration at build time.

## Requirements

### Requirement: Page size is fixed

The page size for `/blog` and `/portfolio` listing pages SHALL be 12 items per page.

#### Scenario: Single page when content fits
- **WHEN** the content service reports fewer than 12 posts (or projects)
- **THEN** only one page (`/blog` or `/portfolio`) is generated; no `/blog/page/2` exists

#### Scenario: Multiple pages when content exceeds
- **WHEN** the content service reports more than 12 posts (or projects)
- **THEN** `/blog`, `/blog/page/2`, `/blog/page/3`, ... are generated up to `ceil(N / 12)`
- **AND** the final page may contain fewer than 12 items

### Requirement: URL scheme is `/<base>/page/N`

The paginated URLs SHALL follow `/blog/page/N` and `/portfolio/page/N`. Page 1 is `/blog` and `/portfolio` (no `/page/1`).

#### Scenario: Page 1 has no suffix
- **WHEN** the user navigates to the first page of `/blog`
- **THEN** the URL is `/blog` (not `/blog/page/1`)

#### Scenario: Subsequent pages have numeric suffix
- **WHEN** the user clicks "Next page" on `/blog`
- **THEN** the URL navigates to `/blog/page/2`, `/blog/page/3`, etc.

#### Scenario: Sitemap entries use the canonical URL
- **WHEN** the sitemap is generated at build time
- **THEN** each entry uses either `/blog` (page 1) or `/blog/page/N` (subsequent pages)

### Requirement: Pagination enumeration is build-time

The set of pagination pages SHALL be determined at build time by enumerating total content and applying the per-page limit. The SSG output SHALL contain one HTML file per concrete pagination page.

#### Scenario: Build emits concrete pages
- **WHEN** the build runs with N total posts and `pageSize = 12`
- **THEN** the output directory contains one HTML file per page from 1 to `ceil(N / 12)`

### Requirement: Listing pages render paginated content

A listing page SHALL render only the items for that page, not the full content list.

#### Scenario: Listing page renders correct slice
- **WHEN** the routing for `/blog/page/2` matches
- **THEN** the route loader calls a content service method (`getPosts({ page: 2, limit: 12 })` or equivalent)
- **AND** the listing UI renders items 13-24 (or whichever window corresponds to page 2)

#### Scenario: Page within range
- **WHEN** the user visits `/blog/page/2` for a blog with at least 24 posts
- **THEN** the page renders 12 items starting at the 13th post

#### Scenario: Page out of range returns 404
- **WHEN** the user visits `/blog/page/999` for a blog with fewer than 999*12 posts
- **THEN** the page renders the editorial 404 affordance

### Requirement: Pagination controls are visible

A listing page SHALL render "previous" and "next" navigation controls, plus numeric page indicators.

#### Scenario: First page has no previous
- **WHEN** the user is on `/blog` (page 1)
- **THEN** there's no visible "previous" link

#### Scenario: Middle pages have both controls
- **WHEN** the user is on `/blog/page/3` of a 5-page list
- **THEN** the controls renders links to `/blog/page/2` (previous) and `/blog/page/4` (next)

#### Scenario: Last page has no next
- **WHEN** the user is on the final page
- **THEN** there's no visible "next" link
