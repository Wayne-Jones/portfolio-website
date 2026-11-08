## 0. Artifact Correction

- [x] 0.1 Correct the delta spec to use `w` descriptors, the `image` prop, and no fixed-hero-aspect premise
- [x] 0.2 Drop the `BackgroundImage` scope (no CSS-background image contexts remain) and fold hero behavior into `FigureImage`
- [x] 0.3 Re-align proposal, design, and tasks with the current `ArticleHeader` → `FigureImage` and `TileMedia` structure

## 1. Cloudinary Helpers and Hook

- [x] 1.1 Add `CLOUDINARY_HERO_WIDTHS` (`400`, `800`, `1200`, `1600`, `2400`, `3200`) and a hero default width
- [x] 1.2 Add `f_auto,q_auto` to generated transform segments while keeping already-transformed URLs untouched
- [x] 1.3 Add `cloudinaryLqip(src)` for the `w_40,e_blur:1000,q_auto,f_auto` placeholder
- [x] 1.4 Add `HERO_IMAGE_SIZES` alongside `CONTENT_IMAGE_SIZES`
- [x] 1.5 Add `useCloudinaryImage(src, options)` returning `{ src, srcSet, sizes, lqip, isCloudinary }` and delegating to the pure helpers

## 2. FigureImage Extensions

- [x] 2.1 Add `priority?: boolean`, `sizes?: string`, and `aspectRatio?: string` props (all optional; defaults unchanged)
- [x] 2.2 Emit the six-width hero srcset when `priority` is true and the four-width inline srcset otherwise
- [x] 2.3 Set `fetchPriority="high"`, `loading="eager"`, `decoding="sync"` for priority images; keep lazy/async for inline images
- [x] 2.4 Reserve layout from the node's `width`/`height`, or apply the `aspectRatio` override with `object-cover`
- [x] 2.5 Render the LQIP placeholder behind the real image for priority Cloudinary sources and remove it on load
- [x] 2.6 Keep the caption and the existing `<figure class="my-8">` structure

## 3. Consumers

- [x] 3.1 Pass `priority` and `HERO_IMAGE_SIZES` from `ArticleHeader` so blog, portfolio, and photo-set heroes opt in
- [x] 3.2 Switch `TileMedia` to the hook without changing lazy-loading or placeholder behavior
- [x] 3.3 Confirm the `blog-<slug>`, `work-tile-<slug>`, and `photo-<slug>` view transitions still resolve

## 4. Tests

- [x] 4.1 Update existing Cloudinary tests for the `f_auto,q_auto` token
- [x] 4.2 Add tests for the six hero widths, priority attributes, and hero `sizes` default
- [x] 4.3 Add tests for the LQIP placeholder (priority Cloudinary only) and non-Cloudinary fallbacks
- [x] 4.4 Add tests for the `aspectRatio` override and intrinsic width/height pass-through

## 5. Verification

- [x] 5.1 `pnpm exec tsc -b`, `pnpm lint`, `pnpm format:check`, `pnpm test`
- [x] 5.2 `pnpm exec vite build` and confirm a prerendered detail hero emits eager/priority attributes (Cloudinary srcset and LQIP are covered by tests)
- [x] 5.3 Confirm inline post images still emit four widths, lazy loading, and no placeholder
- [x] 5.4 Inspect a homepage/`/photography` tile to confirm `TileMedia` output is unchanged apart from format tokens

## 6. Documentation

- [x] 6.1 Update the README Cloudinary section with the inline vs hero variant sets, `f_auto,q_auto`, and LQIP behavior
- [x] 6.2 Document `VITE_CLOUDINARY_CLOUD_NAME` and the Cloudinary free-tier note

## 7. Archive

- [ ] 7.1 Archive `image-optimization`, syncing the new capability into `openspec/specs/` with the `openspec-sync-specs` workflow
- [ ] 7.2 `pnpm exec openspec validate --specs --strict`
