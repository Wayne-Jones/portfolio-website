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

The project SHALL support assigning `view-transition-name` CSS properties to elements that should morph between routes (e.g., project cards to case study detail).

#### Scenario: Morphing elements are identifiable

- **WHEN** a component defines `view-transition-name` on an element
- **THEN** that element morphs smoothly when navigating between routes that share the same `view-transition-name`

#### Scenario: view-transition-name uniqueness is enforced

- **WHEN** multiple elements on the same page have the same `view-transition-name`
- **THEN** only one is rendered at a time (per browser API constraint)
