## 1. Dependencies

- [x] 1.1 Install `parse5` (HTML5 parser) and `shiki` (syntax highlighter) as dev dependencies (build-time only), and `isomorphic-dompurify` (HTML escape-hatch sanitizer) as a runtime dependency used by the renderer
- [x] 1.2 Verify imports stay on the Node-only / build-time side by reading their entry points to confirm no client-bundle pull-through

## 2. Canonical Types

- [x] 2.1 Add `ContentBlock`, `ContentInline`, and `ContentTree` to `src/content/types.ts` as discriminated unions following the spec
- [x] 2.2 Update `Post.content`, `Project.content`, and `PhotoSet.content` types from `string` to `ContentTree`
- [x] 2.3 Export the new types from `src/content/index.ts`
- [x] 2.4 Verify the existing `MockAdapter` compiles by upgrading its fixtures to match the new shape

## 3. Ghost HTML → ContentTree

- [x] 3.1 Create `src/content/adapters/ghost-html-to-tree.ts` exporting `htmlToTree(html: string): Promise<ContentTree>`
- [x] 3.2 Implement paragraph handling — `<p>` blocks map to `paragraph`
- [x] 3.3 Implement heading handling — `<h2>` through `<h6>` map to `heading` with `id` generated from text slug if missing
- [x] 3.4 Implement image handling — `<figure class="kg-image-card">` maps to `image`, with `alt` from `<img alt>` and `caption` from `<figcaption>` text
- [x] 3.5 Implement blockquote handling — `<blockquote>` maps to `blockquote` with nested children
- [x] 3.6 Implement list handling — `<ul>`/`<ol>` map to `list` with `ordered` boolean and items as `ContentBlock[][]`
- [x] 3.7 Implement divider handling — `<hr>` maps to `divider`
- [x] 3.8 Implement embed handling — `<figure class="kg-embed-card">` parses YouTube/Twitter/CodePen/Generic and maps to `embed`
- [x] 3.9 Implement gallery handling — `<figure class="kg-gallery-card">` parses multiple `<img>` rows into `gallery.images[]`
- [x] 3.10 Implement callout handling — `<div class="kg-callout-card">` parses variant class (info/warning/success) into `callout`
- [x] 3.11 Implement bookmark handling — `<div class="kg-bookmark-card">` parses link, title, description, image
- [x] 3.12 Implement code handling — `<pre><code class="language-X">` maps to `codeBlock` with `language` from class
- [x] 3.13 Implement inline handling — strong `<strong>`, emphasis `<em>`, link `<a>`, code `<code>` resolve to `strong/emphasis/link/inlineCode` on `paragraph`/`heading` children
- [x] 3.14 Implement fallback — any non-recognized `kg-*` class produces `{ type: "html", html: ...}` with raw outerHTML

## 4. Syntax Highlighting Pass

- [x] 4.1 Create `src/content/highlight.ts` exporting `getHighlighter()` and `highlightCodeBlocks(tree: ContentTree)`
- [x] 4.2 Configure Shiki theme to `github-light` (or `github-dark` — pick one for now; theme toggle can come later)
- [x] 4.3 Configure the highlighter with a whitelisted language subset: `javascript`, `typescript`, `tsx`, `jsx`, `json`, `html`, `css`, `bash`, `markdown`, `python`
- [x] 4.4 Cache the highlighter instance module-scope
- [x] 4.5 Implement `highlightCodeBlocks` to walk the tree and set `highlightedHtml` on each `codeBlock` node
- [x] 4.6 Skip highlighting for empty code or unknown languages
- [x] 4.7 Verify Shiki output includes `class="language-X"` on the wrapping `<pre>` element

## 5. Adapter Updates

- [x] 5.1 Update `GhostAdapter.mapPost` to call `htmlToTree(post.html ?? "")` followed by `highlightCodeBlocks(tree)` before returning the `Post`
- [x] 5.2 Update `GhostAdapter.mapProject` and `mapPhotoSet` to use the same translator + highlighter pipeline
- [x] 5.3 Update `MockAdapter` to construct sample trees (at least: a paragraph with a link and inlineCode, a heading, an image, a code block)
- [x] 5.4 Verify Mock's compiled output matches the ContentTree shape (run `tsc`)

## 6. Renderer Components

- [x] 6.1 Create `src/components/content/PostBody.tsx` as the dispatcher with a `switch` on `block.type` and `default: never` exhaustiveness
- [x] 6.2 Create an internal `<Inline>` recursive component in `PostBody.tsx` for `ContentInline[]`
- [x] 6.3 Add internal link detection logic — relative paths use TanStack Router's `<Link>`; external links use `<a target="_blank" rel="noopener noreferrer">`
- [x] 6.4 Create `src/components/content/nodes/Paragraph.tsx`
- [x] 6.5 Create `src/components/content/nodes/Heading.tsx` with auto-generated `id` from text slug and anchor link
- [x] 6.6 Create `src/components/content/nodes/FigureImage.tsx` with Cloudinary URL detection
- [x] 6.7 Create `src/components/content/nodes/CodeBlock.tsx` rendering `highlightedHtml` via innerHTML, falling back to plain `<pre><code>`
- [x] 6.8 Create `src/components/content/nodes/PullQuote.tsx` with editorial styling hooks
- [x] 6.9 Create `src/components/content/nodes/List.tsx` handling both ordered and unordered
- [x] 6.10 Create `src/components/content/nodes/Divider.tsx` with decorative ornament class hook
- [x] 6.11 Create `src/components/content/nodes/Embed.tsx` with provider dispatcher (YouTube lazy-iframe, Twitter blockquote, generic iframe)
- [x] 6.12 Create `src/components/content/nodes/Gallery.tsx` reusing the existing photography masonry layout
- [x] 6.13 Create `src/components/content/nodes/Callout.tsx` with variant styling
- [x] 6.14 Create `src/components/content/nodes/BookmarkCard.tsx` rendering as a desktop card
- [x] 6.15 Create `src/components/content/nodes/HtmlFallback.tsx` with DOMPurify sanitization

## 7. Cloudinary URL Detection

- [x] 7.1 Add utilities in `src/components/content/lib/cloudinary.ts` for emitting `srcset` from a Cloudinary base URL
- [x] 7.2 Generate width variants `400`, `800`, `1200`, `1600` with `/c_scale,w_<N>/` insertion
- [x] 7.3 Read `VITE_CLOUDINARY_CLOUD_NAME` and only match URLs containing that segment
- [x] 7.4 Document the env var in `.env.example` and README

## 8. Verification

- [x] 8.1 Unit tests: every block type maps correctly from sample HTML to `ContentTree`
- [x] 8.2 Unit tests: every leaf component renders the expected JSX for sample inputs
- [x] 8.3 Build verification: `pnpm lint`, `pnpm build` clean
- [x] 8.4 Bundle verification: `grep -R "shiki" dist/` returns no matches in client-bundled JS
- [x] 8.5 Bundle verification: client bundle does not contain the value of `VITE_GHOST_CONTENT_API_KEY`
- [x] 8.6 Visual QA: temporarily mount `<PostBody content={sampleTree} />` on a draft route and visually verify each node type renders (Chrome DevTools snapshot + viewport screenshots)

## 9. Documentation

- [x] 9.1 Document the canonical `ContentTree` shape in a comment block at the top of `src/content/types.ts`
- [x] 9.2 Add a section to the renderer README explaining how to add a new node type (consistency with the rest of the leaf components)
- [x] 9.3 Document the `VITE_CLOUDINARY_CLOUD_NAME` env var and how `FigureImage` dispatches on it
