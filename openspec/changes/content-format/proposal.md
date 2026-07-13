## Why

The site is structurally ready to display blog posts, project case studies, and photo sets from Ghost, but the content rendering layer cannot yet convert Ghost's HTML into anything richer than a single `dangerouslySetInnerHTML` blob. This means no Tailwind typography styling carries through, no lazy loaded images, no syntax highlighting on code samples, no per-block view transitions, and no way to do anything cross-CMS portable. We also cannot switch to Sanity or Contentful without rewriting the render layer.

The fix is a canonical content tree — a structured, CMS-agnostic representation of post bodies — that the Ghost adapter produces and the React render tree consumes. This change introduces that tree, the Ghost HTML → tree translator, the component library that turns tree nodes into real React components, and the Shiki-based syntax highlighting pass that runs at build time in the adapter.

## What Changes

- Define `ContentTree`, `ContentBlock`, and `ContentInline` types in `src/content/types.ts` covering the common HTML semantics and Ghost-specific card classes we need to support.
- Add a new field type `html` as an escape hatch for unknown patterns.
- Replace `Post.content`, `Project.content`, and `PhotoSet.content` types: from `string` to `ContentTree`.
- Add a Ghost HTML → `ContentTree` translator (`src/content/adapters/ghost-html-to-tree.ts`) using a parser (`parse5` or `htmlparser2`), class-name sniffing for Ghost cards (`kg-image-card`, `kg-gallery-card`, `kg-embed-card`, `kg-callout-card`, `kg-bookmark-card`), and inline-mark resolution (strong/em/code/link).
- Update `GhostAdapter.mapPost/mapProject/mapPhotoSet` to run the translator, then a Shiki pass over every `codeBlock` node to embed highlighted HTML in the `highlightedHtml` field.
- Update `MockAdapter` to construct sample `ContentTree` literals (so the mock teaches the canonical tree shape).
- Add `src/components/content/PostBody.tsx` — a dispatcher component that walks the canonical tree and renders each node via a leaf component.
- Add leaf components in `src/components/content/nodes/`: `Paragraph`, `Heading`, `FigureImage`, `CodeBlock`, `PullQuote`, `List`, `Divider`, `Embed`, `Gallery`, `Callout`, `BookmarkCard`, `HtmlFallback`. Includes Cloudinary URL detection for responsive `srcset` emission in `FigureImage`.
- Install dependencies: `parse5` (or `htmlparser2`), `shiki`, `isomorphic-dompurify` for sanitizing the HTML escape hatch.
- Update the homepage loader to use the canonical tree shape — no-op, since the homepage only uses excerpts for tile cards — and add `<PostBody />` to the detail route stubs (rendered body is wired in `detail-routes`, this change only shapes the renderer and types).

This change does **not** wire detail routes to fetch and render post bodies (those are placeholders). That comes in `detail-routes`. It also does **not** paginate listings (also `detail-routes`).

## Capabilities

### New Capabilities
- `content-tree`: A structured, CMS-agnostic representation of post bodies (`ContentTree`, `ContentBlock`, `ContentInline` types).
- `content-renderer`: The React render tree (`<PostBody />` and its leaf components) that consumes `ContentTree` and produces styled output.
- `syntax-highlighting`: Build-time syntax highlighting via Shiki, applied at the adapter level so the renderer is async-free.

### Modified Capabilities
- `content-adapter`: Update the `GhostAdapter` to translate HTML output into the canonical content tree, and update the canonical `Post`, `Project`, and `PhotoSet` types to use `content: ContentTree`. The `MockAdapter` returns tree literals as well.

## Impact

- New dev dependencies: `shiki` (build-time only, not bundled; ~3MB theme/language data selected per code block processed), `parse5` (or `htmlparser2` if smaller; bundle impact if any should be measured at build). `isomorphic-dompurify` for the HTML escape hatch. (Approximate: `shiki` is build-time only, `parse5` adds ~30KB if it creeps into the client bundle — keep it server-side.)
- The `GhostAdapter` becomes async during translation (Shiki loading is async). `MockAdapter` returns synchronously-constructed tree literals.
- Type additions live alongside `content-adapter` and extend the existing interface's return types.
- Render layer introduces one new dispatcher component and ~12 leaf components, all in `src/components/content/`. They consume no CMS-specific types.
- Sanity / Contentful adapters are not part of this change but their existence becomes trivial later: the canonical types are already defined; only the source-format-specific translator differs.
- The `html` escape hatch means we never throw on unknown Ghost patterns — unknown `kg-*` cards defer to a sanitized raw-HTML render until a later change promotes them to first-class nodes.
