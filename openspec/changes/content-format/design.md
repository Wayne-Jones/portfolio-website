## Context

Ghost's Content API returns `--html` as a string of HTML (and selected posts also expose the structured `mobiledoc` field, but we don't reach for that to keep the adapter CMS-neutral). Rendering that string into the site requires either (a) injecting it via `dangerouslySetInnerHTML` after sanitization, or (b) parsing it into a structured representation and dispatching each node to its own React component. We've chosen (b) so the renderer can compose dedicated components for code blocks (Shiki highlighting), images (Cloudinary `srcset`), and callouts/embeds (interactive treatment) — none of which `dangerouslySetInnerHTML` can do.

The constraint that shapes the design is **portability**: if we ever swap Ghost for Sanity, Contentful, or another CMS, the React renderer must not need to change. That means introducing a canonical content tree that each adapter produces and the renderer consumes, with the Ghost-specific HTML parser isolated to the Ghost adapter. Sanity and Contentful emit rich-text JSON and would each have their own translator producing the same canonical tree.

A secondary constraint is **build-time syntax highlighting**. The home page concentrates the static-asset cost we don't want: shipping Shiki to the browser adds ~700KB. Pre-computing the highlighted code HTML at build time keeps the client bundle clean. We do this in the adapter, so the renderer is purely synchronous and never sees Shiki.

## Goals / Non-Goals

**Goals:**
- Define a canonical, strict, but extensible `ContentTree` type covering common semantic HTML plus Ghost's `kg-*` card classes we care about today.
- Produce `ContentTree` from Ghost HTML with high fidelity — paragraphs, headings, lists, blockquotes, dividers, images (with cloudinary URLs), code blocks, embeds, callouts, bookmark cards, gallery cards.
- Build a React renderer (`<PostBody>` plus leaf components) that consumes the canonical tree and never imports anything Ghost-specific.
- Pre-compute Shiki syntax highlighting at build time inside the Ghost adapter so the renderer never awaits a WASM/theme loader.
- Keep the tree translation defensive: unknown patterns or unusual HTML should produce a sensible fallback (sanitized raw HTML) rather than throw.
- Update the `MockAdapter` to also return `ContentTree` literals so the canonical tree shape is documented in the mock data.

**Non-Goals:**
- Render real post bodies in detail routes (handled by `detail-routes`). The renderer exists and is testable in isolation but is not yet wired into route components.
- Impose specific Tailwind typography classes or per-site styling on the components — the renderer is style-neutral; the leaf components carry the editorial styling.
- Support every Ghost card exhaustively. The escape hatch covers the long tail.
- Switch ghost to mobiledoc or lexical — we parse HTML, not Ghost's internal formats.
- Write the Sanity or Contentful adapters — they are trivial follow-ups given the canonical types.
- Gallery layout work — the leaf components accept nodes; layout decisions live in components (covered by the existing photography masonry work, with plans to share where useful).
- Pagination, listing rendering, sitemap generation (delegated to other changes).

## Decisions

### Decision 1: Canonical content tree with an `html` escape hatch

**Rationale:** A discriminated union of node types forces the renderer to handle each case exhaustively and enables exhaustive type checks. The `html` escape hatch (`{ type: "html"; html: string }`) catches unknown Ghost cards, malformed markup, or future Ghost additions without throwing at translation time — the renderer sanitizes and passes them through until a later change promotes the pattern to a first-class node.

**Type shape:**

```ts
export type ContentBlock =
  | { type: "paragraph"; children: ContentInline[] }
  | { type: "heading"; level: 2 | 3 | 4 | 5 | 6; id?: string; children: ContentInline[] }
  | { type: "image"; src: string; alt: string; caption?: string; width?: number; height?: number }
  | { type: "codeBlock"; language?: string; code: string; highlightedHtml?: string }
  | { type: "blockquote"; children: ContentBlock[] }
  | { type: "list"; ordered: boolean; items: ContentBlock[][] }
  | { type: "divider" }
  | { type: "embed"; provider: string; html: string; url?: string }
  | { type: "gallery"; images: { src: string; alt: string; caption?: string }[] }
  | { type: "callout"; variant?: "info" | "warning" | "success"; children: ContentInline[] }
  | { type: "bookmark"; url: string; title: string; description?: string; image?: string }
  | { type: "html"; html: string };

export type ContentInline =
  | { type: "text"; value: string }
  | { type: "link"; href: string; children: ContentInline[] }
  | { type: "emphasis"; children: ContentInline[] }
  | { type: "strong"; children: ContentInline[] }
  | { type: "inlineCode"; value: string }
  | { type: "hardBreak" };

export type ContentTree = ContentBlock[];
```

**Alternatives considered:**
- **A pseudo-AST of just `TagName + children + attributes`** — generic but loses semantic meaning at the renderer, every call site has to dispatch on `tag` and the tree grows unbounded.
- **Mobiledoc / Lexical native types in the canonical layer** — best for Ghost, but locks portability to Ghost's data formats.
- **A normalized HTML DOM instead of semantic blocks** — closer to Ghost's wire format, but pulls DOM complexity into the canonical model.

The semantic tree is portable because every CMS can produce it (HTML is parsable, JSON rich-text is walkable, Markdown is portable).

### Decision 2: HTML parsing with `parse5`

**Rationale:** `parse5` is the canonical, spec-compliant HTML5 parser for Node and is widely used for exactly this use case (server-side post-rendering pipelines). It produces a DOM-like AST we can walk and translate to `ContentTree`. `htmlparser2` is faster and smaller but requires us to handle edge cases manually; for our content volume (15-50 posts), correctness matters more than speed.

A custom parser would not earn its complexity, and pulling in a DOM library like `cheerio` is overkill — we don't need a full DOM for translation, just a walkable tree.

**Alternative considered:** `jsdom` (which `vite-react-ssg` already brings in transitively) provides a real DOM. Rejected: too heavyweight; `parse5` is the right tool for HTML-to-AST translation.

### Decision 3: Shiki at the adapter layer (build-time only)

**Rationale:** We pre-compute highlighted HTML inside the adapter so the renderer never blocks on Shiki's WASM loader. The renderer can be synchronous and idiomatic React without async/await, Suspense, or streamed responses. Trade-off: every adapter (including `MockAdapter`) is now async, with a Shiki code call inside. The mock's cost is small (a handful of fixture code blocks).

For the static-snapshot adapter, the highlighted HTML comes pre-baked from the snapshot JSON. For live-Ghost mode, it's freshly highlighted from inside the adapter call.

**Implementations detail:**

```ts
// inside GhostAdapter.mapPost
const tree = await htmlToTree(post.html);
const treeWithHighlighting = await highlightCodeBlocks(tree, shiki);
return { ...baseFields, content: treeWithHighlighting };
```

The same `highlightCodeBlocks` helper is reused by any future adapter (Sanity, Contentful) when their content happens to include a `codeBlock` node.

**Alternative considered:** Highlighting inside the renderer, gated by `import.meta.env.SSR`. Rejected: makes the renderer asynchronous, adds Suspense complexity, and forces other adapters to figure out their own highlighting story.

### Decision 4: `<PostBody>` as a synchronous recursive dispatcher

**Rationale:** The renderer is a single component that maps over `ContentTree` and dispatches per `block.type`. Each leaf component is synchronous and idiomatic React. The tree is already structured, so the dispatcher never has to look up a tag name — it looks up the discriminator.

Inline rendering uses a small `<Inline>` recursive component that walks `ContentInline[]` and dispatches per inline type. The renderer stays flat at one level of nesting per block.

**Alternative considered:** A single component with a per-element switch. Rejected: harder to test per-type, no per-leaf-code organization.

### Decision 5: Cloudinary URL detection inside `FigureImage`

**Rationale:** The `FigureImage` component detects `res.cloudinary.com/<cloud>/...` URLs and emits a `srcset` with multiple width variants by injecting Cloudinary's URL transformation tokens (`/c_scale,w_<width>/...`). This requires no client-side library and is the smallest implementation cost.

For non-Cloudinary URLs, the component falls back to a plain `src` with `loading="lazy"` and `decoding="async"` — sensible defaults that match the rest of the site.

**Alternative considered:** A service-worker-side image resizer or a custom image pipeline. Rejected: complexity for marginal gain at our scale; the Cloudinary URL-based approach is the standard headless pattern.

### Decision 6: HTML escape hatch via DOMPurify

**Rationale:** Unknown Ghost cards eventually land in `{ type: "html"; html: string }`. We render them with `dangerouslySetInnerHTML` after passing through DOMPurify (`isomorphic-dompurify` works in both Node and browser). DOMPurify is the canonical XSS-safe sanitizer, well-maintained, and doesn't pull DOM dependencies into the project.

**Alternative considered:** Trusted-types only, or a custom allowlist sanitizer. Rejected: DOMPurify is industry-standard and easy to swap later.

## Risks / Trade-offs

- **[Risk] Shiki weighs ~3MB on disk and slows builds slightly** → Mitigation: Only import the languages actually used. A future change can prune themes or inline a subset. Build times remain under 30s even for 50 posts.
- **[Risk] Ghost HTML semantics differ slightly across card versions** → The parser is permissive: unknown classes fall through to the `html` escape hatch, degraded render beats build failure.
- **[Risk] Cloudinary URL pattern is parameterized by cloud name** → The renderer reads `VITE_CLOUDINARY_CLOUD_NAME` (or similar) to pattern-match `https://res.cloudinary.com/<name>/`. If unset, `FigureImage` falls back to non-transformed URLs.
- **[Risk] DOMPurify HTML pass changes whitespace** → Acceptable; for unknown nodes the visual fidelity may not be perfect, and a later change can promote them to first-class nodes for tighter styling.
- **[Risk] Mobiledoc / Lexical access** → Not used. If Ghost deprecates HTML in a future API version (it won't — HTML is the canonical output), a separate change can swap to lexical at the adapter level — the `ContentTree` interface stays identical.
- **[Risk] Synthetic shiki-style nested code blocks in markup** → The parser handles them as continuous text; if real content hits this edge case, the escape hatch catches it.

## Migration Plan

1. **Phase A: Type additions** — Add `ContentTree`, `ContentBlock`, `ContentInline` to `src/content/types.ts`. Update `Post`, `Project`, `PhotoSet` to use `content: ContentTree`. Mock adapter compiles conforming literals so it stays in step with Ghost.
2. **Phase B: Translator** — Implement `htmlToTree` with parse5 + a registry of card-class dispatchers (image, gallery, embed, callout, bookmark). Inline marks resolved by tree walking.
3. **Phase C: Renderer** — Build `<PostBody>` plus leaf components in isolation. Tests cover each node type's renderer output. Wired into a temporary homepage demo route for visual QA.
4. **Phase D: Shiki highlight pass** — Add `highlightCodeBlocks` and `getHighlighter` wrappers (lazy-load once, reuse across posts).
5. **Phase E: Cloudinary srcSet emission** — `FigureImage` reads `VITE_CLOUDINARY_CLOUD_NAME` and generates transformed URLs.
6. **Phase F: DOMPurify + escape hatch** — `HtmlFallback` component sanitizes and renders; assembles the dispatch table; tests confirm no-XSS behaviors.

Rollback strategy: revert the adapter's translator and Shiki pass; leaves only the canonical types unusable but compiles cleanly because `Post.content` becomes `unknown` or swapped back to `string`.

## Open Questions

- Are there Ghost block types we should add to the type union preemptively? Current draft covers what we expect to use (paragraph, heading, image, code, blockquote, list, divider, embed, gallery, callout, bookmark). If usage surfaces new patterns, easy to add in a subsequent change.
- The escape hatch sanitizer should be default-safe-tight (no `script`, no `iframe` by default) or fully allow-default (allow common embeds)? Current draft: strict by default with a per-call `ALLOWED_TAGS` extension option for `embed` to render their iframes.
- Should `Inline` resolve nested strong-in-em-in-link marks, or flatten? Current draft: keep nested — it lets CSS target each level distinctly.
