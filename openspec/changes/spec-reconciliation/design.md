## Context

`detail-routes` shipped a large slice of the site: blog, portfolio, and photo-set detail routes, pagination, 404 handling, sitemap/RSS output, and the photo-tile → photo-set link. Its deltas added four new capabilities but deliberately left the pre-existing canonical specs untouched so the change stayed reviewable. The archive then synced only those four new capabilities, so the older specs still describe the scaffold-era site.

This change closes that gap. It is docs-only: every delta should describe behavior that already exists in `main`, with two intentional exceptions noted below.

## Goals / Non-Goals

**Goals**

- Make `ssg-build`, `project-scaffold`, `view-transitions`, `content-renderer`, and `content-adapter` match `main`.
- Keep each requirement at one behavior so future changes can modify it without rewriting unrelated scenarios.
- Leave the archived detail-route capabilities untouched.

**Non-Goals**

- Fixing the build-hygiene defect where `prebuild` writes mock data when Ghost is unreachable.
- Implementing the `/photography` index listing.
- Correcting the `image-optimization` specs; that change will revise its own deltas.

## Decisions

### 1. One reconciliation change, not edits inside `detail-routes`

`detail-routes` is archived and its deltas are already synced. Editing archived artifacts would rewrite history; a dedicated change keeps the delta reviewable and lets the canonical specs evolve independently.

### 2. Document only behavior that exists

The reconciliation is not a wish list. The following are therefore written as current behavior:

- Photography detail routes are prerendered; they already are (`prerender.pages` includes them).
- Feeds are emitted to both output directories; they already are.
- Featured photos are one per set with `setSlug`; all three adapters already do this.

Two places where reality is weaker than the old spec:

- **`content-renderer`**: the old scenario claimed an `eagerly`-flagged caller could opt out of lazy loading, but `FigureImage` has no such prop. The scenario is reduced to the behavior that exists. Eager hero loading remains the responsibility of the `image-optimization` change and will be specified there.
- **`project-scaffold`**: the `/photography` index route exists but still renders placeholder copy. The spec requires only that the route resolves; the README is corrected to stop calling it a masonry gallery.

### 3. Keep the prebuild contradiction visible

`ssg-build` currently says the snapshot step fails loudly when Ghost is unreachable, while `pnpm snapshot` actually writes mock content. Rewriting that requirement to match the workaround would make the defect look intentional. It stays as-is and is listed as out of scope until the build-hygiene change lands.

### 4. Article chrome gets its own boundary requirement

The renderer tests already treat `PostBody` as the only content-tree consumer. Making that explicit prevents route chrome (headers, bylines, chips, listings) from leaking into the renderer as it grows.

### 5. Update README in the same change

The README's `/photography` row is the only user-facing claim that is actively false. Fixing it alongside the spec deltas keeps docs and specs consistent in one review.

## Risks / Trade-offs

- **Risk:** canonical specs now encode a placeholder `/photography` index. → **Mitigation:** the spec requires the route, not its copy; the README says the listing is not implemented.
- **Risk:** the `ssg-build` feed requirement duplicates detail-route behavior. → **Mitigation:** it describes the build artifact contract, while `paginated-listing` describes URL behavior; they reference different concerns.
- **Risk:** future changes may reintroduce stale version lists in `project-scaffold`. → **Mitigation:** the dependency scenario now defers to `package.json` instead of enumerating versions.

## Migration Plan

1. Author the five delta specs and the README correction.
2. `openspec validate spec-reconciliation --strict`.
3. Archive the change (which merges the deltas into `openspec/specs/`).
4. `openspec validate --specs --strict`.

No code migration is required.

## Open Questions

None. If the `/photography` listing is desired before this archive, it should be its own change, not part of the reconciliation.
