# Accessibility Foundation

## Purpose

Establish project-wide accessibility requirements to ensure the portfolio is usable by keyboard-only and screen reader users, meeting WCAG 2.2 AA standards as a baseline.

## Requirements

### Requirement: Skip link to main content

The project SHALL include a skip link as the first focusable element on every page, allowing keyboard users to bypass navigation.

#### Scenario: Skip link is present and focusable

- **WHEN** the user presses Tab on page load
- **THEN** a "Skip to content" link receives focus and is visible

#### Scenario: Skip link navigates to main

- **WHEN** the user activates the skip link
- **THEN** focus moves to the `<main>` element

### Requirement: Semantic HTML structure

The project SHALL use semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`) on every page.

#### Scenario: Landmarks are present

- **WHEN** a screen reader navigates by landmarks
- **THEN** it finds `<header>`, `<main>`, `<nav>`, and `<footer>` regions

### Requirement: Visible focus indicators

The project SHALL provide visible focus indicators on all interactive elements. `outline: none` SHALL NOT be used without a replacement focus style.

#### Scenario: Focused element is visible

- **WHEN** the user tabs to a link or button
- **THEN** a visible focus ring (minimum 2px, high contrast) appears around the element

### Requirement: Focus management on route change

The project SHALL move focus to the new page's main heading or main landmark after a route change completes.

#### Scenario: Focus moves after navigation

- **WHEN** the user navigates to a new page
- **THEN** focus is programmatically moved to the `<h1>` or `<main>` element of the new page

### Requirement: Route change announcement

The project SHALL announce the new page title to screen readers when a route change completes.

#### Scenario: Screen reader announces new page

- **WHEN** a route change completes
- **THEN** a visually hidden live region announces the new page title

### Requirement: Keyboard-navigable navigation

The project SHALL ensure all navigation links are reachable and operable via keyboard (Tab, Enter).

#### Scenario: Navigation is keyboard-accessible

- **WHEN** the user tabs through the page
- **THEN** all navigation links receive focus in logical DOM order

### Requirement: Descriptive image alt text

The project SHALL require that all `<img>` elements have `alt` attributes. Decorative images SHALL use `alt=""`.

#### Scenario: Content images have descriptions

- **WHEN** an image conveys content
- **THEN** its `alt` attribute contains a meaningful description

#### Scenario: Decorative images are hidden from screen readers

- **WHEN** an image is purely decorative
- **THEN** its `alt` attribute is empty (`alt=""`)

#### Scenario: Alt text is not announced twice

- **WHEN** an image repeats text that is already adjacent to it, such as a heading in the same link
- **THEN** the image uses `alt=""` or the duplicate visible text is hidden from assistive technology
- **AND** the content is announced once

### Requirement: Keyboard parity for pointer-revealed content

Content revealed by hover SHALL also become visible when the tile or link receives keyboard focus, and SHALL remain available to assistive technology when visually hidden.

#### Scenario: Pointer reveals tile content

- **WHEN** a pointer hovers a tile
- **THEN** the tile's overlay content becomes fully visible

#### Scenario: Keyboard focus reveals tile content

- **WHEN** a keyboard user tabs to a tile link
- **THEN** the same overlay content becomes fully visible
- **AND** the tile renders a visible focus indicator

#### Scenario: Hidden overlay remains announced

- **WHEN** a tile's overlay is visually hidden before focus or hover
- **THEN** its text remains in the accessibility tree
- **AND** it is not exposed as an unnamed link

### Requirement: Interactive tiles render a media frame

A tile that represents a project SHALL render the project's feature image when one exists, or a neutral placeholder when it does not, so the tile is never an empty visual box.

#### Scenario: Project tile renders media

- **WHEN** a project has a feature image
- **THEN** its tile renders that image
- **AND** when no image exists, the tile renders a neutral placeholder rather than an empty box

### Requirement: Target size for interactive controls

Interactive controls SHALL provide a target of at least 44 by 44 CSS pixels, or equivalent spacing that prevents adjacent targets from overlapping.

#### Scenario: Primary navigation targets

- **WHEN** the primary header renders on a touch viewport
- **THEN** each navigation link's interactive area is at least 44 by 44 CSS pixels

#### Scenario: Pagination targets

- **WHEN** pagination renders
- **THEN** every previous, next, and page link is at least 44 by 44 CSS pixels
- **AND** adjacent links do not overlap

#### Scenario: Inline exception

- **WHEN** a link is inline within a sentence
- **THEN** it may use its natural line height instead of a 44px box

### Requirement: Heading outline reflects page structure

Each page SHALL expose exactly one `<h1>` and a heading sequence that does not skip levels, with major sections and calls to action marked by headings where they introduce content.

#### Scenario: One h1 per page

- **WHEN** any route renders
- **THEN** exactly one `<h1>` is present

#### Scenario: Listing cards do not skip levels

- **WHEN** a listing renders cards directly under its `<h1>`
- **THEN** each card title uses `<h2>`
- **AND** the homepage cards nested under a section `<h2>` use `<h3>`

#### Scenario: Contact call to action is a heading

- **WHEN** the contact section renders
- **THEN** "Let's work together" is marked up as `<h2>`

### Requirement: Loading states are announced

Regions that render a placeholder while content loads SHALL expose a busy state and a status message to assistive technology, and SHALL clear the busy state when content arrives.

#### Scenario: Pending content is announced

- **WHEN** a homepage section is waiting on deferred content
- **THEN** its container sets `aria-busy="true"`
- **AND** a visually hidden status message describes what is loading

#### Scenario: Skeleton shapes are hidden

- **WHEN** shimmer placeholders render
- **THEN** the placeholder shapes are hidden from assistive technology

#### Scenario: Busy state is cleared

- **WHEN** the deferred content resolves
- **THEN** the container sets `aria-busy="false"` or removes the busy state
- **AND** the loaded content is announced normally

### Requirement: Decorative content is hidden from assistive technology

Elements that exist only for visual treatment SHALL be hidden from assistive technology when they carry no meaning.

#### Scenario: Section rule is decorative

- **WHEN** a section renders the hairline rule between its eyebrow and title
- **THEN** the rule is not exposed as a separator

#### Scenario: Emoji is decorative

- **WHEN** the hero greeting includes an emoji
- **THEN** the emoji is hidden from assistive technology
- **AND** the surrounding sentence is read as plain text

#### Scenario: Breadcrumb separators are decorative

- **WHEN** a breadcrumb trail renders slash separators
- **THEN** the separators are hidden from assistive technology

### Requirement: Breadcrumb trail is structured and labelled

The breadcrumb navigation SHALL be a labelled `<nav>` containing an ordered list, SHALL give each item a distinct accessible name, and SHALL mark the current route when the trail contains it.

#### Scenario: Breadcrumb structure

- **WHEN** a detail page renders breadcrumbs
- **THEN** the trail is a `<nav aria-label="Breadcrumb">` wrapping an `<ol>`
- **AND** each item is a separate link with unique text

#### Scenario: Current route is marked

- **WHEN** a breadcrumb item points at the current route
- **THEN** that item exposes `aria-current="page"`
- **AND** no other item claims to be current

### Requirement: Link text matches its destination

A link's accessible name SHALL describe the page or resource it opens, and SHALL NOT claim a destination the site does not provide.

#### Scenario: Author byline destination

- **WHEN** an article renders an author byline and no dedicated author page exists
- **THEN** the author name renders as text rather than a link

#### Scenario: Listing link text

- **WHEN** a link opens a listing
- **THEN** its accessible name identifies that listing rather than a different resource
