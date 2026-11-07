# Content Adapter

## Purpose

Define a CMS-agnostic content abstraction layer so that components consume content through a unified interface, with Ghost as the initial adapter implementation.

## Requirements

### Requirement: ContentService interface

The project SHALL define a `ContentService` interface with methods for retrieving posts, projects, and photo sets using canonical types that are independent of any specific CMS.

#### Scenario: Interface defines getPosts

- **WHEN** inspecting the `ContentService` interface
- **THEN** it includes `getPosts(): Promise<Post[]>` and `getPost(slug: string): Promise<Post | null>`

#### Scenario: Interface defines getProjects

- **WHEN** inspecting the `ContentService` interface
- **THEN** it includes `getProjects(): Promise<Project[]>` and `getProject(slug: string): Promise<Project | null>`

#### Scenario: Interface defines getPhotoSets

- **WHEN** inspecting the `ContentService` interface
- **THEN** it includes `getPhotoSets(): Promise<PhotoSet[]>` and `getPhotoSet(slug: string): Promise<PhotoSet | null>`

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

### Requirement: Tag-based content separation

The project SHALL use Ghost tags to separate content types: `#portfolio` tag for projects, `#photography` tag for photo sets, and untagged posts for blog content.

#### Scenario: Portfolio tag filters projects

- **WHEN** `GhostAdapter.getProjects()` is called
- **THEN** only Ghost posts with the `#portfolio` tag are returned

#### Scenario: Photography tag filters photo sets

- **WHEN** `GhostAdapter.getPhotoSets()` is called
- **THEN** only Ghost posts with the `#photography` tag are returned

#### Scenario: Blog excludes portfolio and photography

- **WHEN** `GhostAdapter.getPosts()` is called
- **THEN** posts with `#portfolio` or `#photography` tags are excluded

### Requirement: CMS selection via environment variable

The project SHALL select the active content adapter at module-load time based on the `VITE_CMS` environment variable, defaulting to a build-time "static snapshot" adapter when no mode is selected and the running code is in production build context, and defaulting to a mock adapter otherwise.

#### Scenario: Ghost adapter is selected
- **WHEN** `VITE_CMS=ghost` is set
- **THEN** `contentService` is an instance of `GhostAdapter`

#### Scenario: Mock adapter is the default in dev
- **WHEN** `VITE_CMS` is not set during a Vite dev-server run (`import.meta.env.DEV` is true)
- **THEN** `contentService` is an instance of `MockAdapter` returning placeholder data without any Ghost network access

#### Scenario: Mock adapter is the fallback
- **WHEN** `VITE_CMS` is not set
- **THEN** `contentService` is an instance of a mock adapter returning placeholder data without any Ghost network access

#### Scenario: Snapshot adapter is the default at production build
- **WHEN** `VITE_CMS` is not set during a production render pass (`import.meta.env.DEV` is false) — e.g. `vite build` with the Start prerender plugin
- **THEN** `contentService` is an instance of a static adapter that reads from JSON files in `src/content/data/` and does not perform any runtime network access

#### Scenario: Snapshot adapter is selected explicitly
- **WHEN** `VITE_CMS=snapshot` (in any context, including dev)
- **THEN** `contentService` is an instance of a static adapter that reads from `src/content/data/*.json`

### Requirement: Components never import from adapter directly

The project SHALL ensure that all components import `contentService` from `src/content/index.ts` and never directly from adapter files.

#### Scenario: Components use the abstraction

- **WHEN** a component needs blog posts
- **THEN** it imports from `src/content/index.ts` and calls `contentService.getPosts()`, not from `src/content/adapters/ghost.ts`

### Requirement: Static snapshot adapter implementation

The project SHALL implement a `StaticAdapter` class that conforms to `ContentService` and resolves each method by reading the corresponding JSON file from `src/content/data/`. The static adapter SHALL be available both at build time (consumed by the TanStack Start prerender pass) and during browser navigation when a pre-rendered JSON payload accompanies the page.

#### Scenario: Static adapter implements ContentService
- **WHEN** inspecting the `StaticAdapter` class
- **THEN** it implements every method defined in the `ContentService` interface

#### Scenario: Static adapter does not fetch at runtime
- **WHEN** any method of `StaticAdapter` is called from browser code
- **THEN** the method returns data parsed from the bundled JSON and does not perform `fetch` calls

#### Scenario: Featured subsets come from the snapshot
- **WHEN** `StaticAdapter.getFeaturedProjects(limit)`, `getFeaturedPhotos(limit)`, or `getRecentPosts(limit)` is called
- **THEN** the limit parameter trims the corresponding snapshot array
