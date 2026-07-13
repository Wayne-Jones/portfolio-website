## MODIFIED Requirements

### Requirement: CMS selection via environment variable

The project SHALL select the active content adapter at module-load time based on the `VITE_CMS` environment variable, defaulting to a build-time "static snapshot" adapter when no mode is selected and the running code is in production build context, and defaulting to a mock adapter otherwise.

#### Scenario: Ghost adapter is selected
- **WHEN** `VITE_CMS=ghost` is set
- **THEN** `contentService` is an instance of `GhostAdapter`

#### Scenario: Mock adapter is the default in dev
- **WHEN** `VITE_CMS` is not set during a Vite dev-server run (`import.meta.env.DEV` is true)
- **THEN** `contentService` is an instance of `MockAdapter` returning placeholder data without any Ghost network access

#### Scenario: Snapshot adapter is the default at production build
- **WHEN** `VITE_CMS` is not set during `vite-react-ssg build` (`import.meta.env.DEV` is false)
- **THEN** `contentService` is an instance of a static adapter that reads from JSON files in `src/content/data/` and does not perform any runtime network access

#### Scenario: Snapshot adapter is selected explicitly
- **WHEN** `VITE_CMS=snapshot` (in any context, including dev)
- **THEN** `contentService` is an instance of a static adapter that reads from `src/content/data/*.json`

### Requirement: Static snapshot adapter implementation

The project SHALL implement a `StaticAdapter` class that conforms to `ContentService` and resolves each method by reading the corresponding JSON file from `src/content/data/`. The static adapter SHALL be available both at build time (consumed by `vite-react-ssg`) and during browser navigation when a pre-rendered JSON payload accompanies the page.

#### Scenario: Static adapter implements ContentService
- **WHEN** inspecting the `StaticAdapter` class
- **THEN** it implements every method defined in the `ContentService` interface

#### Scenario: Static adapter does not fetch at runtime
- **WHEN** any method of `StaticAdapter` is called from browser code
- **THEN** the method returns data parsed from the bundled JSON and does not perform `fetch` calls

#### Scenario: Featured subsets come from the snapshot
- **WHEN** `StaticAdapter.getFeaturedProjects(limit)`, `getFeaturedPhotos(limit)`, or `getRecentPosts(limit)` is called
- **THEN** the limit parameter trims the corresponding snapshot array
