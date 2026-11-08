# Spec Delta

## MODIFIED Requirements

### Requirement: Set tiles link to the detail route

Each tile SHALL link to `/photography/<slug>` and SHALL render the set title, the cover image (or first image when no cover exists), and the `location` and `camera` metadata when present.

#### Scenario: Cover image is preferred

- **WHEN** a photo set has a `coverImage`
- **THEN** the tile renders that image as decorative media (`alt=""`) because the set title is adjacent in the same link
- **AND** the tile's accessible name is the set title, announced once

#### Scenario: First image is the fallback

- **WHEN** a photo set has no `coverImage` but has images
- **THEN** the tile renders the first image in the set

#### Scenario: Missing images render a placeholder

- **WHEN** a photo set has no `coverImage` and no images
- **THEN** the tile renders a neutral aspect-ratio placeholder followed by the title and link

#### Scenario: Metadata line omits missing fields

- **WHEN** a photo set has `location`, `camera`, both, or neither
- **THEN** the tile renders the available parts joined by ` · ` and renders no metadata line when neither is set

### Requirement: Homepage preview renders featured photos

The homepage photography section SHALL render the image for each featured photo returned by `getFeaturedPhotos()`, using the photo's descriptive `alt` text, and SHALL keep the existing link and `photo-<slug>` transition name.

#### Scenario: Featured image renders

- **WHEN** a featured photo has a `src`
- **THEN** the tile renders an `<img>` with that source, its descriptive `alt`, and lazy loading

#### Scenario: Duplicate caption is not announced

- **WHEN** the tile overlays the photo's description as visible caption text
- **THEN** that overlay is hidden from assistive technology
- **AND** the image is announced once

#### Scenario: Caption reveals on keyboard focus

- **WHEN** a keyboard user focuses the photo tile link
- **THEN** the caption overlay becomes visible
- **AND** the tile renders a visible focus indicator

#### Scenario: Tile still links to the set

- **WHEN** a featured photo has a `setSlug`
- **THEN** the tile links to `/photography/<setSlug>` and declares `view-transition-name: photo-<setSlug>`
