## MODIFIED Requirements

### Requirement: ContentService interface

The project SHALL define a `ContentService` interface with methods for retrieving posts, projects, and photo sets using canonical types that are independent of any specific CMS. The interface SHALL also expose methods for retrieving a small "featured" subset for the homepage.

#### Scenario: Interface defines getPosts

- **WHEN** inspecting the `ContentService` interface
- **THEN** it includes `getPosts(): Promise<Post[]>` and `getPost(slug: string): Promise<Post | null>`

#### Scenario: Interface defines getProjects

- **WHEN** inspecting the `ContentService` interface
- **THEN** it includes `getProjects(): Promise<Project[]>` and `getProject(slug: string): Promise<Project | null>`

#### Scenario: Interface defines getPhotoSets

- **WHEN** inspecting the `ContentService` interface
- **THEN** it includes `getPhotoSets(): Promise<PhotoSet[]>` and `getPhotoSet(slug: string): Promise<PhotoSet | null>`

#### Scenario: Interface defines homepage featured methods

- **WHEN** inspecting the `ContentService` interface
- **THEN** it includes `getFeaturedProjects(limit: number): Promise<Project[]>`, `getFeaturedPhotos(limit: number): Promise<Photo[]>`, and `getRecentPosts(limit: number): Promise<Post[]>`

### Requirement: Homepage photo shape

The project SHALL define a `Photo` type distinct from `PhotoSet` that represents a single photo with `src`, `alt`, and `aspect` fields for use in the homepage photography masonry.

#### Scenario: Photo type shape

- **WHEN** inspecting the `Photo` type
- **THEN** it includes `src` (string URL), `alt` (string), and `aspect` ("portrait" | "landscape" | "square")

#### Scenario: PhotoSet flattens to Photo array

- **WHEN** `getFeaturedPhotos()` is called
- **THEN** it returns a flat array of `Photo` items derived from one or more `PhotoSet` items
