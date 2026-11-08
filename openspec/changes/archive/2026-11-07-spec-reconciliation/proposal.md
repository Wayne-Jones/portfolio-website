## Why

The canonical specs describe the site as it was planned, not as it now ships. `detail-routes` was archived with four new capabilities, but the older capabilities still claim placeholder routes, omit photography detail prerendering, have no sitemap/RSS requirement, and describe view transitions only as "unique names" rather than matched source/destination pairs. `content-adapter` also omits the `Photo` display type and the one-photo-per-set behavior that keeps transition names unique.

Left alone, the specs disagree with the code in ways that mislead future changes: a reader would not know feeds exist, would think every route is a placeholder, and could add a second featured photo per set and break `photo-<slug>` uniqueness.

## What Changes

- **`ssg-build`** — enumerate photography detail routes in `prerender.pages`; add the missing sitemap/RSS requirement (both output directories, site-origin resolution, RSS 2.0 with `<dc:creator>`).
- **`project-scaffold`** — replace "placeholder routes for all four pages" with the real route inventory; refresh the folder structure and dependency wording.
- **`view-transitions`** — require matching source/destination names per content type (`blog-<slug>`, `work-tile-<slug>`, `photo-<slug>`) and document the uniqueness constraint.
- **`content-renderer`** — correct the lazy-loading scenario (no eager/priority prop exists) and record that article chrome lives outside the renderer.
- **`content-adapter`** — document the `Photo` type and the one-featured-photo-per-set contract, and correct the static adapter's featured-subset scenario.
- **README** — correct the `/photography` route description.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ssg-build`
- `project-scaffold`
- `view-transitions`
- `content-renderer`
- `content-adapter`

## Impact

- Documentation and specs only; no runtime or build behavior changes.
- The four detail-route capabilities stay as archived; this change updates the older capabilities they depend on.

### Out of scope

- Build hygiene: `prebuild` → `pnpm snapshot` still rewrites the committed snapshot when Ghost env vars are absent, which contradicts `ssg-build`'s "fails with a clear error" scenario. That is a code change, tracked separately.
- The `image-optimization` change's own spec defects (`node` vs `image` prop, mixed `w` + `2x` descriptors, fixed-aspect premise).
- Implementing the `/photography` index listing; this change only stops the README from claiming it already exists.
