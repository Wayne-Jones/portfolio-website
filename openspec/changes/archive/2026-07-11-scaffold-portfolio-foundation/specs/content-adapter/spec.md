## ADDED Requirements

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
- **THEN** it uses `featureImage` (not `feature_image`), `publishedAt` (not `published_at`), and `content` (not Ghost-specific `html` or `mobiledoc`)

#### Scenario: Project type includes project-specific fields

- **WHEN** inspecting the `Project` type
- **THEN** it includes optional fields for `role`, `client`, `year`, and `gallery`

#### Scenario: PhotoSet type includes photography-specific fields

- **WHEN** inspecting the `PhotoSet` type
- **THEN** it includes `images` (string array), `coverImage`, and optional fields for `location` and `camera`

### Requirement: Ghost adapter implementation

The project SHALL implement a `GhostAdapter` class that conforms to `ContentService` and maps Ghost Content API responses to canonical types.

#### Scenario: GhostAdapter implements ContentService

- **WHEN** inspecting the `GhostAdapter` class
- **THEN** it implements all methods defined in the `ContentService` interface

#### Scenario: Ghost field names are mapped

- **WHEN** `GhostAdapter.getPosts()` is called
- **THEN** Ghost's `feature_image` is mapped to `featureImage`, `published_at` to `publishedAt`, and `html` to `content`

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

The project SHALL select the active content adapter based on the `VITE_CMS` environment variable, defaulting to a mock adapter when no CMS is configured.

#### Scenario: Ghost adapter is selected

- **WHEN** `VITE_CMS=ghost` is set
- **THEN** `contentService` is an instance of `GhostAdapter`

#### Scenario: Mock adapter is the fallback

- **WHEN** `VITE_CMS` is not set
- **THEN** `contentService` is an instance of a mock adapter returning placeholder data

### Requirement: Components never import from adapter directly

The project SHALL ensure that all components import `contentService` from `src/content/index.ts` and never directly from adapter files.

#### Scenario: Components use the abstraction

- **WHEN** a component needs blog posts
- **THEN** it imports from `src/content/index.ts` and calls `contentService.getPosts()`, not from `src/content/adapters/ghost.ts`
