# Spec Delta

## ADDED Requirements

### Requirement: Collections are deterministically ordered

Every collection-returning method SHALL return items sorted newest-first by `publishedAt`, with `slug` and then `id` as stable tiebreakers, so output does not depend on Ghost response order or JSON file order.

#### Scenario: Newest item comes first

- **WHEN** `getPosts()`, `getProjects()`, or `getPhotoSets()` resolves a collection
- **THEN** the item with the latest `publishedAt` is first
- **AND** items with equal timestamps are ordered by `slug`, then `id`

#### Scenario: Ordering is stable across calls

- **WHEN** the same collection is requested twice
- **THEN** both results have identical order

#### Scenario: Recent subsets inherit the order

- **WHEN** `getRecentPosts(limit)` or `getRecentProjects(limit)` is called
- **THEN** it returns the first `limit` items of the corresponding sorted collection

### Requirement: Homepage content subsets

`ContentService` SHALL expose `getRecentProjects(limit)`, `getRecentPosts(limit)`, and `getFeaturedPhotos(limit)` for the homepage, and each SHALL be implemented consistently by every adapter.

#### Scenario: Recent projects are newest first

- **WHEN** `getRecentProjects(limit)` is called
- **THEN** at most `limit` projects are returned, newest first by `publishedAt`

#### Scenario: Recent posts are newest first

- **WHEN** `getRecentPosts(limit)` is called
- **THEN** at most `limit` posts are returned, newest first by `publishedAt`

#### Scenario: Featured photos are set-linked

- **WHEN** `getFeaturedPhotos(limit)` is called
- **THEN** it follows the set-linked contract in the Featured photos requirement

## MODIFIED Requirements

### Requirement: Static snapshot adapter implementation

The project SHALL implement a `StaticAdapter` class that conforms to `ContentService` and resolves each method by reading the corresponding JSON file from `src/content/data/`. The static adapter SHALL be available both at build time (consumed by the TanStack Start prerender pass) and during browser navigation when a pre-rendered JSON payload accompanies the page.

#### Scenario: Static adapter implements ContentService

- **WHEN** inspecting the `StaticAdapter` class
- **THEN** it implements every method defined in the `ContentService` interface

#### Scenario: Static adapter does not fetch at runtime

- **WHEN** any method of `StaticAdapter` is called from browser code
- **THEN** the method returns data parsed from the bundled JSON and does not perform `fetch` calls

#### Scenario: Featured subsets come from the snapshot

- **WHEN** `StaticAdapter.getRecentProjects(limit)` or `getRecentPosts(limit)` is called
- **THEN** the limit parameter trims the corresponding snapshot array after sorting by `publishedAt`, newest first
- **AND** `getFeaturedPhotos(limit)` follows the set-linked behavior required by the Featured photos requirement
