## MODIFIED Requirements

### Requirement: Canonical content types

The project SHALL define canonical `Post`, `Project`, and `PhotoSet` types that are CMS-agnostic and do not reference Ghost-specific field names.

#### Scenario: Post type is CMS-agnostic
- **WHEN** inspecting the `Post` type
- **THEN** it uses `featureImage` (not `feature_image`), `publishedAt` (not `published_at`), and `content` typed as `ContentTree` (not Ghost-specific `html` string or `mobiledoc`)

#### Scenario: Project type includes project-specific fields
- **WHEN** inspecting the `Project` type
- **THEN** it includes optional fields for `role`, `client`, `year`, and `gallery`

#### Scenario: PhotoSet type includes photography-specific fields
- **WHEN** inspecting the `PhotoSet` type
- **THEN** it includes `images` (string array), `coverImage`, and optional fields for `location` and `camera`

### Requirement: Ghost adapter implementation

The project SHALL implement a `GhostAdapter` class that conforms to `ContentService` and maps Ghost Content API responses to canonical types. The adapter SHALL translate Ghost's HTML `body` field into the canonical `ContentTree` shape and SHALL pre-compute syntax-highlighted HTML for every `codeBlock` block.

#### Scenario: GhostAdapter implements ContentService
- **WHEN** inspecting the `GhostAdapter` class
- **THEN** it implements all methods defined in the `ContentService` interface

#### Scenario: Ghost HTML is translated to ContentTree
- **WHEN** `GhostAdapter.getPost(slug)` resolves a Ghost post with HTML body content
- **THEN** the returned `Post.content` field is a `ContentTree` produced from the HTML, not the raw HTML string

#### Scenario: syntax-highlighted HTML is attached to codeBlock nodes
- **WHEN** the translated `ContentTree` contains a `codeBlock` node
- **THEN** the `codeBlock.highlightedHtml` field is populated by the highlighting pass during adapter execution
- **AND** the renderer (in the client bundle) does not invoke Shiki

#### Scenario: Ghost field names are mapped
- **WHEN** `GhostAdapter.getPosts()` is called
- **THEN** Ghost's `feature_image` is mapped to `featureImage`, `published_at` to `publishedAt`, and the `html` body field is translated to `content` as a `ContentTree`

### Requirement: Mock adapter implementation

The project SHALL implement a `MockAdapter` class that conforms to `ContentService` and returns placeholder canonical types. The `content` field SHALL be a constructed `ContentTree` literal so the mock documents the canonical tree shape.

#### Scenario: Mock returns canonical content tree
- **WHEN** `MockAdapter.getPost(slug)` is called
- **THEN** the returned post's `content` field is a `ContentTree` literal containing sample paragraph, heading, image, and code blocks
- **AND** the `MockAdapter` is async, matching the runtime expectations of the renderer
