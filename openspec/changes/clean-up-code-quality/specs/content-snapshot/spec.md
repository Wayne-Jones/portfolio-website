# Spec Delta

## ADDED Requirements

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
