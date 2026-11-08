## Context

`FigureImage` already produces a Cloudinary `srcset` for inline post images using widths 400/800/1200/1600, `c_scale`, and a 1200px default `src`. What it does not do is distinguish a hero from an inline image: every call site gets lazy loading, four widths, no format negotiation, and no placeholder. All three detail heroes (blog, portfolio, photo set) now render through `ArticleHeader` → `FigureImage`, and the homepage/index tiles render through `TileMedia` → the same Cloudinary helpers. That convergence is why this change can stay inside `FigureImage` instead of adding route-specific wrappers.

Cloudinary's value is per-request transforms; today we use only a fraction of them. The hero dominates LCP on a cold load, so the highest-leverage additions are priority hints, a wider candidate set, `f_auto`/`q_auto`, and a tiny blurred placeholder.

Content volume is small (~15-50 posts), so there is no need for a build-time image pipeline. Cloudinary's on-demand transforms are sufficient.

## Goals / Non-Goals

**Goals:**

- `FigureImage` accepts `priority` (default false) and `sizes`, and emits the extended hero width set when priority is enabled.
- Priority heroes set `fetchpriority="high"`, `loading="eager"`, and `decoding="sync"`.
- Cloudinary variants include `f_auto,q_auto`; already-transformed URLs keep passing through untouched.
- Priority Cloudinary images render a tiny blurred placeholder behind the real image and drop it once the real image loads.
- Hero layout is reserved from the image node's intrinsic `width`/`height`, with an optional `aspectRatio` override.
- `useCloudinaryImage` consolidates variant generation for `FigureImage` and `TileMedia`.
- Detail heroes opt in through `ArticleHeader`; documentation explains the variants and env var.

**Non-Goals:**

- Touching the canonical `ContentTree` shape or the adapter.
- A separate `HeroImage` wrapper, `BackgroundImage` component, or route-specific image components.
- Building an image-processing service worker, runtime image pipeline, or build-time asset generation.
- Responsive art direction (different crops per breakpoint). Same image, different transforms.
- AVIF-only fallbacks or client capability detection — `f_auto` handles format selection.
- Replacing the masonry layouts or changing tile chrome.

## Decisions

### Decision 1: Extend `FigureImage`, not a wrapper

**Rationale:** Blog, portfolio, and photography heroes all reach the renderer through `ArticleHeader` → `FigureImage`, and inline images use the same component. Adding `priority`, `sizes`, and `aspectRatio` keeps one component to test and avoids a wrapper that only forwards props. The previous `HeroImage` requirement is removed.

**Alternative considered:** `HeroImage` wrapping `FigureImage`. Rejected: it would duplicate the `<figure>`/caption structure and the image element just to set three attributes.

### Decision 2: Hero variant width set is 400-3200

**Rationale:** The existing 400/800/1200/1600 set is right for inline content. A full-bleed hero on a retina display benefits from 2400 and 3200 candidates. Small variants still cost only HTML bytes and help narrow mobile layouts.

### Decision 3: Blur-up placeholder sits behind a visible real image

**Rationale:** The common blur-up pattern starts the real image at `opacity: 0` and fades it in on load. In a prerendered site that hides the hero until hydration and breaks no-JS rendering. Instead the placeholder is an absolutely positioned, `aria-hidden` blurred `<img>` behind the real image; the real image is always visible. `onLoad` removes the placeholder so it does not linger in the DOM.

The placeholder URL is the same source with `w_40,e_blur:1000,q_auto,f_auto`, which Cloudinary generates on demand at ~1KB.

### Decision 4: `fetchpriority` is exposed as `fetchPriority`

**Rationale:** React's JSX attribute is camelCase; the DOM output is `fetchpriority`. Modern browsers support it and no fallback is needed; `loading="eager"` guarantees eager loading regardless.

### Decision 5: `sizes` defaults are context-aware

**Rationale:** A detail hero is `(min-width: 1024px) 1024px, 100vw`; inline article images are `(min-width: 768px) 720px, 100vw`; tiles pass their own column-aware hint. The caller can override `sizes`; the component picks the right default from `priority`.

### Decision 6: `f_auto,q_auto` join the transform segment

**Rationale:** Width orchestration alone does not negotiate format or quality. Generated variants use `c_scale,w_<N>,f_auto,q_auto`. The existing `TRANSFORM_SEGMENT` guard recognizes the segment so re-processing an already-transformed URL is a no-op. The canonical inline requirement still names the four `c_scale,w_<N>` widths; format/quality tokens are additive.

### Decision 7: Hook wraps the pure helpers

**Rationale:** `useCloudinaryImage(src, { widths, sizes })` returns `{ src, srcSet, sizes, lqip, isCloudinary }` and memoizes the variant math. It delegates to the existing pure functions, so tests can cover both layers and non-React callers keep working. `FigureImage` and `TileMedia` use the hook; the pure helpers stay exported.

## Risks / Trade-offs

- **[Risk] Cloudinary free tier is 25k transformations/month** → At this content volume and traffic, `f_auto,q_auto` plus width variants stay well within it. If traffic grows, move to Ghost's native CDN or self-host.
- **[Risk] A LQIP adds one tiny request per priority hero** → ~1KB and cached by the CDN; the LCP win outweighs it.
- **[Risk] The load event may have fired before hydration for a cached image** → The placeholder is behind the real image and invisible, so a missed removal has no visual effect; only a small dead node remains.
- **[Risk] `fetchpriority="high"` is advisory** → Acceptable: `loading="eager"` still guarantees eager loading.
- **[Risk] Wider variants increase Cloudinary cache entries** → Each variant is cached individually; first visitor pays, later visitors hit the CDN.

## Migration Plan

1. Correct the change artifacts (scope, prop names, descriptors) — no runtime change.
2. Extend `src/components/content/lib/cloudinary.ts` with hero widths, `f_auto,q_auto`, LQIP generation, and `useCloudinaryImage`.
3. Extend `FigureImage` with `priority`, `sizes`, `aspectRatio`, and the blur-up layer.
4. Pass `priority` and the hero `sizes` from `ArticleHeader`; switch `TileMedia` to the hook.
5. Add tests for hero variants, priority attributes, format tokens, LQIP, and fallbacks; update the README.
6. Verify with lint/typecheck/tests, a production prerender, and a DevTools check of the emitted attributes.
7. Archive the change and sync the new capability with the `openspec-sync-specs` workflow.

No data migration is required.
