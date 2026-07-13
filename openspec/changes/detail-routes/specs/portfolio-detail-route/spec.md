# Portfolio Detail Route

## Purpose

Define the `/portfolio/$slug` route that loads and renders a single portfolio project (case study) with project-specific metadata and a gallery below the body.

## Requirements

### Requirement: Page loads the project by slug

The `/portfolio/$slug` route SHALL load the project corresponding to the route's slug parameter via the content service, returning a 404 affordance when the slug is unknown.

#### Scenario: Loader resolves project
- **WHEN** a user navigates to `/portfolio/<slug>` for a valid slug
- **THEN** the loader resolves the project via `contentService.getProject(<slug>)`
- **AND** the project renders in the article layout

#### Scenario: Missing project returns 404
- **WHEN** the user navigates to `/portfolio/<slug>` for an unknown slug
- **THEN** the loader returns null and the route renders the editorial 404 affordance

### Requirement: Article header renders project metadata

The portfolio detail page SHALL render, in order: title as `<h1>`, project metadata line (role, client, year), the canonical eyebrow tag for `portfolio` posts, and optional feature image.

#### Scenario: Title renders
- **WHEN** the loaded project has `title`
- **THEN** the header renders `<h1 class="font-display ...">{title}</h1>`

#### Scenario: Metadata row renders role / client / year
- **WHEN** the loaded project specifies `role`, `client`, and `year`
- **THEN** the header renders a metadata row, e.g., `"{role} · {client} · {year}"`
- **AND** any field that is missing contributes an empty placeholder rather than missing semicolons

#### Scenario: Feature image or hero
- **WHEN** the loaded project has `featureImage`
- **THEN** the header renders it as a hero, similar to the blog detail page
- **AND** if `featureImage` is absent, the header renders an empty headline band instead (so case studies without cover images still render)

### Requirement: Body content renders via PostBody

The portfolio detail page SHALL render the project's `content` field by passing it to `<PostBody />`.

#### Scenario: Body renders canonical tree
- **WHEN** `project.content` is a `ContentTree`
- **THEN** `<PostBody content={project.content} />` renders the body

### Requirement: Gallery renders below body when present

The portfolio detail page SHALL render a `Gallery` section after the body when `project.gallery[]` is non-empty.

#### Scenario: Gallery renders image grid
- **WHEN** the loaded project has `gallery: string[]` with one or more images
- **THEN** a `<Gallery>` section renders below the body with each image laid out in masonry style
- **AND** each image uses `FigureImage` (so Cloudinary srcsets apply)

#### Scenario: Gallery absent
- **WHEN** the loaded project has no `gallery` or empty `gallery[]`
- **THEN** no `<Gallery>` section is rendered

### Requirement: View transition naming ties tile to hero

The portfolio hero image SHALL declare `viewTransitionName: "work-tile-<slug>"` so the morph animation between the `WorkTile` on the homepage and this detail page fires automatically.

#### Scenario: Hero declares matching transition name
- **WHEN** the portfolio detail page mounts at `/portfolio/<slug>`
- **THEN** the hero image has inline style `viewTransitionName: "work-tile-<slug>"`
- **AND** the `WorkTile` on the homepage matches this value
