# photography-gallery Delta

## Purpose

Define the `/photography` index that renders every photo set as a masonry gallery, and the homepage preview that surfaces one featured photo per set.

## ADDED Requirements

### Requirement: Index lists every photo set

The `/photography` route SHALL load every photo set through `contentService.getPhotoSets()` and render one tile per set in service order, without pagination.

#### Scenario: Every set renders

- **WHEN** the content service returns N photo sets
- **THEN** the page renders N tiles in the same order the service returned them
- **AND** no pagination controls are shown

#### Scenario: Empty state

- **WHEN** the content service returns no photo sets
- **THEN** the page renders an explicit empty state instead of an empty grid

### Requirement: Set tiles link to the detail route

Each tile SHALL link to `/photography/<slug>` and SHALL render the set title, the cover image (or first image when no cover exists), and the `location` and `camera` metadata when present.

#### Scenario: Cover image is preferred

- **WHEN** a photo set has a `coverImage`
- **THEN** the tile renders that image with the set title as its `alt` text

#### Scenario: First image is the fallback

- **WHEN** a photo set has no `coverImage` but has images
- **THEN** the tile renders the first image in the set

#### Scenario: Missing images render a placeholder

- **WHEN** a photo set has no `coverImage` and no images
- **THEN** the tile renders a neutral aspect-ratio placeholder followed by the title and link

#### Scenario: Metadata line omits missing fields

- **WHEN** a photo set has `location`, `camera`, both, or neither
- **THEN** the tile renders the available parts joined by ` · ` and renders no metadata line when neither is set

### Requirement: Tiles participate in the photo view transition

Each tile's linked element SHALL declare `view-transition-name: photo-<slug>`, matching the name declared by the photo set detail cover.

#### Scenario: Names match the detail page

- **WHEN** the user navigates from a tile to its photo set detail
- **THEN** the tile and the detail cover share the same `view-transition-name`

#### Scenario: Names stay unique

- **WHEN** the index renders multiple sets
- **THEN** each tile uses its own set slug, so no two tiles share a name

### Requirement: Homepage preview renders featured photos

The homepage photography section SHALL render the image for each featured photo returned by `getFeaturedPhotos()`, using the set title as `alt` text, and SHALL keep the existing link and `photo-<slug>` transition name.

#### Scenario: Featured image renders

- **WHEN** a featured photo has a `src`
- **THEN** the tile renders an `<img>` with that source, the set title as `alt`, and lazy loading

#### Scenario: Tile still links to the set

- **WHEN** a featured photo has a `setSlug`
- **THEN** the tile links to `/photography/<setSlug>` and declares `view-transition-name: photo-<setSlug>`
