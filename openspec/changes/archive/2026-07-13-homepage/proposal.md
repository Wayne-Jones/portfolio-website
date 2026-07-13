## Why

The portfolio site currently ships a placeholder homepage ("Coming soon") and needs a real, distinctive landing experience that establishes Wayne Jones as both a web developer and photographer. This change replaces the placeholder with a fully designed homepage that introduces the work, showcases a curated photography set, surfaces recent writing, and closes with a contact prompt — all while honoring the project's existing theme tokens, accessibility foundation, and view-transitions infrastructure.

## What Changes

- Replace the placeholder homepage route (`src/routes/index.tsx`) with a structured homepage composed of: hero, work portfolio, photography, recent blog posts, and contact footer.
- Add new homepage-specific components under `src/components/home/` for hero, section primitives, work tile, photo tile, blog card, and footer.
- Add a homepage content adapter that supplies realistic placeholder data (project names, photo captions, blog post titles) sourced from the existing `src/content/adapters/` pattern.
- Add a homepage skeleton loading state using a shimmer animation.
- Add a homepage motion system using the existing view-transitions infrastructure for click-through navigation and lightweight scroll-triggered reveals.
- Integrate the homepage with the existing navigation in `src/routes/__root.tsx` (logo + Work / Photography / Blog links).
- Add a portrait placeholder asset under `public/` (to be replaced with a real photo later).

## Capabilities

### New Capabilities

- `homepage-hero`: Hero section with intro line, two-line headline (solid + outlined), location, and overlapping portrait.
- `homepage-sections`: Section primitives and content sections — Work Portfolio, Photography, Recent Blog Posts, Contact footer.
- `homepage-motion`: Scroll-triggered reveals and view-transitions integration for click-through navigation.
- `homeplace-content`: Homepage placeholder content adapter with realistic copy and shimmer skeleton states.

### Modified Capabilities

- `view-transitions`: Add homepage-specific transition names so clicking a work tile or photo tile animates into the destination route.
- `content-adapter`: Add a homepage-specific content shape and adapter for placeholder projects, photos, and blog posts.

## Impact

- **Routes**: `src/routes/index.tsx` rewritten; `src/routes/__root.tsx` may receive minor nav updates.
- **Components**: New files under `src/components/home/`.
- **Content**: New adapter under `src/content/adapters/homepage.ts` (or similar) following the existing mock/ghost adapter pattern.
- **Assets**: New placeholder portrait under `public/`.
- **Styles**: New homepage-specific CSS leveraging existing theme tokens (`@theme` block) — no new tokens required.
- **Accessibility**: All new components must meet WCAG AAA contrast (per existing theme spec) and honor `prefers-reduced-motion`.
- **Dependencies**: No new external dependencies. Reuses existing TanStack Router, Tailwind v4, and view-transitions setup.
