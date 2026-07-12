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
