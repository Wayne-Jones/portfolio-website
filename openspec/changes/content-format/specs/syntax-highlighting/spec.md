# Syntax Highlighting

## Purpose

Define how source code blocks in post bodies are rendered with syntax-highlighted styling, computed at build time inside the content adapter so the renderer never depends on a runtime highlighting library.

## Requirements

### Requirement: Highlighter runs at adapter scope

The project SHALL expose a `highlightCodeBlocks(tree, options)` helper that walks a `ContentTree`, applies syntax highlighting to every `codeBlock` node's `code` field, and writes the result into the node's `highlightedHtml` field. The Ghost adapter SHALL call this helper after translating HTML to the canonical tree.

#### Scenario: Adapter calls the helper
- **WHEN** `GhostAdapter.getPost(slug)` runs
- **THEN** the resulting `Post.content` has each `codeBlock` node's `highlightedHtml` set when shading is available for the language

#### Scenario: Helper is reusable across adapters
- **WHEN** a future Sanity or Contentful adapter constructs `codeBlock` nodes directly
- **THEN** calling `highlightCodeBlocks(tree)` populates `highlightedHtml` identically

#### Scenario: Languages declared at construction
- **WHEN** the helper is initialized
- **THEN** it advertises the set of languages it can highlight (whitelisted subset, e.g., `javascript`, `typescript`, `tsx`, `jsx`, `json`, `html`, `css`, `bash`, `markdown`, `python`) — and any code block whose language is not in this set skips highlighting and remains unhighlighted

### Requirement: Highlighter is build-time only

The highlighter SHALL NOT be imported into the client bundle. Adapters (in the build context) import the highlighter; in the bundled client output the absent `highlightedHtml` falls back to plain `<pre><code>` rendering.

#### Scenario: Bundle excludes Shiki
- **WHEN** inspecting the production client bundle after `pnpm build`
- **THEN** the bundle does not contain a dependency on `shiki` or any highlighter dependency

### Requirement: Themes load once and are reused

The highlighter SHALL lazy-load themes and grammars once per build process and reuse the highlighter instance across all posts so that build time is not dominated by repeated initialization.

#### Scenario: Single highlighter instance
- **WHEN** more than one post contains `codeBlock` nodes
- **THEN** the highlighter is constructed exactly once (across the A-to-Z of `getPost(slug)` and similar) and the themes/grammars are loaded exactly once per build

#### Scenario: Theme is configurable
- **WHEN** the highlighter is initialized
- **THEN** it accepts a `theme` option defaulting to a single theme (`github-light` or `github-dark`) chosen to match the rest of the site's typographic style

### Requirement: Highlighted HTML carries language identifier

The `highlightedHtml` field SHALL be wrapped in `<pre class="language-X"><code class="language-X">` markup (or equivalent) so that downstream CSS can target the language for font choice or sticky-headers without re-parsing.

#### Scenario: Wrapper classes present
- **WHEN** a `codeBlock` node's `highlightedHtml` is set
- **THEN** it contains a `<pre>` element with a class name that identifies the language

### Requirement: Empty or trivial code blocks skip highlighting

The highlighter SHALL skip emitting `highlightedHtml` when the `code` is empty, or when the language is unknown, leaving the renderer to fall back to plain `<pre><code>` rendering.

#### Scenario: Unknown language skips highlighting
- **WHEN** a `codeBlock` node has `language: "rust"` (not in the whitelisted set)
- **THEN** `highlightedHtml` is left undefined

#### Scenario: Empty code skips highlighting
- **WHEN** a `codeBlock` node has `code: ""`
- **THEN** `highlightedHtml` is left undefined
