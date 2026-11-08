## Why

`/photography` is still the scaffold placeholder (`Photo sets coming soon.`). It is the only route that never received its real UI. The intended page is a masonry gallery of photo sets — cover image, title, and capture metadata — with each tile linking to the set detail.

The homepage preview also renders blank aspect-ratio blocks: `PhotoTile` never displays `Photo.src`, even though the snapshot now carries Unsplash covers. Visitors see linkable empty tiles instead of the featured photograph.

## What Changes

- Replace the `/photography` placeholder with a gallery that loads `contentService.getPhotoSets()` and renders one masonry tile per set.
- Each tile shows the set's `coverImage` (or first image), title, and `location · camera` metadata, and links to `/photography/<slug>` with `view-transition-name: photo-<slug>`.
- Render the featured photo in the homepage `PhotoTile` so the preview shows the actual image; keep the existing `photo-<slug>` link and transition name.
- Add an explicit empty state when no sets exist.
- Use the existing Cloudinary helpers (`cloudinarySrcSet` / `cloudinaryDefaultSrc`) so covers get responsive `srcset` when served from Cloudinary, with lazy loading otherwise.
- Update the README route table now that the gallery exists.

## Capabilities

### New Capabilities

- `photography-gallery`: the `/photography` set index and the homepage photography preview that renders featured photos.

### Modified Capabilities

None.

## Impact

- `src/routes/photography.index.tsx` becomes a real route with a loader.
- New component under `src/components/photography/`.
- `src/components/home/photography/PhotoTile.tsx` renders an `<img>`.
- No pagination: photo sets are curated; pagination can be added if the collection grows.
- No new dependencies.
