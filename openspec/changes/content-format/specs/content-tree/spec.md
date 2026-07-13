# Content Tree

## Purpose

Define a canonical, CMS-agnostic representation of post bodies (`ContentTree`) so that adapters can produce it from any source format (Ghost HTML today, Sanity Portable Text or Contentful Rich Text in future) and the React renderer can consume it without any CMS-specific knowledge.

## Requirements

### Requirement: ContentTree, ContentBlock, and ContentInline types

The project SHALL define `ContentTree`, `ContentBlock`, and `ContentInline` types in `src/content/types.ts`, modeled as discriminated unions that capture the semantic shape of editorial post bodies including common HTML elements and the Ghost-specific card classes covered by this change.

#### Scenario: ContentBlock is a discriminated union
- **WHEN** inspecting `ContentBlock` in `src/content/types.ts`
- **THEN** it is a union of nodes including at least: `paragraph`, `heading`, `image`, `codeBlock`, `blockquote`, `list`, `divider`, `embed`, `gallery`, `callout`, `bookmark`, and `html`

#### Scenario: ContentInline covers nested marks
- **WHEN** inspecting `ContentInline` in `src/content/types.ts`
- **THEN** it includes at least: `text`, `link`, `emphasis`, `strong`, `inlineCode`, and `hardBreak`
- **AND** inline nodes that wrap children (link, emphasis, strong) have a `children: ContentInline[]` field

#### Scenario: ContentTree root is an array of blocks
- **WHEN** inspecting `ContentTree`
- **THEN** it is `ContentBlock[]` — an ordered sequence of block-level nodes

#### Scenario: Heading carries a level
- **WHEN** inspecting the `heading` block
- **THEN** its `level` field is `2 | 3 | 4 | 5 | 6`
- **AND** level 1 is excluded (titles are represented by canonical `Post.title`, not as a heading node)

### Requirement: HTML escape hatch for unknown patterns

The project SHALL include an `{ type: "html"; html: string }` block in the `ContentBlock` union so that adapters can defer unknown or unsupported Ghost card patterns to a sanitized raw-HTML render without failing translation.

#### Scenario: Escape hatch covers unknown kg-* classes
- **WHEN** the Ghost HTML translator encounters a card class it does not translate to a first-class node
- **THEN** it produces `{ type: "html"; html: string }` with the original markup for the renderer to sanitize and embed

#### Scenario: Canvas for future Ghost card promotion
- **WHEN** Ghost adds a new card class in a future release
- **THEN** the translator continues to produce a valid `ContentTree` rather than throwing, with the new card passing through the escape hatch

### Requirement: Image block carries Cloudinary-detectable fields

The project SHALL include `src`, `alt`, optional `caption`, optional `width`, and optional `height` on the `image` block. The `src` field SHALL preserve the raw URL so that downstream components can detect Cloudinary URLs and emit transformed variants.

#### Scenario: Image block fields
- **WHEN** inspecting the `image` block in `ContentBlock`
- **THEN** it has `src: string`, `alt: string`, optional `caption: string`, optional `width: number`, and optional `height: number`

### Requirement: codeBlock carries highlightedHtml populated by the adapter

The project SHALL include `language`, `code`, and optional `highlightedHtml` on the `codeBlock` block. The `highlightedHtml` SHALL be populated by the adapter during translation via the syntax-highlighting pass and SHALL be ignored (rendered no-op) if absent.

#### Scenario: codeBlock shape
- **WHEN** inspecting the `codeBlock` block in `ContentBlock`
- **THEN** it has `language?: string`, `code: string`, and `highlightedHtml?: string`

#### Scenario: Renderer falls back gracefully
- **WHEN** a `codeBlock` node lacks `highlightedHtml` (e.g., from an unbuilt or unauthenticated run)
- **THEN** the renderer renders `<pre><code>{node.code}</code></pre>` with no XSS risk
