## ADDED Requirements

### Requirement: Section primitive renders eyebrow, title, and content

The homepage SHALL provide a reusable section primitive that renders a small uppercase eyebrow label, a horizontal hairline rule, a section title, and arbitrary children content.

#### Scenario: Section primitive renders all parts

- **WHEN** a section primitive is rendered with eyebrow "WORK", title "Selected projects", and children
- **THEN** the eyebrow label, hairline rule, section title, and children all render in that vertical order

#### Scenario: Eyebrow uses uppercase small text

- **WHEN** the section primitive renders
- **THEN** the eyebrow label is rendered in uppercase with letter-spacing and a muted color

### Requirement: Work Portfolio section renders asymmetric grid

The homepage SHALL render a Work Portfolio section containing 4 featured project tiles in an asymmetric grid where the first tile spans more horizontal space than the others.

#### Scenario: First tile spans wider

- **WHEN** the Work Portfolio section renders on a viewport at least 1024px wide
- **THEN** the first project tile spans 2 columns and the remaining 3 tiles occupy the other columns

#### Scenario: Grid collapses on smaller viewports

- **WHEN** the viewport is between 640px and 1023px
- **THEN** the grid renders as 2 columns with the first tile spanning both columns

#### Scenario: Grid collapses to single column on mobile

- **WHEN** the viewport is below 640px
- **THEN** the grid renders as a single column with all tiles stacked

### Requirement: Work tile displays project metadata

Each work tile SHALL display the project name, role/discipline tag, and client name. Tiles SHALL be rendered as 4:3 landscape aspect ratio with 8px corner rounding.

#### Scenario: Tile metadata

- **WHEN** a work tile renders
- **THEN** it shows the project name, role tag, and client name

#### Scenario: Tile aspect ratio

- **WHEN** a work tile renders
- **THEN** it maintains a 4:3 aspect ratio with 8px rounded corners

#### Scenario: Hover reveals metadata overlay

- **WHEN** a user hovers over a work tile
- **THEN** the metadata (name, role, client) animates into view over the image

### Requirement: Photography section renders masonry grid

The homepage SHALL render a Photography section containing a true masonry grid of photos with mixed aspect ratios.

#### Scenario: Masonry uses CSS columns

- **WHEN** the Photography section renders
- **THEN** photos are laid out in a CSS columns-based masonry with varied heights

#### Scenario: Photos preserve aspect ratio

- **WHEN** photos render in the masonry
- **THEN** each photo preserves its intrinsic aspect ratio without cropping

#### Scenario: Photo hover applies subtle zoom

- **WHEN** a user hovers over a photo
- **THEN** the photo scales by a small amount (between 1.02 and 1.05)

### Requirement: Recent Blog Posts section renders compact grid

The homepage SHALL render a Recent Blog Posts section containing a compact 3-column grid of the 3 most recent posts, each showing the post title, publication date, and read time.

#### Scenario: Blog grid layout

- **WHEN** the Recent Blog Posts section renders on a viewport at least 768px wide
- **THEN** posts are displayed in a 3-column grid

#### Scenario: Blog grid collapses on mobile

- **WHEN** the viewport is below 768px
- **THEN** posts are displayed in a single column

#### Scenario: Blog card metadata

- **WHEN** a blog card renders
- **THEN** it displays the post title, publication date (e.g. "Mar 2026"), and read time (e.g. "5 min read")

### Requirement: Contact footer renders statement and email

The homepage SHALL render a Contact footer section containing a large display statement "Let's work together" and an email link with arrow, formatted as "hello@wayne.me →".

#### Scenario: Footer statement

- **WHEN** the footer renders
- **THEN** it displays the literal text "Let's work together" at a large display size

#### Scenario: Footer email link

- **WHEN** the footer renders
- **THEN** it displays an email link "hello@wayne.me" with a trailing arrow character

### Requirement: Section spacing is generous

All homepage sections SHALL be separated by generous vertical whitespace (at least 96px / 6rem on desktop, 64px / 4rem on mobile).

#### Scenario: Desktop section spacing

- **WHEN** the homepage renders on a viewport at least 768px wide
- **THEN** each section has at least 96px of vertical padding above and below its content

#### Scenario: Mobile section spacing

- **WHEN** the homepage renders on a viewport below 768px
- **THEN** each section has at least 64px of vertical padding above and below its content
