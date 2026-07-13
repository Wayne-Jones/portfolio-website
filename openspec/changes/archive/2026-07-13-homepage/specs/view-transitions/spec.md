## MODIFIED Requirements

### Requirement: view-transition-name for morphing elements

The project SHALL support assigning `view-transition-name` CSS properties to elements that should morph between routes (e.g., project cards to case study detail, photo tiles to photo detail, blog cards to blog post detail).

#### Scenario: Morphing elements are identifiable

- **WHEN** a component defines `view-transition-name` on an element
- **THEN** that element morphs smoothly when navigating between routes that share the same `view-transition-name`

#### Scenario: view-transition-name uniqueness is enforced

- **WHEN** multiple elements on the same page have the same `view-transition-name`
- **THEN** only one is rendered at a time (per browser API constraint)

#### Scenario: Homepage work tile morphs to project detail

- **WHEN** a user clicks a work tile on the homepage
- **THEN** the tile's `view-transition-name` causes it to morph into the destination project's hero image

#### Scenario: Homepage photo tile morphs to photo detail

- **WHEN** a user clicks a photo tile on the homepage
- **THEN** the photo's `view-transition-name` causes it to morph into the destination photo detail page

#### Scenario: Homepage blog card morphs to blog post

- **WHEN** a user clicks a blog card on the homepage
- **THEN** the card's `view-transition-name` causes it to morph into the destination blog post hero image
