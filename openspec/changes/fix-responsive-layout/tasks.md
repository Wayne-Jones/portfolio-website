# Tasks

## 1. Remove the scaffold stylesheet

- [ ] 1.1 Grep `src/` for `#root`, `--text`, `--border`, `--code-bg`, `.counter`, and `#social` and confirm only `src/index.css` references them
- [ ] 1.2 Delete `src/index.css` and remove its import from `src/routes/__root.tsx`; verify `pnpm build` succeeds and `pnpm test` still passes
- [ ] 1.3 Verify in the browser at 1024px and 1025px that the root font size no longer steps between 16px and 18px and that `p-4` measures 16px at both widths

## 2. Fluid typography and spacing

- [ ] 2.1 Replace the `≥64rem` body font-size media query in `src/styles/globals.css` with a `clamp()` value anchored at `1rem`; verify computed body size is continuous across 1024/1025px
- [ ] 2.2 Add a Vitest test that reads `globals.css` and `__root.tsx` and asserts `--spacing: 0.5rem`, no `index.css` import, and `clamp(` on the responsive body/hero sizes; verify `pnpm test` passes

## 3. Header and hero at narrow widths

- [ ] 3.1 Update the header in `src/routes/__root.tsx` so the nav list wraps instead of widening the document; verify at 320px that all four links are present and the document width equals the viewport
- [ ] 3.2 Replace the hero `<h1>` fixed sizes and `whitespace-nowrap` in `src/components/home/hero/Hero.tsx` with a fluid `clamp()` size that keeps both lines inside the container; verify at 320px that no line clips or overlaps and `scrollWidth <= innerWidth`

## 4. Full-bleed gutter

- [ ] 4.1 Introduce a `--page-gutter` value on the page container in `src/routes/__root.tsx` and drive both `<main>` padding and the `footerFullBleed` negative margin from it in `src/components/article/ArticleLayout.tsx` (with a fallback value); verify a photo-set detail page at 320px has no horizontal overflow
- [ ] 4.2 Change the page gutter at a breakpoint and confirm the full-bleed grid still aligns with the container edges

## 5. Integration verification

- [ ] 5.1 Run `pnpm exec tsc -b`, `pnpm lint`, `pnpm format:check`, and `pnpm test`
- [ ] 5.2 Sweep 320px, 360px, 768px, 1024px, and 1025px on `/`, `/portfolio`, `/photography`, `/blog`, and one detail route; record that `documentElement.scrollWidth <= innerWidth` at every width
- [ ] 5.3 Run `pnpm exec vite build` and confirm the prerendered pages contain the updated class names and no scaffold stylesheet

## Workflow follow-up

- Archive `fix-responsive-layout` after review, syncing `responsive-layout` and the `theme-tokens` delta into `openspec/specs/`.
- Verify the archived result with `openspec validate`.
