## ADDED Requirements

### Requirement: Sections reveal on scroll

Each homepage section SHALL fade and slide up into view as it enters the viewport, using an IntersectionObserver-based reveal mechanism.

#### Scenario: Section reveals when 15% visible

- **WHEN** a section scrolls into view and at least 15% of it is visible
- **THEN** the section transitions from an offset, faded-out state to its final position with full opacity

#### Scenario: Sections above the fold render immediately

- **WHEN** the homepage first loads
- **THEN** any sections already visible in the viewport render in their final state without animation

### Requirement: Hero entrance animation

The hero SHALL play a one-time entrance animation on initial page load: the intro line, headline, location, and portrait fade and slide up in sequence.

#### Scenario: Hero entrance sequence

- **WHEN** the homepage first loads
- **THEN** the intro line, then the headline, then the location, then the portrait animate into view in sequence

### Requirement: Hero portrait parallax on scroll

The hero portrait SHALL move at a slower rate than the surrounding text as the user scrolls, creating a subtle parallax effect.

#### Scenario: Portrait parallax

- **WHEN** the user scrolls the hero section
- **THEN** the portrait translates vertically at a slower rate than the headline and intro text

### Requirement: View transitions for click-through navigation

Clicking a work tile, photo tile, or blog card SHALL trigger a view transition that animates the source element into the destination page's hero image.

#### Scenario: Work tile click triggers view transition

- **WHEN** a user clicks a work tile
- **THEN** the tile animates into the destination route's hero area using the view-transitions API

#### Scenario: Photo tile click triggers view transition

- **WHEN** a user clicks a photo tile
- **THEN** the photo animates into the destination route using the view-transitions API

#### Scenario: Blog card click triggers view transition

- **WHEN** a user clicks a blog card
- **THEN** the card animates into the destination blog post using the view-transitions API

### Requirement: Reduced motion is strictly honored

All motion SHALL be disabled when `prefers-reduced-motion: reduce` is set. Sections, hero entrance, parallax, hover effects, and shimmer placeholders SHALL all render in their final state without animation.

#### Scenario: Reduced motion disables scroll reveals

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** sections render in their final state immediately without fade or slide

#### Scenario: Reduced motion disables hero entrance

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** the hero entrance animation does not play and all elements render in their final state

#### Scenario: Reduced motion disables parallax

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** the portrait does not parallax on scroll

#### Scenario: Reduced motion disables shimmer

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** skeleton placeholders render as static gray fills without shimmer animation
