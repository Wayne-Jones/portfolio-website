# Photo Set Detail Route

## Purpose

Define the `/photography/$slug` route that loads and renders a single photo set with a full-bleed image grid.

## Requirements

### Requirement: Page loads the photo set by slug

The `/photography/$slug` route SHALL load the photo set corresponding to the route's slug parameter via the content service, returning a 404 affordance when the slug is unknown.

#### Scenario: Loader resolves photo set
- **WHEN** a user navigates to `/photography/<slug>` for a valid slug
- **THEN** the loader resolves the photo set via `contentService.getPhotoSet(<slug>)`
- **AND** the photo set renders in a full-bleed image grid

#### Scenario: Missing photo set returns 404
- **WHEN** the user navigates to `/photography/<slug>` for an unknown slug
- **THEN** the loader returns null and the route renders the editorial 404 affordance

### Requirement: Header renders photo set metadata

The photo set detail page SHALL render: title, location, camera, publish date, and optional cover image. The body of the photo set's `content` field renders via `<PostBody />` if present.

#### Scenario: Header renders title and metadata
- **WHEN** the loaded photo set has `title`, `location`, `camera`, `publishedAt`
- **THEN** the header renders title and a metadata line containing location and camera

#### Scenario: Cover image renders
- **WHEN** the loaded photo set has `coverImage`
- **THEN** the cover image is rendered above the image grid with `FigureImage`-style Cloudinary optimization

### Requirement: Image grid renders all images in the set

The photo set detail page SHALL render all images in `photoSet.images[]` in a full-bleed masonry layout.

#### Scenario: All images render
- **WHEN** the loaded photo set has `images: string[]` with N images
- **THEN** N images are rendered in the image grid in source order
- **AND** each image uses `FigureImage` so lazy-loading and Cloudinary `srcset` apply

#### Scenario: Empty photo set
- **WHEN** the loaded photo set has `images: []`
- **THEN** the page renders the header but no image grid

### Requirement: View transition naming ties tile to cover

The photo set cover image SHALL declare `viewTransitionName: "photo-<slug>"` so the morph animation between `PhotoTile` on the homepage and this detail page fires automatically.

#### Scenario: Cover declares matching transition name
- **WHEN** the photo set detail page mounts at `/photography/<slug>`
- **THEN** the cover image has inline style `viewTransitionName: "photo-<slug>"`
- **AND** the `PhotoTile` on the homepage matches this value
