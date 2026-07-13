# Content Snapshot

## Purpose

Define how the Ghost Content API state is captured into local JSON so that the build is self-contained, reproducible, and decoupled from Ghost's online availability at render time.

## Requirements

### Requirement: Snapshot script fetches all content types

The project SHALL ship a `scripts/snapshot-content.ts` Node script that calls the content service for every accessible content type and writes a JSON file per type to `src/content/data/`.

#### Scenario: Snapshot script targets all Ghost content
- **WHEN** `pnpm snapshot` is invoked
- **THEN** the script invokes `contentService.getPosts()`, `contentService.getProjects()`, and `contentService.getPhotoSets()` (and any featured/limited variants needed for the homepage)
- **AND** writes each result as JSON to `src/content/data/<plural>.json`

#### Scenario: Snapshot is reproducible
- **WHEN** two consecutive `pnpm snapshot` runs are issued against the same Ghost state
- **THEN** both produce byte-identical JSON output

### Requirement: Snapshot JSON files are committed to the repository

The project SHALL commit the snapshot JSON files to source control so that builds and previews can run without a Ghost connection.

#### Scenario: Snapshot files are tracked
- **WHEN** inspecting the git index for `src/content/data/*.json`
- **THEN** those files are tracked and not listed in `.gitignore`

#### Scenario: Refresh command updates committed snapshot
- **WHEN** `pnpm snapshot` is run during development
- **THEN** developers commit the updated JSON alongside any code changes that depend on refreshed content

### Requirement: Snapshot script fails clearly on Ghost errors

The project SHALL surface a clear, non-zero exit if the snapshot script cannot connect to Ghost, cannot authenticate, or receives invalid responses, so that build pipelines fail loudly rather than silently producing a stale snapshot.

#### Scenario: Connection failure exits non-zero
- **WHEN** the Ghost Content API is unreachable or returns a non-2xx status
- **THEN** the snapshot script exits with a non-zero code and prints the underlying error

#### Scenario: Authentication failure is reported
- **WHEN** the Ghost Content API key is missing or invalid
- **THEN** the snapshot script prints a message indicating which env var or credential is missing and exits non-zero

### Requirement: Snapshot content matches canonical types

The project SHALL store snapshot JSON in the same shape returned by `ContentService` methods, using the existing canonical types (`Post`, `Project`, `PhotoSet`, `Photo`).

#### Scenario: Snapshot is parseable back into canonical types
- **WHEN** a snapshot JSON file is consumed by an adapter at render time
- **THEN** each entry conforms to the canonical type contract (no Ghost-specific field names leak through)
