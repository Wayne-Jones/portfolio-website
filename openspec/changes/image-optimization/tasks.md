## 1. Hook Refactor

- [ ] 1.1 Create or extend `src/components/content/lib/cloudinary.ts` to host `useCloudinaryImage(url, options)` hook
- [ ] 1.2 Move Cloudinary URL transformation logic from `FigureImage` into the hook
- [ ] 1.3 Detach the env-var lookup (`VITE_CLOUDINARY_CLOUD_NAME`) into a single helper that both the hook and `BackgroundImage` reuse

## 2. FigureImage Extensions

- [ ] 2.1 Add `priority?: boolean` prop to `FigureImage` (default false)
- [ ] 2.2 Add `sizes?: string` prop to `FigureImage` for caller override, with sensible default
- [ ] 2.3 When `priority` is true, emit `srcset` with widths `400, 800, 1200, 1600, 2400, 3200`; otherwise emit `400, 800, 1200, 1600`
- [ ] 2.4 When `priority` is true, set `fetchPriority="high"`, `loading="eager"`, `decoding="sync"`; otherwise current behavior (lazy + async)
- [ ] 2.5 Maintain backward-compatible default — existing callers see no behavior change

## 3. HeroImage Component

- [ ] 3.1 Create `src/components/content/nodes/HeroImage.tsx` exporting `<HeroImage node={...} aspect="..." alt="..." />`
- [ ] 3.2 HeroImage takes a `ContentTree image` node and renders a wrapper with `aspect-ratio` styling from `aspect` prop
- [ ] 3.3 Render the blur-up placeholder `<img>` first (tiny blurred Cloudinary variant)
- [ ] 3.4 Render the real `<FigureImage priority={true}>` alongside with onload fades the placeholder out
- [ ] 3.5 Use `useState` to track loaded state; `onLoad` clears placeholder
- [ ] 3.6 Decide empty-alt fallback: if `node.alt` is empty, the wrapper gets `aria-hidden="true"` (decorative-only image)

## 4. BackgroundImage Component

- [ ] 4.1 Create `src/components/content/nodes/BackgroundImage.tsx`
- [ ] 4.2 Apply inline `style={{ backgroundImage: 'url(...)' }}` with optimized URL via the Cloudinary hook
- [ ] 4.3 Add baseline `background-size: cover` and `background-position: center`
- [ ] 4.4 Skip rendering when `src` is empty

## 5. Detail Route Updates

- [ ] 5.1 Update blog detail (`blog.$slug.tsx`) hero: use `<HeroImage>` instead of plain `<img>` for the feature image
- [ ] 5.2 Update portfolio detail hero: same
- [ ] 5.3 Update photo set detail cover: same
- [ ] 5.4 Verify the view-transition morph still works with the new wrapper

## 6. Verification

- [ ] 6.1 Run `pnpm lint` and `pnpm build` clean
- [ ] 6.2 Run `pnpm preview` and inspect hero image elements in DevTools: confirm `srcset` for hero has 6 widths, `fetchpriority="high"` set
- [ ] 6.3 Run `pnpm preview` and inspect an inline post image: confirm existing 4-width `srcset` still emitted, lazy loading still default
- [ ] 6.4 Visual QA via Chrome DevTools: hero on detail page renders quickly with blur-up placeholder briefly visible
- [ ] 6.5 Run a Lighthouse performance audit (or DevTools Performance) on a detail page; confirm LCP improves compared to the in-development no-optimization baseline
- [ ] 6.6 Manually load the site on a 1x / 2x simulated device and verify the right `srcset` candidate loads

## 7. Documentation

- [ ] 7.1 Update README with the image-optimization strategy summary
- [ ] 7.2 Document `VITE_CLOUDINARY_CLOUD_NAME` env var and how to obtain it
- [ ] 7.3 Add a note in README about Cloudinary free-tier limits and when to migrate (e.g., to Ghost native CDN)
