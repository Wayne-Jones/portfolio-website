## ADDED Requirements

### Requirement: Hero renders intro, headline, location, and portrait

The homepage SHALL render a hero section at the top of the page containing, in order: a small intro line, a two-line display headline, a location line, and a portrait image overlapping the headline.

#### Scenario: Hero renders all four elements

- **WHEN** the homepage route loads
- **THEN** the hero section displays the intro line, the two-line headline, the location line, and the portrait image

#### Scenario: Headline uses mixed solid and outlined treatment

- **WHEN** the hero renders
- **THEN** the first headline line is rendered in solid color and the second headline line is rendered with an outlined (stroke-only) treatment

#### Scenario: Portrait overlaps headline on desktop

- **WHEN** the viewport is at least 640px wide
- **THEN** the portrait image visually overlaps the second headline line

#### Scenario: Hero stacks vertically on mobile

- **WHEN** the viewport is below 640px wide
- **THEN** the hero stacks vertically with the portrait rendered below the headline without overlap

### Requirement: Hero text content is correct

The hero SHALL display the literal intro line "👋 My Name is Wayne Jones and I am a...", the literal headline "Web Developer" (line 1) and "& Photographer" (line 2), and the location line "based in New York, NY".

#### Scenario: Intro line copy

- **WHEN** the hero renders
- **THEN** the intro line reads "👋 My Name is Wayne Jones and I am a..."

#### Scenario: Headline copy

- **WHEN** the hero renders
- **THEN** line 1 reads "Web Developer" and line 2 reads "& Photographer"

#### Scenario: Location copy

- **WHEN** the hero renders
- **THEN** the location line reads "based in New York, NY"

### Requirement: Hero typography uses theme tokens

The hero headline SHALL use the project's display font (Switzer) at a fluid size between mobile and desktop, with bold weight (700) and tight letter-spacing. The intro and location lines SHALL use the body font (Inter) at a smaller size.

#### Scenario: Display font and weight

- **WHEN** the hero headline renders
- **THEN** it uses the Switzer display font at weight 700 with negative letter-spacing

#### Scenario: Fluid headline sizing

- **WHEN** the viewport resizes between 320px and 1440px
- **THEN** the headline scales fluidly without breakpoint jumps

### Requirement: Hero is accessible

The hero SHALL meet WCAG 2.2 AAA contrast requirements for all text against the page background in both light and dark modes.

#### Scenario: Light mode contrast

- **WHEN** the light theme is active
- **THEN** the hero text and outlined headline meet at least 7:1 contrast against the background

#### Scenario: Dark mode contrast

- **WHEN** the dark theme is active
- **THEN** the hero text and outlined headline meet at least 7:1 contrast against the background

#### Scenario: Portrait has alt text

- **WHEN** the portrait image renders
- **THEN** it includes descriptive alt text
