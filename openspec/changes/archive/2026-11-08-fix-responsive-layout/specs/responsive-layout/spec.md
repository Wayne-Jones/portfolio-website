# Spec Delta

## Purpose

Define how the page shell, navigation, hero, and full-bleed regions adapt between 320px and widescreen without horizontal overflow, clipped content, or abrupt layout jumps at breakpoints.

## ADDED Requirements

### Requirement: No horizontal overflow

Every route SHALL fit within the viewport width at 320px, 360px, 768px, 1024px, and 1025px without document-level horizontal scrolling.

#### Scenario: Narrow phone viewport

- **WHEN** any route renders at a 320px viewport
- **THEN** the document scroll width is less than or equal to the viewport width
- **AND** no primary content is clipped or hidden off-screen

#### Scenario: Breakpoint boundary

- **WHEN** the viewport is resized from 1024px to 1025px
- **THEN** the document width continues to equal the viewport width
- **AND** no element jumps size, wraps, or overlaps as a result of the resizing

### Requirement: Header navigation adapts to narrow viewports

The primary header SHALL keep the wordmark and all navigation links reachable and legible at every supported viewport width.

#### Scenario: Navigation at 320px

- **WHEN** the header renders at a 320px viewport
- **THEN** every navigation link is visible or reachable through a deliberate wrapping or scrolling affordance
- **AND** the header does not increase the document width beyond the viewport

### Requirement: Hero headline fits its container

The homepage hero SHALL size its display headline fluidly so that both headline lines stay inside the viewport at every supported width.

#### Scenario: Headline at 320px

- **WHEN** the homepage renders at a 320px viewport
- **THEN** both headline lines are fully visible without horizontal scrolling or clipping
- **AND** the lines do not overlap each other

#### Scenario: Headline scales with viewport

- **WHEN** the viewport grows from 320px to widescreen
- **THEN** the headline font size scales continuously using fluid sizing
- **AND** it does not switch to a fixed size that reflows the layout abruptly

### Requirement: Full-bleed regions respect the page gutter

Regions declared full-bleed, such as the photo-set grid footer, SHALL extend to the page container edges without overflowing the viewport.

#### Scenario: Full-bleed footer on a narrow viewport

- **WHEN** a detail page with a full-bleed footer renders at 320px
- **THEN** the footer aligns with the page container edges
- **AND** it does not extend past the viewport or reveal horizontal scroll

#### Scenario: Gutter changes do not break bleed

- **WHEN** the page container's horizontal padding changes at a breakpoint
- **THEN** full-bleed regions continue to align with the container edges without a fixed negative margin

### Requirement: Responsive behaviour is regression-tested

The project SHALL verify the supported widths as part of its automated or scripted checks.

#### Scenario: Width sweep passes

- **WHEN** the responsive check runs against 320px, 360px, 768px, 1024px, and 1025px
- **THEN** it reports no horizontal overflow and no overlapping hero headline lines
