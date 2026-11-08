# view-transitions Delta

## MODIFIED Requirements

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
