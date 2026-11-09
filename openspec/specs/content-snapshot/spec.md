# content-snapshot Specification

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

### Requirement: Snapshot output is deterministically ordered

The snapshot writer SHALL sort every content array newest-first by `publishedAt` with `slug` and `id` tiebreakers before writing, so repeated runs against the same Ghost state produce the same order even when the API response order changes.

#### Scenario: Snapshot arrays are sorted

- **WHEN** the snapshot writes `posts.json`, `projects.json`, or `photosets.json`
- **THEN** entries are ordered newest-first by `publishedAt`
- **AND** entries with equal timestamps are ordered by `slug`, then `id`

#### Scenario: Unstable upstream order does not leak

- **WHEN** two Ghost responses contain the same items in different orders
- **THEN** the resulting snapshot files are byte-identical

### Requirement: Snapshot environment loading is robust

The snapshot script SHALL load `.env` values without truncating or misparsing them, and SHALL report a malformed entry instead of silently assigning a partial value.

#### Scenario: Values containing equals signs are preserved

- **WHEN** `.env` contains `VITE_GHOST_CONTENT_API_KEY=abc=def`
- **THEN** the variable value is `abc=def`

#### Scenario: Quoted values are unquoted

- **WHEN** `.env` contains a value wrapped in single or double quotes
- **THEN** the quotes are removed and the inner value is used
- **AND** escape sequences inside double quotes are interpreted

#### Scenario: Common dotenv syntax is accepted

- **WHEN** `.env` contains comments, blank lines, `export KEY=value`, CRLF line endings, or an empty value
- **THEN** each is parsed correctly and does not corrupt neighbouring variables

#### Scenario: Real environment wins

- **WHEN** a variable is already set in `process.env`
- **THEN** the `.env` value does not overwrite it

#### Scenario: Malformed entries are reported

- **WHEN** `.env` contains a line that cannot be parsed as a key/value pair
- **THEN** the snapshot script exits non-zero with a message identifying the problem
- **AND** no snapshot file is written
