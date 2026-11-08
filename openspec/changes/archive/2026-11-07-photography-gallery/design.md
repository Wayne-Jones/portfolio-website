## Context

`/photography` is the last scaffold placeholder. The homepage already has a CSS-columns masonry of `Photo` objects produced by `getFeaturedPhotos()` (one per set, with `setSlug`), so the shell and link target exist. What is missing is:

- the index route that lists all sets, and
- an actual `<img>` in `PhotoTile` (it only renders an aspect-ratio background block today).

The photo-set snapshot now carries covers and images, so both can render real photography without a CMS connection.

## Goals / Non-Goals

**Goals**

- `/photography` renders every photo set as a masonry tile with a cover, title, and metadata.
- Each tile links to `/photography/<slug>` and shares the `photo-<slug>` transition name with the detail hero.
- The homepage preview shows the featured image instead of an empty block.
- An explicit empty state exists for a site with no sets.

**Non-Goals**

- Pagination for photo sets (curated collection; add only if it grows).
- Hero/LCP image optimization (`image-optimization` owns priority hints and blur-up).
- Filtering or sorting controls.

## Decisions

### 1. Route-level component under `src/components/photography/`

The homepage keeps its section component under `src/components/home/photography/`. The index gallery is route-level, so `PhotoSetGallery` / `PhotoSetTile` live in `src/components/photography/` and take data as props. This mirrors the split between `src/components/article/` (route chrome) and `src/components/home/` sections.

### 2. Shared media frame, distinct tile chrome

The image/placeholder frame is shared with the homepage through `src/components/photography/TileMedia.tsx`, so Cloudinary detection, lazy loading, and the no-image placeholder exist once. `PhotoSetTile` adds the title/metadata and its own link; `PhotoTile` keeps the homepage hover overlay. They are not merged because they render different inputs (`PhotoSet` vs `Photo`) and different chrome.

`FigureImage` is not used here because it wraps images in a `<figure class="my-8">`, which fights a tile grid. `TileMedia` uses `cloudinarySrcSet` / `cloudinaryDefaultSrc` directly, so covers get responsive variants when they come from Cloudinary and fall back to the original URL otherwise.

### 3. CSS columns for masonry

The homepage already uses `columns-2 md:columns-3` with `break-inside-avoid`. The index uses `columns-1 sm:columns-2 lg:columns-3` at the wider container, keeping the same visual language without a layout library.

### 4. Preserve service order

The content service controls ordering; the gallery does not sort. This keeps CMS-authored ordering authoritative.

### 5. Transition name on the link element

`PhotoTile` already puts `view-transition-name: photo-<slug>` on the `<Link>`. The index tile follows the same pattern so the morph matches the detail page regardless of which entry point the user comes from.

### 6. No pagination

`getPhotoSets()` is not paginated and the collection is small. Adding pagination would need a new URL scheme and prerender enumeration for little benefit; it can be added later as its own change.

## Risks / Trade-offs

- **Risk:** a set without a cover or images renders an empty tile. → **Mitigation:** the tile renders a neutral aspect-ratio block and still shows the title and link.
- **Risk:** Unsplash covers are plain URLs, so no `srcset` until they move to Cloudinary. → **Mitigation:** the helpers already no-op on non-Cloudinary URLs; `image-optimization` covers the rest.
- **Risk:** masonry columns reorder visually by column. → **Mitigation:** this matches the existing homepage behavior; no interaction depends on reading order.

## Migration Plan

1. Implement the route, gallery components, and homepage tile image.
2. Update the README route table.
3. Verify dev (`/photography`, homepage tiles) and a production build.
4. Archive the change so the new capability is synced into `openspec/specs/` with the `openspec-sync-specs` workflow.

No data migration is required.
