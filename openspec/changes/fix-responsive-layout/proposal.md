## Why

The site breaks down at the edges of its breakpoint range. At a 320px viewport the document is 423px wide, so every page scrolls sideways; the header nav and the hero headline are the visible cause. At the 1024px → 1025px boundary the root font size jumps from 16px to 18px because the pre-scaffold `src/index.css` is still imported ahead of the Tailwind layer, and its `:root` font shorthand also forces a 16px spacing base that contradicts the documented 8px `--spacing` token. The result is a one-pixel-wide layout jump plus spacing utilities that render 8px below the breakpoint and 9px above it.

## What Changes

- Remove the leftover Vite scaffold stylesheet (`src/index.css`) and its import in `src/routes/__root.tsx`, so `globals.css` is the single source of base typography and spacing.
- Re-express the desktop body type step (`1.125rem` at `≥64rem`) and hero display sizes as fluid `clamp()` values so no breakpoint introduces a font-size discontinuity.
- Normalize spacing to a true 8px base: `--spacing: 0.5rem` stays the root-relative scale, and the documented `p-4 = 16px` behaviour is restored once the scaffold `font: 18px/145%` shorthand is gone.
- Make the primary header wrap/shrink safely below 360px: allow the nav list to wrap or scroll and keep the links from forcing overflow. (Target-size requirements belong to `improve-accessibility`.)
- Remove the `whitespace-nowrap` fixed-size hero headline in favour of a fluid size that fits the viewport at 320px.
- Replace the brittle `-mx-3` full-bleed footer with a container-aware bleed based on the page gutter, so the photo-set grid cannot overflow when the main padding changes.
- Add responsive regression coverage for 320px, 360px, 768px, 1024px, and 1025px widths.

## Capabilities

### New Capabilities

- `responsive-layout`: viewport-safe page shell, header navigation, full-bleed regions, and breakpoint behaviour across the supported width range.

### Modified Capabilities

- `theme-tokens`: remove the conflicting scaffold root styles, make the type scale fluid through the desktop breakpoint, and guarantee the 8px spacing base at every viewport.

## Impact

- `src/routes/__root.tsx` (stylesheet imports, header, footer gutters)
- `src/index.css` (deleted)
- `src/styles/globals.css` (base typography, spacing)
- `src/components/home/hero/Hero.tsx` (headline sizing and wrapping)
- `src/components/article/ArticleLayout.tsx` (full-bleed footer)
- Tests for responsive layout and token values
- No API, data, or dependency changes
