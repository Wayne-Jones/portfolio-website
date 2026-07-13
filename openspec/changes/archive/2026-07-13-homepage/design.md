## Context

The portfolio site has a scaffolded foundation (theme tokens, shadcn-style UI primitives, view-transitions API, accessibility baseline, content adapter pattern) but only ships a placeholder homepage. This change introduces the first real page: a homepage that establishes Wayne Jones' dual identity (web developer + photographer) and surfaces curated work, photography, and writing.

The design follows a Bazil.fr-inspired hero (large two-line headline with mixed solid/outlined treatment, overlapping portrait) and an editorial section rhythm below. It deliberately avoids SaaS-look conventions: no drop shadows, generous whitespace, asymmetric work grid, mixed-aspect photography masonry, and small uppercase eyebrow labels with hairline rules.

The implementation must reuse existing infrastructure (TanStack Router, Tailwind v4 with `@theme` tokens, view-transitions API) and add no new external dependencies.

## Goals / Non-Goals

**Goals:**

- Deliver a distinctive, editorial homepage that doesn't read as a SaaS template.
- Establish a baseline homepage composition (hero + 4 sections) that subsequent changes can extend.
- Reuse existing theme tokens, accessibility patterns, and view-transitions infrastructure.
- Provide realistic placeholder content so the page looks intentional, not stubbed.
- Honor `prefers-reduced-motion` strictly across all motion.

**Non-Goals:**

- Real photography, project assets, or blog post content (placeholders only).
- A new top-level navigation system (integrate with existing nav in `__root.tsx`).
- New theme tokens (reuse existing `--color-*`, `--font-*`, spacing tokens).
- New external dependencies (no new libraries).
- A full CMS or content authoring flow (adapter pattern only).
- Per-project detail pages (link destinations exist but are out of scope for this change).

## Decisions

### Decision 1: Component composition under `src/components/home/`

**Rationale:** Mirrors the existing `src/components/ui/` convention. Keeps homepage-specific components colocated and discoverable. Each section becomes a folder (`hero/`, `work-portfolio/`, `photography/`, `blog/`, `contact-footer/`) with an index component and any sub-components.

**Alternatives considered:**

- Single `Homepage.tsx` monolith — rejected: harder to maintain, no reuse.
- Co-located with routes (`src/routes/index.tsx`) — rejected: mixes routing with presentation.

### Decision 2: Outlined text via `-webkit-text-stroke` with fallback

**Rationale:** Lightweight, works in Chromium/Safari, and degrades gracefully in Firefox (falls back to thin solid text). Avoids the overhead of SVG text rendering for what is essentially a single decorative treatment.

**Implementation:**

```css
.text-outline {
  -webkit-text-stroke: 1.5px currentColor;
  color: transparent;
}
```

Firefox fallback: a slightly thinner solid weight at lower opacity.

### Decision 3: Asymmetric work grid via CSS grid `grid-column: span`

**Rationale:** First work tile spans 2 columns on desktop, remaining tiles fill the rest. On mobile/tablet, all tiles collapse to single column. No JS needed — pure CSS keeps it cheap and SSR-friendly.

**Alternatives considered:**

- Flexbox with manual widths — rejected: harder to keep aligned.
- JS-driven layout (e.g., react-masonry) — rejected: overkill for 4 tiles.

### Decision 4: Photography masonry via CSS columns

**Rationale:** True masonry with mixed aspect ratios is best achieved with `column-count` + `break-inside: avoid`. Lightweight, no JS, works with SSR. Each photo is wrapped in a `<figure>` with intrinsic aspect ratio preserved.

**Alternatives considered:**

- CSS grid with `grid-row: span` — rejected: requires knowing tile heights upfront or JS measurement.
- react-masonry-css — rejected: adds a dependency for marginal benefit.

### Decision 5: Section reveals via IntersectionObserver

**Rationale:** Lightweight, no library needed. Each section gets a `data-reveal` attribute; an IntersectionObserver adds a `is-visible` class when 15% of the section enters the viewport. CSS handles the transition. Falls back to instant render when `prefers-reduced-motion: reduce`.

**Alternatives considered:**

- Framer Motion — rejected: new dependency, overkill.
- CSS-only with `animation-timeline: view()` — rejected: limited browser support currently.

### Decision 6: View transitions via existing `view-transitions` spec

**Rationale:** The project already has a view-transitions spec. We extend `view-transition-name` to work tiles and photo tiles so clicking animates the source tile into the destination page's hero image. Use `document.startViewTransition()` where appropriate.

### Decision 7: Skeleton shimmer via CSS animation

**Rationale:** Pure CSS keyframe animation on a gradient background. No JS. Respects `prefers-reduced-motion` by switching to a static gray fill.

### Decision 8: Realistic placeholder content via adapter

**Rationale:** Follow the existing `src/content/adapters/` pattern. Create `src/content/adapters/homepage.ts` exporting a typed shape with placeholder projects (e.g. "Northwind Studio", "Halcyon Coffee"), photos (e.g. "Brooklyn, 2025"), and blog posts (e.g. "Designing for the quiet web"). When real content arrives, swap the adapter.

### Decision 9: Hero portrait as a static placeholder

**Rationale:** SVG silhouette or grayscale placeholder image under `public/portrait-placeholder.svg`. Easy to swap later. Avoids loading a real photo that doesn't exist yet.

### Decision 10: Section label treatment

**Rationale:** Small uppercase eyebrow (`text-xs uppercase tracking-widest text-muted`) followed by a 1px hairline rule (`border-fg/10`) above each section title. Editorial, not SaaS.

## Risks / Trade-offs

- **[Risk] `-webkit-text-stroke` Firefox fallback looks different from Chromium** → Mitigation: accept the slight visual variance; document in component comments. Alternative is SVG text, but the cost outweighs the benefit for a single decorative use.
- **[Risk] CSS columns masonry can reorder items visually** → Mitigation: Acceptable for a curated photo set where strict reading order isn't required. If needed in future, switch to grid-row span.
- **[Risk] IntersectionObserver doesn't fire if user scrolls very fast or has JS disabled** → Mitigation: CSS uses `@media (prefers-reduced-motion: reduce)` to disable transition; without JS, content is visible immediately (no `opacity: 0` baseline).
- **[Risk] Placeholder content reads as fake** → Mitigation: Use realistic project names, photo locations, and blog titles that feel intentional. Add a small "Sample content" note in dev mode only.
- **[Risk] Hero portrait overlap breaks on very small viewports** → Mitigation: Below `sm` (640px), stack vertically (intro → headline → portrait). Tested via responsive variants.
- **[Risk] View transitions require same-origin and may not work in all browsers** → Mitigation: Existing view-transitions spec already accounts for this; we extend, not introduce.
