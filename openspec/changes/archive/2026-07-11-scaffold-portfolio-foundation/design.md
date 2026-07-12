## Context

The portfolio website repo is empty (only `.git/`). This first change establishes the foundational architecture that all subsequent pages will build upon. The design must balance:

- **Speed of iteration** — subsequent changes should be able to focus on page-specific concerns without re-litigating tooling
- **CMS portability** — the user wants to be able to swap Ghost for another CMS without rewriting components
- **Studio-craft aesthetic** — must avoid default shadcn/SaaS gradient look
- **Accessibility baseline** — WCAG 2.2 AAA contrast, keyboard navigation, screen reader support, reduced motion respect

## Goals / Non-Goals

**Goals:**

- Establish a runnable Vite + React + TypeScript project with TanStack Router
- Implement a CMS-agnostic content adapter pattern (Ghost adapter as first implementation)
- Set up Tailwind v4 design tokens that encode the visual system
- Wire View Transitions API for fluid navigation
- Establish accessibility patterns that all pages inherit

**Non-Goals:**

- Building any actual page design (Homepage, Portfolio, Photography, Blog are subsequent changes)
- Implementing real Ghost content fetching (adapter uses mock data initially; real fetch is a follow-up)
- Server-side rendering or static generation (out of scope for this change; can be added later via `vite-plugin-prerender`)
- Form components, search, or interactive features (deferred to later changes)

## Decisions

### Decision: Vite + TanStack Router (SPA)

**Rationale**: Pure SPA gives the cleanest View Transitions API integration (no SSR hydration caveats). TanStack Router provides type-safe, code-split routing. SEO is acceptable for a personal portfolio — can be addressed later with prerendering.

**Alternatives considered**:

- Next.js (App Router): Best SEO out of the box, but View Transitions require extra care with SSR hydration. Overkill for a personal portfolio.
- Astro + React islands: Best raw performance, but shadcn/ui integration is awkward (islands model doesn't match component-heavy UI patterns).

### Decision: Content Adapter Pattern (CMS-agnostic)

**Rationale**: User explicitly wants to be able to swap CMS. The adapter pattern keeps Ghost-specific code isolated and makes future swaps (Sanity, Contentful, Strapi) a matter of writing a new adapter.

**Structure**:

```
src/content/
  types.ts          ← canonical Post, Project, PhotoSet types
  index.ts          ← exports contentService based on env
  adapters/
    ghost.ts        ← Ghost Content API → canonical types
    mock.ts         ← mock data for development
```

**Alternatives considered**:

- Direct Ghost API calls in components: Faster to write initially, but locks the entire app to Ghost's data shape.
- GraphQL with a single schema: More flexible, but adds complexity and a build-time GraphQL step. Overkill for four pages.

### Decision: Tag-based Content Separation

**Rationale**: Ghost's tag system is the simplest way to separate portfolio/photography/blog content. Tags are a near-universal CMS concept, so the pattern stays portable.

**Mapping**:

- `#portfolio` tag → `Project` type → `/portfolio` route
- `#photography` tag → `PhotoSet` type → `/photography` route
- No tag (or `#blog`) → `Post` type → `/blog` route

### Decision: Tailwind v4 with `@theme` Block

**Rationale**: v4's `@theme` block makes design tokens first-class CSS. Tokens become utilities automatically (`text-fg`, `bg-bg`, etc.). No `tailwind.config.js` needed.

**Alternatives considered**:

- CSS Modules: More isolation, but loses Tailwind's utility ergonomics.
- Vanilla Extract: Type-safe CSS, but adds build complexity.

### Decision: Switzer + Inter Typeface Pairing

**Rationale**: Switzer has editorial character at display sizes without being decorative. Inter handles UI/body with neutrality. Both are free and self-hostable via `@fontsource` (no Google Fonts CLS, no third-party request).

**Alternatives considered**:

- Montserrat + Inter: Common pairing, reads as default.
- IBM Plex Sans + Mono: Cohesive single-family system, but less editorial character.
- Inter alone: Workhorse but generic without careful styling.

### Decision: View Transitions API (Native, No Library)

**Rationale**: The browser API is now well-supported (Chrome, Edge, Safari TP). No need for a library. TanStack Router's instant client transitions pair naturally with `document.startViewTransition()`.

**Implementation**: Wrap route changes in a view transition call. Use `view-transition-name` CSS property on elements that should morph between routes (e.g., project card → case study detail).

### Decision: shadcn/ui with Base UI Primitives

**Rationale**: Base UI is the unstyled successor to Radix UI from the same team. shadcn/ui is migrating toward Base UI. Components are copy-paste/owned-in-repo, so they can be restyled to match the studio-craft aesthetic.

**Alternatives considered**:

- Radix UI: Mature but being superseded by Base UI.
- Headless UI: Solid but less flexible styling API.

## Risks / Trade-offs

- **SPA SEO risk** → Mitigation: Add `vite-plugin-prerender` in a follow-up change to generate static HTML for each route at build time. Ghost content is available at build time, so prerendering is straightforward.

- **View Transitions browser support** → Mitigation: Feature-detect with `document.startViewTransition`. Fall back to instant transitions on unsupported browsers. `prefers-reduced-motion` is respected automatically.

- **Content adapter indirection** → Mitigation: Cost is one extra layer between Ghost and components. For four pages, this is negligible. Adapter pattern means future CMS swap is a contained change.

- **Tailwind v4 is newer** → Mitigation: v4 is stable (released early 2025). `@theme` syntax is documented. If issues arise, fallback to v3 is possible (but unlikely needed).

- **shadcn/ui + Base UI migration in progress** → Mitigation: Pin to specific Base UI versions. shadcn CLI handles the registry correctly. If Base UI APIs change, update components incrementally.

## Migration Plan

This is the first change — no migration needed. Subsequent changes will build on this foundation.

## Open Questions

- **Hero composition**: Single column at all breakpoints (my lean) vs two-column on desktop? — _Deferred to Homepage change_
- **Typeface confirmation**: Switzer + Inter (confirmed) ✓
- **Real Ghost fetch timing**: Mock data for this change, real fetch in Homepage change? — _To be decided during implementation_
