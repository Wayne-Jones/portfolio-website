## 1. Dependencies

- [ ] 1.1 Install `parse5` (HTML5 parser), `shiki` (syntax highlighter), and `isomorphic-dompurify` (HTML escape-hatch sanitizer) as dev dependencies
- [ ] 1.2 Verify imports stay on the Node-only / build-time side by reading their entry points to confirm no client-bundle pull-through

## 2. Canonical Types

- [ ] 2.1 Add `ContentBlock`, `ContentInline`, and `ContentTree` to `src/content/types.ts` as discriminated unions following the spec
- [ ] 2.2 Update `Post.content`, `Project.content`, and `PhotoSet.content` types from `string` to `ContentTree`
- [ ] 2.3 Export the new types from `src/content/index.ts`
- [ ] 2.4 Verify the existing `MockAdapter` compiles by upgrading its fixtures to match the new shape

## 3. Ghost HTML → ContentTree

- [ ] 3.1 Create `src/content/adapters/ghost-html-to-tree.ts` exporting `htmlToTree(html: string): Promise<ContentTree>`
- [ ] 3.2 Implement paragraph handling — `<p>` blocks map to `paragraph`
- [ ] 3.3 Implement heading handling — `<h2>` through `<h6>` map to `heading` with `id` generated from text slug if missing
- [ ] 3.4 Implement image handling — `<figure class="kg-image-card">` maps to `image`, with `alt` from `<img alt>` and `caption` from `<figcaption>` text
- [ ] 3.5 Implement blockquote handling — `<blockquote>` maps to `blockquote` with nested children
- [ ] 3.6 Implement list handling — `<ul>`/`<ol>` map to `list` with `ordered` boolean and items as `ContentBlock[][]`
- [ ] 3.7 Implement divider handling — `<hr>` maps to `divider`
- [ ] 3.8 Implement embed handling — `<figure class="kg-embed-card">` parses YouTube/Twitter/CodePen/Generic and maps to `embed`
- [ ] 3.9 Implement gallery handling — `<figure class="kg-gallery-card">` parses multiple `<img>` rows into `gallery.images[]`
- [ ] 3.10 Implement callout handling — `<div class="kg-callout-card">` parses variant class (info/warning/success) into `callout`
- [ ] 3.11 Implement bookmark handling — `<div class="kg-bookmark-card">` parses link, title, description, image
- [ ] 3.12 Implement code handling — `<pre><code class="language-X">` maps to `codeBlock` with `language` from class
- [ ] 3.13 Implement inline handling — strong `<strong>`, emphasis `<em>`, link `<a>`, code `<code>` resolve to `strong/emphasis/link/inlineCode` on `paragraph`/`heading` children
- [ ] 3.14 Implement fallback — any non-recognized `kg-*` class produces `{ type: "html", html: ...}` with raw outerHTML

## 4. Syntax Highlighting Pass

- [ ] 4.1 Create `src/content/highlight.ts` exporting `getHighlighter()` and `highlightCodeBlocks(tree: ContentTree)`
- [ ] 4.2 Configure Shiki theme to `github-light` (or `github-dark` — pick one for now; theme toggle can come later)
- [ ] 4.3 Configure the highlighter with a whitelisted language subset: `javascript`, `typescript`, `tsx`, `jsx`, `json`, `html`, `css`, `bash`, `markdown`, `python`
- [ ] 4.4 Cache the highlighter instance module-scope
- [ ] 4.5 Implement `highlightCodeBlocks` to walk the tree and set `highlightedHtml` on each `codeBlock` node
- [ ] 4.6 Skip highlighting for empty code or unknown languages
- [ ] 4.7 Verify Shiki output includes `class="language-X"` on the wrapping `<pre>` element

## 5. Adapter Updates

- [ ] 5.1 Update `GhostAdapter.mapPost` to call `htmlToTree(post.html ?? "")` followed by `highlightCodeBlocks(tree)` before returning the `Post`
- [ ] 5.2 Update `GhostAdapter.mapProject` and `mapPhotoSet` to use the same translator + highlighter pipeline
- [ ] 5.3 Update `MockAdapter` to construct sample trees (at least: a paragraph with a link and inlineCode, a heading, an image, a code block)
- [ ] 5.4 Verify Mock's compiled output matches the ContentTree shape (run `tsc`)

## 6. Renderer Components

- [ ] 6.1 Create `src/components/content/PostBody.tsx` as the dispatcher with a `switch` on `block.type` and `default: never` exhaustiveness
- [ ] 6.2 Create an internal `<Inline>` recursive component in `PostBody.tsx` for `ContentInline[]`
- [ ] 6.3 Add internal link detection logic — relative paths use TanStack Router's `<Link>`; external links use `<a target="_blank" rel="noopener noreferrer">`
- [ ] 6.4 Create `src/components/content/nodes/Paragraph.tsx`
- [ ] 6.5 Create `src/components/content/nodes/Heading.tsx` with auto-generated `id` from text slug and anchor link
- [ ] 6.6 Create `src/components/content/nodes/FigureImage.tsx` with Cloudinary URL detection
- [ ] 6.7 Create `src/components/content/nodes/CodeBlock.tsx` rendering `highlightedHtml` via innerHTML, falling back to plain `<pre><code>`
- [ ] 6.8 Create `src/components/content/nodes/PullQuote.tsx` with editorial styling hooks
- [ ] 6.9 Create `src/components/content/nodes/List.tsx` handling both ordered and unordered
- [ ] 6.10 Create `src/components/content/nodes/Divider.tsx` with decorative ornament class hook
- [ ] 6.11 Create `src/components/content/nodes/Embed.tsx` with provider dispatcher (YouTube lazy-iframe, Twitter blockquote, generic iframe)
- [ ] 6.12 Create `src/components/content/nodes/Gallery.tsx` reusing the existing photography masonry layout
- [ ] 6.13 Create `src/components/content/nodes/Callout.tsx` with variant styling
- [ ] 6.14 Create `src/components/content/nodes/BookmarkCard.tsx` rendering as a desktop card
- [ ] 6.15 Create `src/components/content/nodes/HtmlFallback.tsx` with DOMPurify sanitization

## 7. Cloudinary URL Detection

- [ ] 7.1 Add utilities in `src/components/content/lib/cloudinary.ts` for emitting `srcset` from a Cloudinary base URL
- [ ] 7.2 Generate width variants `400`, `800`, `1200`, `1600` with `/c_scale,w_<N>/` insertion
- [ ] 7.3 Read `VITE_CLOUDINARY_CLOUD_NAME` and only match URLs containing that segment
- [ ] 7.4 Document the env var in `.env.example` and README

## 8. Verification

- [ ] 8.1 Unit tests: every block type maps correctly from sample HTML to `ContentTree`
- [ ] 8.2 Unit tests: every leaf component renders the expected JSX for sample inputs
- [ ] 8.3 Build verification: `pnpm lint`, `pnpm build` clean
- [ ] 8.4 Bundle verification: `grep -R "shiki" dist/` returns no matches in client-bundled JS
- [ ] 8.5 Bundle verification: client bundle does not contain the value of `VITE_GHOST_CONTENT_API_KEY`
- [ ] 8.6 Visual QA: temporarily mount `<PostBody content={sampleTree} />` on a draft route and visually verify each node type renders (Chrome DevTools snapshot + viewport screenshots)

## 9. Documentation

- [ ] 9.1 Document the canonical `ContentTree` shape in a comment block at the top of `src/content/types.ts`
- [ ] 9.2 Add a section to the renderer README explaining how to add a new node type (consistency with the rest of the leaf components)
- [ ] 9.3 Document the `VITE_CLOUDINARY_CLOUD_NAME` env var and how `FigureImage` dispatches on it
