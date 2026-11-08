# View Transitions

## Purpose

Integrate the View Transitions API with TanStack Router to provide smooth route-change animations while respecting reduced-motion preferences.

## Requirements

### Requirement: View Transitions API integration

The project SHALL integrate the View Transitions API with TanStack Router so that route navigations trigger smooth cross-fade or morph transitions.

#### Scenario: Route navigation triggers view transition

- **WHEN** the user navigates from `/` to `/portfolio`
- **THEN** `document.startViewTransition()` is called and a smooth transition occurs

#### Scenario: Unsupported browsers fall back gracefully

- **WHEN** the browser does not support `document.startViewTransition`
- **THEN** navigation occurs instantly without errors

### Requirement: Reduced motion respect

The project SHALL respect the user's `prefers-reduced-motion` OS setting by disabling all animations and transitions.

#### Scenario: Reduced motion disables animations

- **WHEN** the user has `prefers-reduced-motion: reduce` set in their OS
- **THEN** all CSS animations and transitions have duration of 0.01ms or less

#### Scenario: View Transitions are skipped

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** View Transitions API is not invoked and navigation is instant

### Requirement: view-transition-name for morphing elements

The project SHALL assign matching `view-transition-name` values to the source tile and the destination hero of each detail route, scoped by content type. Names SHALL be unique within a rendered page.

#### Scenario: Morphing elements are identifiable

- **WHEN** the user navigates from a homepage card or tile to its detail route
- **THEN** the source element and the destination hero declare the same `view-transition-name`
- **AND** the browser morphs between the two elements

#### Scenario: Names are scoped by content type

- **WHEN** inspecting a transition name
- **THEN** blog posts use `blog-<slug>`, portfolio projects use `work-tile-<slug>`, and photo sets use `photo-<slug>`

#### Scenario: view-transition-name uniqueness is enforced

- **WHEN** a page renders multiple items of the same content type
- **THEN** only one element per name is rendered, because the browser API accepts a single element per name
- **AND** the homepage derives one featured photo per set so `photo-<slug>` tiles cannot collide
