# content-adapter Delta

## ADDED Requirements

### Requirement: Featured photos are set-linked

`getFeaturedPhotos(limit)` SHALL return at most one `Photo` per photo set, using the set's `coverImage` when present and otherwise its first image. Each returned photo SHALL carry the owning set's slug in `setSlug`, and sets with no usable image SHALL be skipped.

#### Scenario: Cover image wins

- **WHEN** a photo set has a `coverImage`
- **THEN** the featured photo's `src` is the cover image
- **AND** its `setSlug` is the set's slug

#### Scenario: First image is the fallback

- **WHEN** a photo set has no `coverImage` but has images
- **THEN** the featured photo's `src` is the first image in the set

#### Scenario: Empty sets are skipped

- **WHEN** a photo set has no `coverImage` and an empty `images` array
- **THEN** it contributes no featured photo

#### Scenario: Limit caps the result

- **WHEN** `getFeaturedPhotos(limit)` is called
- **THEN** at most `limit` photos are returned, one per set

## MODIFIED Requirements

### Requirement: Canonical content types

The project SHALL define canonical `Post`, `Project`, `PhotoSet`, and `Photo` types that are CMS-agnostic and do not reference Ghost-specific field names.

#### Scenario: Post type is CMS-agnostic

- **WHEN** inspecting the `Post` type
- **THEN** it uses `featureImage` (not `feature_image`), `publishedAt` (not `published_at`), and `content` typed as `ContentTree` (not Ghost-specific `html` string or `mobiledoc`)

#### Scenario: Project type includes project-specific fields

- **WHEN** inspecting the `Project` type
- **THEN** it includes optional fields for `role`, `client`, `year`, and `gallery`

#### Scenario: PhotoSet type includes photography-specific fields

- **WHEN** inspecting the `PhotoSet` type
- **THEN** it includes `images` (string array), `coverImage`, and optional fields for `location` and `camera`

#### Scenario: Photo type links featured photos to their set

- **WHEN** inspecting the `Photo` display type
- **THEN** it includes `src`, `alt`, and `aspect`
- **AND** it includes an optional `setSlug` so homepage tiles can link to `/photography/<setSlug>`

### Requirement: Static snapshot adapter implementation

The project SHALL implement a `StaticAdapter` class that conforms to `ContentService` and resolves each method by reading the corresponding JSON file from `src/content/data/`. The static adapter SHALL be available both at build time (consumed by the TanStack Start prerender pass) and during browser navigation when a pre-rendered JSON payload accompanies the page.

#### Scenario: Static adapter implements ContentService

- **WHEN** inspecting the `StaticAdapter` class
- **THEN** it implements every method defined in the `ContentService` interface

#### Scenario: Static adapter does not fetch at runtime

- **WHEN** any method of `StaticAdapter` is called from browser code
- **THEN** the method returns data parsed from the bundled JSON and does not perform `fetch` calls

#### Scenario: Featured subsets come from the snapshot

- **WHEN** `StaticAdapter.getFeaturedProjects(limit)` or `getRecentPosts(limit)` is called
- **THEN** the limit parameter trims the corresponding snapshot array
- **AND** `getFeaturedPhotos(limit)` follows the set-linked behavior required by the Featured photos requirement
