# Content Renderer

## Purpose

Define the React components that turn a `ContentTree` into the actual rendered post body for the user. The renderer is the only consumer of the canonical tree in the application; it never references any CMS-specific source format.

## Requirements

### Requirement: PostBody dispatcher

The project SHALL ship a `<PostBody />` component that maps over the `ContentTree` and dispatches each block to a leaf component based on its discriminator. The component SHALL be placed in `src/components/content/PostBody.tsx` and SHALL NOT depend on any CMS-specific module.

#### Scenario: Dispatcher is exhaustive
- **WHEN** a `ContentBlock` is added with a new shape in future work
- **THEN** the `<PostBody />` dispatcher fails to compile until a `case` for that node type is added
- **AND** the `default` case uses a `never`-type assertion to enforce exhaustiveness

#### Scenario: Dispatcher accepts content as a prop
- **WHEN** `<PostBody content={tree} />` is rendered
- **THEN** the components render in tree order with the correct leaf for each block type

### Requirement: Inline renderer walks nested marks

The project SHALL ship an `<Inline />` recursive component that walks a `ContentInline[]` array and dispatches each node to its appropriate inline element (text, link, emphasis, strong, code).

#### Scenario: Nested marks render correctly
- **WHEN** a `paragraph` block contains a content node like `<a><strong><em>text</em></strong></a>`
- **THEN** the corresponding `ContentInline` tree renders the appropriate nested React elements

#### Scenario: Links resolve to ReactRouter `<Link>`
- **WHEN** a `link` inline node has an internal `href` (relative path starting with `/` or non-protocol-prefixed path)
- **THEN** the renderer uses TanStack Router's `<Link>` component for SPA navigation
- **AND** external `href` values (containing `://` or starting with `mailto:`) render with a regular `<a>` and `target="_blank"` (with `rel="noopener noreferrer"` for `http(s)` links)

### Requirement: Leaf components live under src/components/content/nodes/

The project SHALL ship one leaf component per `ContentBlock` discriminator under `src/components/content/nodes/`. Each leaf accepts the typed node and returns JSX; no leaf contains CMS-specific logic.

#### Scenario: Leaf components follow the union
- **WHEN** inspecting `src/components/content/nodes/`
- **THEN** at least these files exist with the same names as block discriminators: `Paragraph.tsx`, `Heading.tsx`, `FigureImage.tsx`, `CodeBlock.tsx`, `PullQuote.tsx`, `List.tsx`, `Divider.tsx`, `Embed.tsx`, `Gallery.tsx`, `Callout.tsx`, `BookmarkCard.tsx`, `HtmlFallback.tsx`

### Requirement: FigureImage detects Cloudinary URLs and emits srcset

The `FigureImage` component SHALL detect URLs pointing at `res.cloudinary.com/<cloudName>/image/upload/...` (where `<cloudName>` is configured via the `VITE_CLOUDINARY_CLOUD_NAME` env var) and SHALL emit a `srcset` derived from the source URL by inserting Cloudinary transformation tokens (`c_scale,w_<N>/`) at the standard image-variant position.

#### Scenario: Cloudinary URL produces srcset
- **WHEN** `<FigureImage />` receives an `image` node with `src` matching the Cloudinary pattern
- **THEN** the rendered `<img>` element has `srcset="..."` containing width variants `w_400`, `w_800`, `w_1200`, and `w_1600` with `c_scale`
- **AND** the `src` attribute is the variant URL closest in width to the responsive size

#### Scenario: Non-Cloudinary URL falls back
- **WHEN** the `src` URL does not match the configured Cloudinary pattern
- **THEN** the rendered `<img>` element uses the original `src` as both `src` and as a fallback
- **AND** includes `loading="lazy"` and `decoding="async"` attributes

#### Scenario: Lazy loading by default
- **WHEN** any `image` block is rendered
- **THEN** the produced `<img>` element sets `loading="lazy"` (unless `eagerly`-flagged by the caller — defer to detail-routes for the eager above-the-fold case)

### Requirement: CodeBlock renders pre-highlighted HTML

The `CodeBlock` component SHALL render the `highlightedHtml` field via `dangerouslySetInnerHTML` when present, and SHALL fall back to `<pre><code>{node.code}</code></pre>` when absent. The component SHALL NOT import Shiki at runtime.

#### Scenario: Highlighted HTML renders verbatim
- **WHEN** a `codeBlock` node has `highlightedHtml`
- **THEN** the rendered output is `{ dangerouslySetInnerHTML: { __html: node.highlightedHtml } }`

#### Scenario: Fallback for unhighlighted code
- **WHEN** a `codeBlock` node has no `highlightedHtml`
- **THEN** the rendered output is `<pre><code>{node.code}</code></pre>` with no XSS since the input is plain text

### Requirement: HtmlFallback sanitizes via DOMPurify

The `HtmlFallback` component SHALL pass the `html` field through `isomorphic-dompurify` before rendering via `dangerouslySetInnerHTML`, and SHALL default to a deny-list that strips `<script>`, `on*` event attributes, and `javascript:` URLs.

#### Scenario: Unknown Ghost card renders sanitized
- **WHEN** an unknown Ghost card class lands in `{ type: "html"; html: string }`
- **THEN** `<HtmlFallback />` sanitizes the string before rendering
- **AND** `<script>` tags, inline event handlers, and `javascript:` URLs are removed

#### Scenario: Embed iframes are allowed
- **WHEN** an `<iframe>` element is the legitimate payload of an `embed` block (not the fallback)
- **THEN** rendering uses the `Embed` component (not `HtmlFallback`) and embeds the iframe directly

### Requirement: PullQuote blockquote styling

The `blockquote` block SHALL map to a `PullQuote` component that renders the nested content with editorial pull-quote styling (large type, italic accent, decorative quote mark) consistent with the homepage's section spacing rhythm.

#### Scenario: Blockquote renders nested content
- **WHEN** a `blockquote` block has child blocks (e.g., paragraphs and headings)
- **THEN** the `PullQuote` component renders the children recursively via the same `<PostBody />` dispatcher loop

### Requirement: Gallery renders an image grid

The `gallery` block SHALL map to a `Gallery` component that lays out its images using the same masonry layout used on the homepage photography section.

#### Scenario: Gallery uses masonry
- **WHEN** a `gallery` block has three or more images
- **THEN** the images are laid out via CSS columns masonry with intrinsic aspect ratios preserved
- **AND** each image renders via `FigureImage` (so Cloudinary srcsets apply)

### Requirement: Embed dispatcher

The `Embed` component SHALL inspect the `provider` field of an `embed` block and render the appropriate iframe/dispatcher:
- `youtube` → lazy-iframe for the `youtube.com/embed/...` URL
- `twitter` → blockquote with citation link (no script tag in renderer)
- `codepen` → iframe with hidden theme defaults
- `generic` → iframe with the raw html

#### Scenario: YouTube embed
- **WHEN** an `embed` block has `provider: "youtube"` and `html` containing an `iframe[src="https://www.youtube.com/embed/<id>"]`
- **THEN** `<Embed />` renders a lazy-positioned iframe with `loading="lazy"` and `allow="accelerometer; encrypted-media; picture-in-picture"`

#### Scenario: Unknown provider falls back
- **WHEN** an `embed` block has `provider: "unknown"` or no recognized provider
- **THEN** `<Embed />` renders the raw `html` as-is (after sanitizeHtml safety pass)
