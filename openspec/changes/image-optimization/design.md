## Context

The renderer's `FigureImage` already produces a Cloudinary `srcset` for inline post images using widths 400/800/1200/1600. Detail-page heroes and the homepage's contact/tile overlays don't go through that path: they use a single `<img>` or a CSS `background-image` URL with no width negotiation, no priority hint, and no placeholder. Cloudinary's whole point is per-request URL transforms; right now we're getting only the default image delivery. The hero LCP score on a cold load is bottlenecked by 2MB-of-original-image transfer before paint.

This change deepens the renderer's image-handling story without expanding the canonical `ContentTree` shape. The `image` block stays the same; what's consumed gets smarter. The opportunity is targeted polish, not architectural restructuring.

Our content volume is small (~15-50 posts), so we don't need aggressive fancy things like responsive LQIP generation pipelines. Cloudinary's on-the-fly transforms are sufficient. The change reduces work a real browser does on a real visit by:

1. **Negotiating format automatically via `f_auto`** — same transforms we've talked about. Means the browser receives AVIF/WebP where supported.
2. **Negotiating width via `srcset`** — choosing the smallest variant that still satisfies the screen.
3. **Prioritizing the hero fetch** — `fetchpriority="high"` for above-the-fold images so the browser doesn't put them at the same level as the rest of the content.
4. **Locking aspect ratio** — preventing CLS while the large image loads.
5. **Blur-up placeholder** — a tiny heavily-blurred variant (~1KB) shown while the full image loads, then fades out.

Each of these is well-understood and standard for headless portfolios.

## Goals / Non-Goals

**Goals:**
- `FigureImage` accepts a `priority` prop (default false) that controls fetch behavior and emits a wider `srcset` for hero contexts.
- Hero images on detail pages render via a new `<HeroImage>` wrapper that:
  - Uses `fetchpriority="high"` + `loading="eager"` + `decoding="sync"`
  - Locks aspect ratio to prevent CLS
  - Emits a wider variant set (up to 3200w for retina)
- A blur-up placeholder strategy based on a tiny Cloudinary variant with `e_blur:1000`.
- The same Cloudinary URL detection in `FigureImage` extends to a `BackgroundImage` component for the homepage's tile hover overlays and similar CSS-background contexts.
- A `useCloudinaryImage` hook consolidates variant generation so the URL transforms live in one place.
- Document the env-var setup and how to add new variants or use contexts.

**Non-Goals:**
- Touching the canonical `ContentTree` shape or the adapter. The change is downstream of those capabilities.
- Building an image-processing service worker or runtime image pipeline.
- Adding responsive art direction (different crops for mobile vs. desktop). Same image, different transforms.
- Generating a static set of optimized images at build time — Cloudinary does it for us on demand. If Cloudinary costs become a concern at scale, this can come later.
- Adding `AVIF` only-fallbacks or client capability detection — `f_auto` handles that.
- Replacing the existing portfolio/photography masonry as a whole — only the image-optimization primitives are extended.

## Decisions

### Decision 1: `FigureImage` extends with `priority`, not a separate component for inline cases

**Rationale:** The canonical-tree `image` block renders through `FigureImage`. Adding a `priority` prop and additional variant generation keeps one component to test, one component to evolve. The detail-route hero contexts opt in via `<HeroImage>` which wraps `<FigureImage priority={true} />` — a thin wrapper for fixed aspect ratio + accessibility plumbing.

**Alternative considered:** New `InlineImage` vs. `HeroImage` as separate components. Rejected: one component with the right prop shape is easier to reason about than two near-identical components.

### Decision 2: Hero variant width set is 400-3200

**Rationale:** Today's display context peaks at 2560px (the limit we already test in homepage composition). A retina-display 2560px screen rendering a hero needs ~5120 logical px of source to look crisp — that's beyond Cloudinary's free tier in some cases. Practical hero variant set: 400, 800, 1200, 1600, 2400, 3200. Browser uses `sizes` + DPR + actual width to pick the smallest sufficient.

**Alternative considered:** Just 1600/2400/3200 (skip small variants on hero). Rejected: a hero in a sidebar-on-mobile view still benefits from a small variant. We do not yet have such a layout but the small variants cost nothing in HTML bytes.

### Decision 3: Blur-up LQIP with a single Cloudinary URL transform

**Rationale:** A 40px-wide blurred image weighs ~1-2KB. Cloudinary generates it on demand with `w_40,e_blur:1000,q_auto,f_auto,f_auto` appended to the base URL. We render it as the `src` of a placeholder `<img>` styled to fill the parent (with `filter: blur(20px)` and `object-fit: cover`), then swap to the real `<img>` (with `srcset`) on `onload`.

**Implementation shape:**

```
  HeroImage:
    <Container aspect> ←-- CLS-locking wrapper
      <img
        src={blurredPlaceholderUrl} ←-- tiny blurred
        alt=""
        className="absolute inset-0 h-full w-full
                   object-cover blur-2xl scale-110"
        aria-hidden
      />
      <img
        srcSet={sizesVariants}        ←-- real srcset
        sizes={sizesAttribute}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setLoaded(true)}
        className={loadedFade}
        alt={alt}
      />
    </Container>
```

The blurred placeholder is just an `<img>` with `aria-hidden` and `empty alt`, swapped via opacity transition.

**Alternative considered:** Base64 inlined into HTML at build time (no extra request). Rejected: extra complexity for ~1KB savings — request to a CDN is cheap.

### Decision 4: `fetchpriority="high"` is HTML-aligned, not React-only

**Rationale:** Browser support for `fetchpriority` is universal in modern browsers. React pre-empted the attribute with `fetchPriority` (capital P); we use the camelCase API in JSX. No polyfill or fallback needed.

### Decision 5:`sizes` attribute policy is context-aware

**Rationale:** For detail-page hero images, the correct `sizes` is `(min-width: 1024px) 1024px, 100vw`. For inline images inside paragraphs, it's `(min-width: 768px) 720px, 100vw`. For homepage hero, it's `100vw`. The `FigureImage` component accepts a `sizes` prop with a sensible default per usage.

**Alternative considered:** Auto-compute `sizes` from caller context via context API. Rejected: more machinery than the savings warrant.

### Decision 6: `BackgroundImage` adds inline-style for CSS contexts

**Rationale:** Work tiles on the homepage and other CSS-background contexts (some lazy hover overlays, some hero backgrounds) need the same optimization story but applied via `style={{ backgroundImage: 'url(...)' }}` rather than an `<img>`. A `BackgroundImage` component applies `background-image` from one Cloudinary transform (no `srcset` since the browser can't negotiate from background-images) plus a `background-size: cover` and `background-position: center` baseline.

**Alternative considered:** Replace background-images with `<img>` elements and `<picture>` everywhere. Rejected: structural rewrite for clarity, but defeats existing styling.

## Risks / Trade-offs

- **[Risk] Cloudinary's free tier is 25k transformations / month** → A 100-image site with `Responsive Web` + `f_auto` does ~500 transformations per pageview per visitor. Well within the free tier for low-to-moderate traffic. If traffic grows, the project can move to Ghost's native CDN or self-host.
- **[Risk] Blur-up introduces CLS if the real image loads before the placeholder is established** → Mitigation: the placeholder is rendered server-side as part of the static HTML; the moment the HTML is parsed, the placeholder is in the DOM, no later CSS-induced layout shift from insertion.
- **[Risk] `fetchpriority="high"` is advisory only — browsers may still queue a lower-priority image** → Acceptable: even partial benefit is the win; `loading="eager"` ensures eager load regardless.
- **[Risk] Wider variants (2400, 3200) hit cache harder on Cloudinary's side** → Each variant is cached individually; first visitor pays the cost, subsequent visitors hit Cloudinary CDN. Standard CDN behavior, not a concern at our scale.

## Migration Plan

1. **Phase A: Hook re-organization** — Move Cloudinary URL transforms into a single `useCloudinaryImage` hook under `src/components/content/lib/cloudinary.ts`.
2. **Phase B: FigureImage extensions** — Add `priority` and `sizes` props. Extend `srcset` generation when `priority` is true.
3. **Phase C: HeroImage component** — Build the wrapper, apply blur-up.
4. **Phase D: BackgroundImage component** — Build for homepage contexts.
5. **Phase E: Detail routes updated to use HeroImage** — Blog hero, portfolio hero, photo set cover.
6. **Phase F: Documentation** — Add a section to README covering the optimization strategy.

## Open Questions

- Should we add a `decoding="auto"` default in places? Current thinking: `async` by default, `sync` only when `priority` is set. Worth confirming.
- Is `f_auto,f_auto` duplicated transforms worth optimizing? (Hint: it's harmless; Cloudinary deduplicates.) Current thinking: no harm.
- Should we ship a fade-in-only-once flag so the blur-up doesn't keep re-firing on re-renders? It's idiomatic React `useState` plumbing already — defer optimization until measured.
