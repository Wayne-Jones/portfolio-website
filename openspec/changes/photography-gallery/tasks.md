## 1. Gallery Implementation

- [x] 1.1 Replace the `/photography` placeholder with a loader that calls `contentService.getPhotoSets()`
- [x] 1.2 Add `src/components/photography/PhotoSetGallery.tsx` and `PhotoSetTile.tsx` with masonry columns, cover/first-image fallback, metadata, and `photo-<slug>` names
- [x] 1.3 Render an explicit empty state when the service returns no sets
- [x] 1.4 Render the featured image in `src/components/home/photography/PhotoTile.tsx`

## 2. Documentation

- [x] 2.1 Update the README route table now that `/photography` renders the set gallery

## 3. Verification

- [x] 3.1 `pnpm exec tsc -b`, `pnpm lint`, `pnpm format:check`, `pnpm test`
- [x] 3.2 `VITE_CMS= pnpm dev`: `/photography` lists both sets with covers and links; homepage tiles show images
- [x] 3.3 `pnpm exec vite build`: `/photography/index.html` prerenders and contains both set links

## 4. Archive

- [ ] 4.1 Archive `photography-gallery`, syncing the new capability into `openspec/specs/` with the `openspec-sync-specs` workflow
- [ ] 4.2 `pnpm exec openspec validate --specs --strict`
