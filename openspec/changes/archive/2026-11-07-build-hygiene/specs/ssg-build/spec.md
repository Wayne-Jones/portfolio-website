# build-hygiene Delta

## MODIFIED Requirements

### Requirement: Prebuild fetches content snapshot before render

The project SHALL execute a `prebuild` script that fetches all content via the content service and writes JSON files to `src/content/data/` before the build's render pass begins. When Ghost credentials are not configured, the script SHALL leave the committed snapshot untouched and the build SHALL continue from it. Regenerating the snapshot from mock fixtures SHALL require an explicit opt-in.

#### Scenario: Snapshot writes JSON files

- **WHEN** `pnpm build` is invoked with `VITE_GHOST_URL` and `VITE_GHOST_CONTENT_API_KEY` configured
- **THEN** `src/content/data/posts.json`, `src/content/data/projects.json`, and `src/content/data/photosets.json` exist after `prebuild` completes

#### Scenario: Snapshot is idempotent under missing Ghost

- **WHEN** the build environment cannot reach the configured Ghost Content API
- **THEN** the build fails at the snapshot step with a clear error rather than producing a partially-rendered output
- **AND** the committed snapshot files are left unchanged

#### Scenario: Unconfigured build keeps the committed snapshot

- **WHEN** `pnpm build` runs without `VITE_GHOST_URL` and `VITE_GHOST_CONTENT_API_KEY`
- **THEN** the snapshot step exits successfully without writing any files
- **AND** the build renders from the committed snapshot

#### Scenario: Partial Ghost configuration fails

- **WHEN** exactly one of `VITE_GHOST_URL` and `VITE_GHOST_CONTENT_API_KEY` is set
- **THEN** the snapshot step fails with an error explaining that both or neither are required

#### Scenario: Mock refresh is explicit

- **WHEN** `SNAPSHOT_SOURCE=mock` is set
- **THEN** the snapshot step writes the mock fixtures to `src/content/data/`

#### Scenario: Explicit snapshot mode skips the fetch

- **WHEN** `SNAPSHOT_SOURCE=snapshot` is set
- **THEN** the snapshot step exits successfully without writing any files
